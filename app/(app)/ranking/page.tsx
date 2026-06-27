'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal } from 'lucide-react'
import { PageHeader, EmptyState, brl } from '@/components/lz/ui'

export default function RankingPage() {
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/ranking').then((r) => (r.ok ? r.json() : { ranking: [] })).then((d) => { setRanking(d?.ranking ?? []); setLoading(false) }).catch(() => setLoading(false)) }, [])

  return (
    <div>
      <PageHeader title="Ranking de" highlight="afiliados" description="Os afiliados que mais venderam neste mês. Suba no pódio! 🏆" />
      <div className="lz-card p-5">
        {loading ? <div className="h-40 rounded-lg skeleton-shimmer" /> : ranking.length === 0 ? (
          <EmptyState icon={Trophy} title="Ranking vazio" subtitle="Ainda não há vendas este mês." />
        ) : (
          <div className="space-y-2">
            {ranking.map((r, i) => (
              <motion.div key={r.userId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-3 rounded-[10px]" style={{ background: r.isMe ? 'rgba(124,58,237,0.12)' : 'var(--bg-elevated)', border: r.isMe ? '1px solid var(--purple-border)' : '1px solid transparent' }}>
                <div className="w-8 text-center font-jet font-bold" style={{ color: r.position <= 3 ? 'var(--purple-soft)' : 'var(--text-muted)' }}>
                  {r.position === 1 ? <Crown size={20} style={{ color: '#f59e0b' }} className="mx-auto" /> : r.position <= 3 ? <Medal size={18} className="mx-auto" /> : `#${r.position}`}
                </div>
                <div className="flex-1"><p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.name} {r.isMe && <span className="lz-badge lz-badge-hot ml-1">VOCÊ</span>}</p></div>
                <div className="text-right"><p className="font-jet text-sm" style={{ color: 'var(--purple-soft)' }}>{r.sales} vendas</p><p className="font-jet text-xs" style={{ color: 'var(--text-muted)' }}>{brl(r.revenue)}</p></div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
