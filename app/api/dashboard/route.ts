export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dailyLimit = user.plan === 'vitalicio' ? 50 : user.plan === 'mensal' ? 5 : 3

    const [recentLeads, totalMessages, totalSales, weekSales, affiliates, leadsToday] = await Promise.all([
      prisma.lead.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.message.count({ where: { userId: user.id } }),
      prisma.sale.count({ where: { userId: user.id } }),
      prisma.sale.count({ where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
      prisma.affiliate.findMany({ where: { referrerId: user.id } }),
      prisma.lead.count({ where: { userId: user.id, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    ])

    const affiliateEarnings = affiliates.reduce((acc, a) => acc + (a.totalEarned ?? 0), 0)

    // Public live sales feed (all users)
    const feedRaw = await prisma.sale.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { name: true } } },
    })
    const feed = feedRaw.map((s) => ({
      id: s.id,
      userName: s.user?.name ?? 'Alguém',
      niche: s.niche,
      city: s.city,
      createdAt: s.createdAt.toISOString(),
    }))

    // Recent activity from messages + leads + sales
    const [recentMsgs, recentSalesList] = await Promise.all([
      prisma.message.findMany({ where: { userId: user.id }, orderBy: { generatedAt: 'desc' }, take: 5, include: { lead: { select: { businessName: true } } } }),
      prisma.sale.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    ])
    const activity = [
      ...recentLeads.slice(0, 5).map((l) => ({ type: 'lead', text: `Novo lead encontrado: ${l.businessName}`, at: l.createdAt.toISOString() })),
      ...recentMsgs.map((m) => ({ type: 'message', text: `Mensagem gerada para ${m.lead?.businessName ?? 'lead'}`, at: m.generatedAt.toISOString() })),
      ...recentSalesList.map((s) => ({ type: 'sale', text: `Venda fechada: ${s.niche ?? 'projeto'} em ${s.city ?? ''}`, at: s.createdAt.toISOString() })),
    ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 10)

    return NextResponse.json({
      kpis: {
        leadsToday,
        dailyLimit,
        totalMessages,
        totalSales,
        weekSales,
        affiliateEarnings,
      },
      recentLeads: recentLeads.map((l) => ({
        id: l.id,
        businessName: l.businessName,
        city: l.city,
        niche: l.niche,
        score: l.score,
        tier: l.tier,
        status: l.status,
        rating: l.rating,
        hasWebsite: l.hasWebsite,
      })),
      feed,
      activity,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao carregar dashboard' }, { status: 500 })
  }
}
