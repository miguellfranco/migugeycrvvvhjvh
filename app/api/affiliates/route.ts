export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const affiliates = await prisma.affiliate.findMany({
      where: { referrerId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { referred: { select: { name: true, email: true } }, commissions: true },
    })

    const totalEarned = affiliates.reduce((acc, a) => acc + (a.totalEarned ?? 0), 0)
    const totalReferrals = affiliates.length
    const pendingRaw = await prisma.commission.findMany({
      where: { affiliate: { referrerId: user.id }, status: 'pending' },
    })
    const pending = pendingRaw.reduce((acc, c) => acc + (c.amount ?? 0), 0)

    return NextResponse.json({
      referralCode: user.referralCode,
      totalEarned,
      totalReferrals,
      pending,
      referrals: affiliates.map((a) => ({
        id: a.id,
        name: a.referred?.name ?? 'Indicado',
        planType: a.planType,
        firstCommission: a.firstCommission,
        totalEarned: a.totalEarned,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
      })),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
