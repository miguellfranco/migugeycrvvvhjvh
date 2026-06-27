export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    const leads = await prisma.lead.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({
      leads: leads.map((l) => ({
        id: l.id,
        businessName: l.businessName,
        phone: l.phone,
        city: l.city,
        niche: l.niche,
        rating: l.rating,
        reviewCount: l.reviewCount,
        hasWebsite: l.hasWebsite,
        yearsWithoutSite: l.yearsWithoutSite,
        score: l.score,
        tier: l.tier,
        status: l.status,
        createdAt: l.createdAt.toISOString(),
      })),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}

// Mock "prospect" search: generates realistic leads for the given city/niche
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const city = String(body?.city ?? '').trim() || 'São Paulo, SP'
    const niche = String(body?.niche ?? '').trim().toLowerCase() || 'restaurante'

    const prefixes: Record<string, string[]> = {
      restaurante: ['Restaurante Sabor', 'Cantina', 'Bistrô', 'Comida Caseira'],
      academia: ['Academia Power', 'Studio Fit', 'CrossBox', 'Academia Energia'],
      salao: ['Salão Glamour', 'Studio Hair', 'Espaço Beleza', 'Salão Charme'],
      barbearia: ['Barbearia Vintage', 'Barber Shop', 'Navalha', 'Bigode'],
      clinica: ['Clínica Vida', 'Odonto', 'Centro Médico', 'Clínica Saúde'],
      pizzaria: ['Pizzaria Bella', 'Forno a Lenha', 'Pizza Express', 'Cantina da Pizza'],
      petshop: ['Pet Center', 'Mundo Pet', 'Pet Care', 'Amigo Pet'],
      estetica: ['Estética Bella', 'Espaço Zen', 'Clean Skin', 'Beleza Pura'],
    }
    const sufix = ['Premium', 'Express', 'do Bairro', 'Center', 'VIP', '24h', 'Gold', 'Prime']
    const base = prefixes[niche] ?? prefixes['restaurante']

    const count = 6
    const created = []
    for (let i = 0; i < count; i++) {
      const hasWebsite = Math.random() > 0.65
      const rating = Math.round((3.8 + Math.random() * 1.2) * 10) / 10
      const reviewCount = Math.floor(20 + Math.random() * 400)
      const yearsWithoutSite = hasWebsite ? 0 : 1 + Math.floor(Math.random() * 7)
      let score = 0
      score += hasWebsite ? 2 : 6
      score += rating >= 4.5 ? 2 : 1
      score += reviewCount > 150 ? 2 : 1
      score = Math.min(10, score)
      const tier = score >= 8 ? 'hot' : score >= 6 ? 'warm' : 'cold'
      const lead = await prisma.lead.create({
        data: {
          userId: user.id,
          businessName: `${base[i % base.length]} ${sufix[i % sufix.length]}`,
          phone: `(${10 + Math.floor(Math.random() * 89)}) 9${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1000 + Math.random() * 8999)}`,
          city,
          niche,
          rating,
          reviewCount,
          hasWebsite,
          yearsWithoutSite,
          score,
          tier,
          status: 'novo',
        },
      })
      created.push(lead)
    }

    await prisma.user.update({ where: { id: user.id }, data: { leadsUsedToday: { increment: count } } })

    return NextResponse.json({
      leads: created.map((l) => ({
        id: l.id,
        businessName: l.businessName,
        phone: l.phone,
        city: l.city,
        niche: l.niche,
        rating: l.rating,
        reviewCount: l.reviewCount,
        hasWebsite: l.hasWebsite,
        yearsWithoutSite: l.yearsWithoutSite,
        score: l.score,
        tier: l.tier,
        status: l.status,
        createdAt: l.createdAt.toISOString(),
      })),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao prospectar' }, { status: 500 })
  }
}
