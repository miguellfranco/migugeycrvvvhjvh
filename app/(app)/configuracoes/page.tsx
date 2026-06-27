'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { User, Mail, Crown, LogOut, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/lz/ui'

export default function ConfiguracoesPage() {
  const [me, setMe] = useState<any>(null)
  useEffect(() => { fetch('/api/me').then((r) => (r.ok ? r.json() : null)).then(setMe).catch(() => {}) }, [])
  const PLAN_LABEL: Record<string, string> = { vitalicio: 'Vitalício', mensal: 'Mensal', free: 'Grátis' }

  return (
    <div>
      <PageHeader title="Suas" highlight="configurações" description="Gerencie seu perfil, plano e dados da conta." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lz-card p-6">
          <h2 className="font-grotesk text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Perfil</h2>
          <div className="space-y-3">
            <div><label className="text-xs font-grotesk" style={{ color: 'var(--text-secondary)' }}>NOME</label><div className="relative mt-1"><User size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input readOnly value={me?.name ?? ''} className="lz-input" style={{ paddingLeft: '42px' }} /></div></div>
            <div><label className="text-xs font-grotesk" style={{ color: 'var(--text-secondary)' }}>E-MAIL</label><div className="relative mt-1"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input readOnly value={me?.email ?? ''} className="lz-input" style={{ paddingLeft: '42px' }} /></div></div>
            <button onClick={() => toast('Funcionalidade disponível em breve.')} className="lz-btn-secondary w-full inline-flex items-center justify-center gap-2 mt-2"><Lock size={15} /> Trocar senha</button>
          </div>
        </div>
        <div className="lz-card p-6">
          <h2 className="font-grotesk text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Seu plano</h2>
          <div className="flex items-center gap-3 mb-4"><div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--purple-glow)' }}><Crown size={22} style={{ color: 'var(--purple-soft)' }} /></div><div><p className="font-grotesk text-lg" style={{ color: 'var(--text-primary)' }}>{PLAN_LABEL[me?.plan ?? 'free']}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{me?.dailyLimit ?? 5} leads por dia · {me?.daysActive ?? 1} dia(s) ativo</p></div></div>
          {me?.plan === 'mensal' && <div className="p-4 rounded-[10px] mb-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--purple-border)' }}><p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Faça upgrade para o <span style={{ color: 'var(--purple-soft)' }}>Vitalício</span></p><p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>R$ 197 único · 50 leads/dia · sem mensalidade</p><button onClick={() => toast('Checkout em breve.')} className="lz-btn-primary w-full text-sm">Garantir Vitalício — R$ 197</button></div>}
          {me?.plan === 'free' && <div className="p-4 rounded-[10px] mb-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--purple-border)' }}><p className="text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Escolha um plano para liberar mais leads.</p><button onClick={() => toast('Checkout em breve.')} className="lz-btn-primary w-full text-sm">Ver planos</button></div>}
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="lz-btn-secondary w-full inline-flex items-center justify-center gap-2"><LogOut size={15} /> Sair da conta</button>
        </div>
      </div>
    </div>
  )
}
