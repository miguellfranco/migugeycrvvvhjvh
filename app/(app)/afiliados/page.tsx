'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Copy, DollarSign, UserCheck, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader, EmptyState, TimeAgo, brl } from '@/components/lz/ui'

export default function AfiliadosPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/affiliates').then((r) => (r.ok ? r.json() : null)).then((d) => { setData(d); setLoading(false) }).catch(() => setLoading(false)) }, [])
  const link = data?.referralCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/cadastro?ref=${data.referralCode}` : ''
  function copy() { if (!link) return; navigator.clipboard?.writeText(link).then(() => toast.success('Link copiado!')).catch(() => {}) }

  return (
    <div>
      <PageHeader title="Programa de" highlight="afiliados" description="Ganhe 50% de comissão na primeira venda de cada indicação." />
      <div className="lz-card p-6 mb-6" style={{ borderColor: 'var(--purple-border)' }}>
        <p className="text-xs font-grotesk mb-2" style={{ color: 'var(--text-secondary)' }}>SEU LINK ÚNICO DE INDICAÇÃO</p>
        <div className="flex gap-2"><input readOnly value={link} className="lz-input text-sm" /><button onClick={copy} className="lz-btn-primary inline-flex items-center gap-2 shrink-0"><Copy size={16} /> Copiar</button></div>
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>Comissão de <span style={{ color: 'var(--purple-soft)' }}>50% na primeira venda</span> de cada novo cliente que assinar pelo seu link.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[{ icon: DollarSign, label: 'Total ganho', value: brl(data?.totalEarned ?? 0), color: 'var(--success)' }, { icon: UserCheck, label: 'Indicações', value: String(data?.totalReferrals ?? 0), color: 'var(--purple-soft)' }, { icon: Clock, label: 'A receber', value: brl(data?.pending ?? 0), color: 'var(--warning)' }].map((c) => { const Icon = c.icon; return (
          <div key={c.label} className="lz-card p-5"><div className="flex items-center justify-between mb-2"><span className="text-xs font-grotesk" style={{ color: 'var(--text-secondary)' }}>{c.label}</span><Icon size={18} style={{ color: c.color }} /></div><p className="font-jet font-bold text-2xl" style={{ color: c.color }}>{c.value}</p></div>
        )})}
      </div>
      <div className="lz-card p-5">
        <h2 className="font-grotesk text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Histórico de comissões</h2>
        {loading ? <div className="h-32 rounded-lg skeleton-shimmer" /> : (data?.referrals?.length ?? 0) === 0 ? (
          <EmptyState icon={Users} title="Nenhuma indicação ainda" subtitle="Compartilhe seu link e comece a ganhar comissões." />
        ) : (
          <div className="space-y-2">
            {data?.referrals?.map((r: any) => (
              <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 p-3 rounded-[10px]" style={{ background: 'var(--bg-elevated)' }}>
                <div className="flex-1"><p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.name}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{(r.planType ?? '').toUpperCase()} · <TimeAgo date={r.createdAt} /></p></div>
                <span className="lz-badge lz-badge-new">{r.status === 'active' ? 'ATIVO' : 'CANCELADO'}</span>
                <span className="font-jet text-sm" style={{ color: 'var(--success)' }}>{brl(r.totalEarned)}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
