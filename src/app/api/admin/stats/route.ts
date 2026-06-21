// Statistiques pour le tableau de bord admin
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
  }

  const [totalUsers, totalVideos, totalSubscriptions, payments, views] = await Promise.all([
    db.user.count(),
    db.video.count(),
    db.subscription.count({ where: { status: 'ACTIVE' } }),
    db.payment.findMany({ where: { status: 'COMPLETED' }, select: { amount: true, currency: true, createdAt: true } }),
    db.viewStat.findMany({ select: { watchedAt: true, videoId: true } }),
  ])

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0)

  // Vues par jour (14 derniers jours)
  const days: { date: string; label: string; count: number }[] = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({
      date: key,
      label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      count: 0,
    })
  }
  for (const v of views) {
    const k = v.watchedAt.toISOString().slice(0, 10)
    const day = days.find((d) => d.date === k)
    if (day) day.count++
  }

  // Top vidéos par vues
  const topVideos = await db.video.findMany({
    orderBy: { viewCount: 'desc' },
    take: 5,
    include: { category: true },
  })

  const recentSubscriptions = await db.subscription.findMany({
    take: 8,
    orderBy: { startedAt: 'desc' },
    include: { user: true, payments: true },
  })

  const recentVideos = await db.video.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  return NextResponse.json({
    stats: {
      totalUsers,
      totalVideos,
      totalSubscriptions,
      totalRevenue,
      currency: 'XAF',
      totalViews: views.length,
    },
    viewsByDay: days,
    topVideos,
    recentSubscriptions,
    recentVideos,
  })
}
