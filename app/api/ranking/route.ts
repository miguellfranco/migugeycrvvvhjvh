export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const grouped = await prisma.sale.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: startOfMonth } },
      _count: { _all: true },
      _sum: { saleValue: true },
    })

    const userIds = grouped.map((g) => g.userId)
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
    const nameMap = new Map(users.map((u) => [u.id, u.name]))

    const ranking = grouped
      .map((g) => ({
        userId: g.userId,
        name: nameMap.get(g.userId) ?? 'Usuário',
        sales: g._count?._all ?? 0,
        revenue: g._sum?.saleValue ?? 0,
        isMe: g.userId === user.id,
      }))
      .sort((a, b) => b.sales - a.sales || b.revenue - a.revenue)
      .slice(0, 20)
      .map((r, i) => ({ ...r, position: i + 1 }))

    return NextResponse.json({ ranking })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
