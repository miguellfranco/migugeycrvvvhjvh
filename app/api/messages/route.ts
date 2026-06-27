export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    const messages = await prisma.message.findMany({
      where: { userId: user.id },
      orderBy: { generatedAt: 'desc' },
      include: { lead: { select: { businessName: true, phone: true, niche: true, city: true, tier: true } } },
    })
    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        messageText: m.messageText,
        generatedAt: m.generatedAt.toISOString(),
        sentAt: m.sentAt ? m.sentAt.toISOString() : null,
        lead: m.lead
          ? { businessName: m.lead.businessName, phone: m.lead.phone, niche: m.lead.niche, city: m.lead.city, tier: m.lead.tier }
          : null,
      })),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
