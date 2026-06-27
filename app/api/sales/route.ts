export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    const sales = await prisma.sale.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({
      sales: sales.map((s) => ({
        id: s.id,
        niche: s.niche,
        city: s.city,
        saleValue: s.saleValue,
        description: s.description,
        isPublic: s.isPublic,
        createdAt: s.createdAt.toISOString(),
      })),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const { niche, city, saleValue, description, isPublic } = body ?? {}
    if (!niche || !city) {
      return NextResponse.json({ error: 'Informe o nicho e a cidade.' }, { status: 400 })
    }
    const sale = await prisma.sale.create({
      data: {
        userId: user.id,
        niche: String(niche),
        city: String(city),
        saleValue: saleValue != null && saleValue !== '' ? Number(saleValue) : null,
        description: description ? String(description) : null,
        isPublic: isPublic !== false,
      },
    })
    return NextResponse.json({
      sale: {
        id: sale.id,
        niche: sale.niche,
        city: sale.city,
        saleValue: sale.saleValue,
        description: sale.description,
        isPublic: sale.isPublic,
        createdAt: sale.createdAt.toISOString(),
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao registrar venda' }, { status: 500 })
  }
}
