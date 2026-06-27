'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Radar, MessageSquare, TrendingUp, DollarSign, Search, Eye, Copy, ArrowUpRight,
  Activity, Flame, Rocket, X, Check, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  PageHeader, EmptyState, TierBadge, ScoreBar, TimeAgo, CountUp, brl, nicheIcon, NICHE_LABELS,
} from '@/components/lz/ui'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [me, setMe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/me').then((r) => (r.ok ? r.json() : null)),
    ]).then(([d, m]) => { setData(d); setMe(m); setLoading(false) }).catch(() => setLoading(false))
    try { if (!localStorage.getItem('lz_welcomed')) setShowWelcome(true) } catch {}
  }, [])

  function closeWelcome() { try { localStorage.setItem('lz_welcomed', '1') } catch {}; setShowWelcome(false) }

  const k = data?.kpis
  const referralLink = me?.referralCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/cadastro?ref=${me.referralCode}` : ''
  function copyRef() { if (!referralLink) return; navigator.clipboard?.writeText(referralLink).then(() => toast.success('Link copiado!')).catch(() => toast.error('Erro ao copiar.')) }

  const kpiCards = [
    { icon: Radar, label: 'Leads Encontrados Hoje', value: k?.leadsToday ?? 0, sub: `${k?.leadsToday ?? 0}/${k?.dailyLimit ?? 5} hoje`, progress: ((k?.leadsToday ?? 0) / (k?.dailyLimit || 5)) * 100, color: 'var(--purple-soft)' },
    { icon: MessageSquare, label: 'Mensagens Geradas', value: k?.totalMessages ?? 0, sub: 'Total gerado com IA', color: 'var(--info)' },
    { icon: TrendingUp, label: 'Vendas Fechadas', value: k?.totalSales ?? 0, sub: `+${k?.weekSales ?? 0} esta semana`, color: 'var(--success)' },
    { icon: DollarSign, label: 'Ganhos como Afiliado', value: k?.affiliateEarnings ?? 0, isMoney: true, sub: 'Comissões acumuladas', color: 'var(--warning)' },
  ]

  return (
    <div>
      <PageHeader title="Seu painel de" highlight="prospecção" description="Acompanhe seus leads, mensagens e vendas em tempo real."
        actions={<Link href="/prospectar" className="lz-btn-primary inline-flex items-center gap-2"><Search size={16} /> Prospectar</Link>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((c, i) => {
          const Icon = c.icon
          return (
            <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="lz-card lz-card-hover p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-grotesk" style={{ color: 'var(--text-secondary)' }}>{c.label}</span>
                <Icon size={18} style={{ color: c.color }} />
              </div>
              <div className="font-jet font-bold text-4xl" style={{ color: c.color }}>
                {loading ? '—' : c.isMoney ? <CountUp value={c.value} prefix="R$ " /> : <CountUp value={c.value} />}
              </div>
              {c.progress != null && (
                <div className="h-1.5 w-full rounded-full mt-3 overflow-hidden" style={{ background: '#1e1e35' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, c.progress)}%`, background: 'var(--purple-core)' }} />
                </div>
              )}
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{c.sub}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="lz-card p-5">
            <h2 className="font-grotesk text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Últimos Leads Encontrados</h2>
            {loading ? <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-lg skeleton-shimmer" />)}</div>
            : (data?.recentLeads?.length ?? 0) === 0 ? (
              <EmptyState icon={Radar} title="Nenhum lead ainda" subtitle="Comece a prospectar para encontrar clientes ideais."
                action={<Link href="/prospectar" className="lz-btn-primary inline-flex items-center gap-2"><Search size={16} /> Prospectar agora</Link>} />
            ) : (
              <div className="space-y-2">
                {data?.recentLeads?.map((l: any) => {
                  const Icon = nicheIcon(l.niche)
                  return (
                    <div key={l.id} className="flex items-center gap-3 p-3 rounded-[10px]" style={{ background: 'var(--bg-elevated)' }}>
                      <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--purple-glow)' }}><Icon size={16} style={{ color: 'var(--purple-soft)' }} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{l.businessName}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{l.city} · {NICHE_LABELS[l.niche] ?? l.niche}</p>
                      </div>
                      <div className="hidden sm:block"><ScoreBar score={l.score} tier={l.tier} /></div>
                      <TierBadge tier={l.tier} />
                      <Link href="/mensagens" className="lz-btn-secondary !py-1.5 !px-3 text-xs inline-flex items-center gap-1"><Eye size={13} /> Ver</Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="lz-card p-5">
            <h2 className="font-grotesk text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Activity size={18} style={{ color: 'var(--purple-soft)' }} /> Atividade Recente</h2>
            {loading ? <div className="h-24 rounded-lg skeleton-shimmer" /> : (data?.activity?.length ?? 0) === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhuma atividade ainda.</p>
            ) : (
              <div className="space-y-3">
                {data?.activity?.map((a: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full mt-1.5 shrink-0" style={{ background: a.type === 'sale' ? 'var(--success)' : a.type === 'message' ? 'var(--info)' : 'var(--purple-soft)' }} />
                    <div className="flex-1"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a.text}</p><p className="text-xs font-jet" style={{ color: 'var(--text-muted)' }}><TimeAgo date={a.at} /></p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="lz-card p-5">
            <h2 className="font-grotesk text-lg mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>Vendas Acontecendo Agora <Flame size={16} style={{ color: 'var(--warning)' }} /></h2>
            <div className="flex items-center gap-1.5 mb-4"><span className="h-2 w-2 rounded-full pulse-dot" style={{ background: 'var(--purple-core)' }} /><span className="text-xs font-jet" style={{ color: 'var(--text-muted)' }}>AO VIVO</span></div>
            {loading ? <div className="h-40 rounded-lg skeleton-shimmer" /> : (
              <div className="space-y-2.5">
                {data?.feed?.map((f: any) => (
                  <motion.div key={f.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="pl-3 py-2 text-sm" style={{ borderLeft: '2px solid var(--purple-core)', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{f.userName}</span> de {f.city} fechou <span style={{ color: 'var(--purple-soft)' }}>{NICHE_LABELS[f.niche] ?? f.niche}</span> <TimeAgo date={f.createdAt} /> 💰
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="lz-card p-5">
            <h2 className="font-grotesk text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Seu Plano</h2>
            <div className="flex items-center gap-2 mb-4"><span className="lz-badge lz-badge-hot">{(me?.plan ?? 'free').toUpperCase()}</span><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{me?.daysActive ?? 1} dia(s) ativo</span></div>
            <div className="mb-2 flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}><span>Leads usados hoje</span><span className="font-jet">{me?.leadsUsedToday ?? 0}/{me?.dailyLimit ?? 5}</span></div>
            <div className="h-1.5 w-full rounded-full overflow-hidden mb-4" style={{ background: '#1e1e35' }}><div className="h-full rounded-full" style={{ width: `${Math.min(100, ((me?.leadsUsedToday ?? 0) / (me?.dailyLimit || 5)) * 100)}%`, background: 'var(--purple-core)' }} /></div>
            {me?.plan === 'mensal' && <Link href="/configuracoes" className="lz-btn-primary w-full mb-4 inline-flex items-center justify-center gap-2 text-sm"><ArrowUpRight size={15} /> Upgrade para Vitalício</Link>}
            <div className="mb-2 text-xs font-grotesk" style={{ color: 'var(--text-secondary)' }}>SEU LINK DE INDICAÇÃO</div>
            <div className="flex gap-2 mb-3"><input readOnly value={referralLink} className="lz-input text-xs !py-2" /><button onClick={copyRef} className="lz-btn-secondary !px-3 !py-2"><Copy size={15} /></button></div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Você ganhou <span className="font-jet" style={{ color: 'var(--success)' }}>{brl(k?.affiliateEarnings)}</span> em comissões.</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showWelcome && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: 'rgba(0,0,0,0.6)' }} onClick={closeWelcome}>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg p-7 relative" style={{ background: 'rgba(10,10,20,0.96)', backdropFilter: 'blur(24px)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 18 }}>
              <button onClick={closeWelcome} className="absolute top-4 right-4" style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
              <div className="flex items-center gap-2 mb-2"><Rocket size={24} style={{ color: 'var(--purple-soft)' }} /><h2 className="font-grotesk text-xl" style={{ color: 'var(--text-primary)' }}>Bem-vindo ao LeadZap!</h2></div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Em 3 passos você encontra clientes e fecha vendas:</p>
              <div className="space-y-4 mb-7">
                {[{ icon: Search, t: '1. Prospecte', d: 'Busque negócios por cidade e nicho no Google Maps.' }, { icon: Sparkles, t: '2. Gere mensagens com IA', d: 'Crie abordagens de WhatsApp personalizadas em segundos.' }, { icon: Check, t: '3. Feche vendas', d: 'Envie, acompanhe e registre suas vendas no painel.' }].map((s) => {
                  const Icon = s.icon
                  return (
                    <motion.div key={s.t} className="flex items-start gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--purple-glow)' }}><Icon size={18} style={{ color: 'var(--purple-soft)' }} /></div>
                      <div><p className="font-grotesk text-sm" style={{ color: 'var(--text-primary)' }}>{s.t}</p><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.d}</p></div>
                    </motion.div>
                  )
                })}
              </div>
              <Link href="/prospectar" onClick={closeWelcome} className="lz-btn-primary w-full inline-flex items-center justify-center gap-2"><Rocket size={16} /> Começar a Prospectar</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
