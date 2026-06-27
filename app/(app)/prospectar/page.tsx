'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Loader2, Phone, Star, Globe, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader, TierBadge, ScoreBar, nicheIcon, NICHE_LABELS } from '@/components/lz/ui'

const NICHES = ['restaurante', 'academia', 'salao', 'barbearia', 'clinica', 'pizzaria', 'petshop', 'estetica']

export default function ProspectarPage() {
  const [city, setCity] = useState('')
  const [niche, setNiche] = useState('restaurante')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!city.trim()) { toast.error('Informe a cidade.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ city, niche }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(data?.error ?? 'Erro ao prospectar.'); return }
      setResults(data?.leads ?? [])
      toast.success(`${data?.leads?.length ?? 0} leads encontrados!`)
    } catch { toast.error('Erro ao prospectar.') } finally { setLoading(false) }
  }

  return (
    <div>
      <PageHeader title="Prospectar" highlight="leads" description="Encontre negócios ideais por cidade e nicho — direto do Google Maps." />
      <form onSubmit={handleSearch} className="lz-card p-5 mb-6 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <div>
          <label className="block text-xs font-grotesk mb-1.5" style={{ color: 'var(--text-secondary)' }}>CIDADE</label>
          <div className="relative"><MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: São Paulo, SP" className="lz-input" style={{ paddingLeft: '42px' }} /></div>
        </div>
        <div>
          <label className="block text-xs font-grotesk mb-1.5" style={{ color: 'var(--text-secondary)' }}>NICHO</label>
          <select value={niche} onChange={(e) => setNiche(e.target.value)} className="lz-input">
            {NICHES.map((n) => <option key={n} value={n} style={{ background: '#0d0d1a' }}>{NICHE_LABELS[n] ?? n}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} className="lz-btn-primary inline-flex items-center justify-center gap-2 h-[46px]">{loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}{loading ? 'Buscando...' : 'Buscar'}</button>
      </form>

      {results.length === 0 ? (
        <div className="lz-card p-10 text-center"><Sparkles size={48} style={{ color: 'var(--purple-core)', opacity: 0.3 }} className="mx-auto mb-3" /><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Faça uma busca para descobrir leads quentes na sua região.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((l, i) => {
            const Icon = nicheIcon(l.niche)
            return (
              <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="lz-card lz-card-hover p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--purple-glow)' }}><Icon size={18} style={{ color: 'var(--purple-soft)' }} /></div><div><p className="font-grotesk" style={{ color: 'var(--text-primary)' }}>{l.businessName}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.city}</p></div></div>
                  <TierBadge tier={l.tier} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <span className="inline-flex items-center gap-1 font-jet"><Star size={13} style={{ color: 'var(--warning)' }} /> {l.rating} ({l.reviewCount})</span>
                  <span className="inline-flex items-center gap-1 font-jet"><Phone size={13} /> {l.phone}</span>
                  {!l.hasWebsite && <span className="lz-badge lz-badge-warm inline-flex items-center gap-1"><Globe size={11} /> Sem website</span>}
                </div>
                <ScoreBar score={l.score} tier={l.tier} />
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
