'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Sparkles, Loader2, Send, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader, EmptyState, TierBadge, TimeAgo, nicheIcon, NICHE_LABELS } from '@/components/lz/ui'

export default function MensagensPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [genId, setGenId] = useState<string | null>(null)
  const [genText, setGenText] = useState('')

  function load() {
    Promise.all([
      fetch('/api/messages').then((r) => (r.ok ? r.json() : { messages: [] })),
      fetch('/api/leads').then((r) => (r.ok ? r.json() : { leads: [] })),
    ]).then(([m, l]) => { setMessages(m?.messages ?? []); setLeads((l?.leads ?? []).filter((x: any) => x.status !== 'ignorado')); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  async function generate(leadId: string) {
    setGenId(leadId); setGenText('')
    try {
      const res = await fetch('/api/messages/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId }) })
      if (!res.ok || !res.body) { toast.error('Erro ao gerar mensagem.'); setGenId(null); return }
      const reader = res.body.getReader(); const dec = new TextDecoder(); let partial = ''
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        partial += dec.decode(value, { stream: true })
        const lines = partial.split('\n'); partial = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try { const p = JSON.parse(line.slice(6)); if (p.status === 'processing' && p.delta) setGenText((t) => t + p.delta); if (p.status === 'completed') { toast.success('Mensagem gerada!'); load() } } catch {}
        }
      }
    } catch { toast.error('Erro ao gerar.') } finally { setGenId(null) }
  }

  function copyMsg(t: string) { navigator.clipboard?.writeText(t).then(() => toast.success('Copiado!')).catch(() => {}) }
  function sendWhats(phone: string | null, text: string) {
    const num = (phone ?? '').replace(/\D/g, '')
    window.open(`https://wa.me/55${num}?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div>
      <PageHeader title="Mensagens com" highlight="IA" description="Gere e gerencie abordagens de WhatsApp personalizadas para cada lead." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lz-card p-5">
          <h2 className="font-grotesk text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Gerar nova mensagem</h2>
          {loading ? <div className="h-32 rounded-lg skeleton-shimmer" /> : leads.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Prospecte leads primeiro para gerar mensagens.</p>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto scrollbar-none">
              {leads.map((l) => {
                const Icon = nicheIcon(l.niche)
                return (
                  <div key={l.id} className="p-3 rounded-[10px]" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--purple-glow)' }}><Icon size={15} style={{ color: 'var(--purple-soft)' }} /></div>
                      <div className="flex-1 min-w-0"><p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{l.businessName}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.city}</p></div>
                      <TierBadge tier={l.tier} />
                      <button onClick={() => generate(l.id)} disabled={genId === l.id} className="lz-btn-primary !py-1.5 !px-3 text-xs inline-flex items-center gap-1">{genId === l.id ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Gerar</button>
                    </div>
                    {genId === l.id && genText && <p className="text-xs mt-2 p-2 rounded" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>{genText}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="lz-card p-5">
          <h2 className="font-grotesk text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Histórico</h2>
          {loading ? <div className="h-32 rounded-lg skeleton-shimmer" /> : messages.length === 0 ? (
            <EmptyState icon={MessageSquare} title="Nenhuma mensagem ainda" subtitle="Gere sua primeira mensagem ao lado." />
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto scrollbar-none">
              {messages.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-[10px]" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="flex items-center justify-between mb-1.5"><span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.lead?.businessName ?? 'Lead'}</span><span className="text-xs font-jet" style={{ color: 'var(--text-muted)' }}><TimeAgo date={m.generatedAt} /></span></div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{m.messageText}</p>
                  <div className="flex gap-2"><button onClick={() => sendWhats(m.lead?.phone, m.messageText)} className="lz-btn-primary !py-1.5 !px-3 text-xs inline-flex items-center gap-1"><Send size={12} /> WhatsApp</button><button onClick={() => copyMsg(m.messageText)} className="lz-btn-secondary !py-1.5 !px-3 text-xs inline-flex items-center gap-1"><Copy size={12} /> Copiar</button></div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
