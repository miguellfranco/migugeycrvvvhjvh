export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    const dailyLimit = user.plan === 'vitalicio' ? 50 : user.plan === 'mensal' ? 5 : 3
    const daysActive = Math.max(1, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      planStatus: user.planStatus,
      referralCode: user.referralCode,
      leadsUsedToday: user.leadsUsedToday,
      dailyLimit,
      daysActive,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
