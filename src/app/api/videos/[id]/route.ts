// CRUD vidéo /id — GET public, PUT/DELETE admin
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const video = await db.video.findUnique({
    where: { id },
    include: { category: true },
  })
  if (!video) return NextResponse.json({ error: 'Vidéo introuvable.' }, { status: 404 })
  return NextResponse.json({ video })
}

export async function PUT(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs.' }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json()
  const allowed = ['title', 'description', 'thumbnailUrl', 'videoUrl', 'duration', 'categoryId', 'isLive', 'isPublished']
  const data: any = {}
  for (const k of allowed) {
    if (k in body) data[k] = body[k]
  }
  if ('duration' in data) data.duration = Number(data.duration) || 0
  const updated = await db.video.update({
    where: { id },
    data,
    include: { category: true },
  })
  return NextResponse.json({ video: updated })
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs.' }, { status: 403 })
  }
  const { id } = await params
  await db.video.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
