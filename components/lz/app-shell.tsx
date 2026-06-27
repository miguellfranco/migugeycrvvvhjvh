'use client'

import { motion } from 'framer-motion'
import { Sidebar } from '@/components/lz/sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Sidebar />
      <div className="md:ml-[240px] min-h-screen">
        <header className="sticky top-0 z-30 h-16 flex items-center px-5 md:px-8"
          style={{ background: 'rgba(7,7,15,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-2 md:hidden">
            <span className="font-grotesk font-bold text-lg text-glow" style={{ color: 'var(--text-primary)' }}>LeadZap</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="h-2 w-2 rounded-full pulse-dot" style={{ background: 'var(--success)' }} />
            <span className="text-xs font-jet" style={{ color: 'var(--text-secondary)' }}>ONLINE</span>
          </div>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="p-5 md:p-8 pb-24 md:pb-8 max-w-[1200px] mx-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
