'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader, nicheIcon, NICHE_LABELS } from '@/components/lz/ui'

const TEMPLATES = [
  { niche: 'restaurante', text: 'Olá! Vi que o {NOME} tem ótimas avaliações no Google. Posso criar um site com cardápio online e reservas que vai atrair ainda mais clientes. Podemos conversar?' },
  { niche: 'academia', text: 'Oi! Sua academia {NOME} tem uma ótima reputação. Que tal um site com agenda de aulas e captação de alunos? Aumenta muito as matrículas. Topa ver?' },
  { niche: 'salao', text: 'Olá! O {NOME} merece um site profissional com agendamento online. Seus clientes vão adorar marcar horário pelo celular. Posso te mostrar?' },
  { niche: 'barbearia', text: 'E aí! A {NOME} tem estilo — e merece um site à altura, com agendamento e galeria de cortes. Posso montar algo pra você?' },
  { niche: 'clinica', text: 'Olá! Uma clínica como a {NOME} ganha muita confiança com um site profissional e agendamento online. Posso apresentar uma proposta?' },
  { niche: 'pizzaria', text: 'Oi! A {NOME} faz sucesso — imagina com pedidos online direto pelo site, sem taxa de app? Posso criar isso pra você. Vamos conversar?' },
  { niche: 'petshop', text: 'Olá! O {NOME} pode ter um site com agendamento de banho e tosa e catálogo de produtos. Facilita a vida do cliente. Quer ver?' },
  { niche: 'estetica', text: 'Oi! Um espaço como o {NOME} brilha com um site elegante e agendamento online. Atrai clientes de alto valor. Posso te mostrar?' },
  { niche: 'oficina', text: 'Olá! A {NOME} pode receber mais clientes com um site simples e orçamento online. Posso montar uma proposta rápida?' },
  { niche: 'advocacia', text: 'Olá! Um site profissional transmite autoridade para o {NOME}. Posso criar uma página que gera novos clientes. Podemos falar?' },
  { niche: 'imobiliaria', text: 'Oi! A {NOME} vende mais com um site com vitrine de imóveis e captura de leads. Posso apresentar como funciona?' },
  { niche: 'contabilidade', text: 'Olá! Um site profissional ajuda a {NOME} a captar novos clientes online. Posso montar uma proposta sob medida?' },
]

export default function PromptsPage() {
  const [copied, setCopied] = useState('')
  function copy(t: string, n: string) { navigator.clipboard?.writeText(t).then(() => { setCopied(n); toast.success('Template copiado!') }).catch(() => {}) }
  return (
    <div>
      <PageHeader title="Biblioteca de" highlight="prompts" description="Templates de abordagem prontos por nicho. Personalize {NOME} com o nome do negócio." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map((t, i) => {
          const Icon = nicheIcon(t.niche)
          return (
            <motion.div key={t.niche} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="lz-card lz-card-hover p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--purple-glow)' }}><Icon size={16} style={{ color: 'var(--purple-soft)' }} /></div><span className="font-grotesk" style={{ color: 'var(--text-primary)' }}>{NICHE_LABELS[t.niche]}</span></div>
                <button onClick={() => copy(t.text, t.niche)} className="lz-btn-secondary !py-1.5 !px-3 text-xs inline-flex items-center gap-1"><Copy size={13} /> {copied === t.niche ? 'Copiado' : 'Copiar'}</button>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.text}</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
