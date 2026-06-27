export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401 })

  const body = await req.json().catch(() => ({}))
  const leadId = body?.leadId as string | undefined
  if (!leadId) return new Response(JSON.stringify({ error: 'Lead não informado' }), { status: 400 })

  const lead = await prisma.lead.findFirst({ where: { id: leadId, userId: user.id } })
  if (!lead) return new Response(JSON.stringify({ error: 'Lead não encontrado' }), { status: 404 })

  const prompt = `Você é um especialista em prospecção e vendas de sites para pequenos negócios no Brasil. Escreva uma mensagem de WhatsApp curta, pessoal e persuasiva (máximo 4 frases, tom amigável e profissional, em português do Brasil) para iniciar uma conversa com o seguinte negócio. Não use linguagem robótica. Use no máximo 1 emoji.

Negócio: ${lead.businessName}
Nicho: ${lead.niche ?? 'negócio local'}
Cidade: ${lead.city ?? ''}
Avaliação no Google: ${lead.rating ?? 'N/A'} estrelas (${lead.reviewCount ?? 0} avaliações)
Tem site: ${lead.hasWebsite ? 'sim' : 'não'}${lead.hasWebsite ? '' : ` (há ${lead.yearsWithoutSite ?? 'alguns'} anos sem site)`}

O objetivo é oferecer a criação de um site profissional. Destaque o ponto forte do negócio (boas avaliações) e a oportunidade perdida por não ter um site. Escreva apenas a mensagem, sem aspas nem explicações.`

  try {
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        max_tokens: 400,
      }),
    })

    if (!response.ok || !response.body) {
      const t = await response.text().catch(() => '')
      console.error('LLM error', response.status, t)
      return new Response(JSON.stringify({ error: 'Falha ao gerar mensagem (LLM API).' }), { status: 502 })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    let full = ''

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        let partial = ''
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            partial += decoder.decode(value, { stream: true })
            const lines = partial.split('\n')
            partial = lines.pop() ?? ''
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed.startsWith('data: ')) continue
              const data = trimmed.slice(6)
              if (data === '[DONE]') {
                // persist
                try {
                  await prisma.message.create({ data: { userId: user.id, leadId: lead.id, messageText: full } })
                  if (lead.status === 'novo') {
                    await prisma.lead.update({ where: { id: lead.id }, data: { status: 'mensagem_gerada' } })
                  }
                } catch (err) { console.error('persist msg', err) }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'completed' })}\n\n`))
                controller.close()
                return
              }
              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta?.content || ''
                if (delta) {
                  full += delta
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'processing', delta })}\n\n`))
                }
              } catch { /* skip */ }
            }
          }
          // stream ended without [DONE]
          if (full) {
            try {
              await prisma.message.create({ data: { userId: user.id, leadId: lead.id, messageText: full } })
              if (lead.status === 'novo') {
                await prisma.lead.update({ where: { id: lead.id }, data: { status: 'mensagem_gerada' } })
              }
            } catch (err) { console.error(err) }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'completed' })}\n\n`))
          controller.close()
        } catch (err) {
          console.error('stream error', err)
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: 'Erro interno ao gerar mensagem.' }), { status: 500 })
  }
}
