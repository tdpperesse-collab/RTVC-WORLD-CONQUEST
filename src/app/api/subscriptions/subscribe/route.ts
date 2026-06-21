// Souscription + paiement mock
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const PLANS: Record<string, { amount: number; days: number; label: string }> = {
  MONTHLY: { amount: 3000, days: 30, label: 'Mensuel' },
  YEARLY: { amount: 30000, days: 365, label: 'Annuel' },
  PREMIUM: { amount: 60000, days: 365, label: 'Premium' },
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Veuillez vous connecter pour souscrire.' }, { status: 401 })
  }
  const body = await req.json()
  const plan = String(body?.plan).toUpperCase()
  const method = String(body?.method).toUpperCase()
  const phone = String(body?.phone ?? '').trim()
  const card = String(body?.card ?? '').trim()

  if (!PLANS[plan]) {
    return NextResponse.json({ error: 'Formule inconnue.' }, { status: 400 })
  }
  if (!['MOBILE_MONEY', 'CARD'].includes(method)) {
    return NextResponse.json({ error: 'Méthode de paiement invalide.' }, { status: 400 })
  }
  if (method === 'MOBILE_MONEY' && phone.length < 8) {
    return NextResponse.json({ error: 'Numéro Mobile Money invalide.' }, { status: 400 })
  }
  if (method === 'CARD' && card.replace(/\s/g, '').length < 12) {
    return NextResponse.json({ error: 'Numéro de carte invalide.' }, { status: 400 })
  }

  const cfg = PLANS[plan]
  const now = new Date()
  const expiresAt = new Date(now.getTime() + cfg.days * 24 * 3600 * 1000)
  const reference = `${method === 'MOBILE_MONEY' ? 'MM' : 'CB'}-${Date.now().toString(36).toUpperCase()}`

  // Désactive les anciennes souscriptions actives de l'utilisateur
  await db.subscription.updateMany({
    where: { userId: session.user.id, status: 'ACTIVE' },
    data: { status: 'EXPIRED' },
  })

  const subscription = await db.subscription.create({
    data: {
      userId: session.user.id,
      plan,
      status: 'ACTIVE',
      startedAt: now,
      expiresAt,
      payments: {
        create: [
          {
            amount: cfg.amount,
            currency: 'XAF',
            method,
            status: 'COMPLETED',
            reference,
          },
        ],
      },
    },
    include: { payments: true },
  })

  return NextResponse.json({ ok: true, subscription })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ subscription: null })
  const subscription = await db.subscription.findFirst({
    where: { userId: session.user.id, status: 'ACTIVE' },
    orderBy: { startedAt: 'desc' },
    include: { payments: true },
  })
  return NextResponse.json({ subscription })
}
