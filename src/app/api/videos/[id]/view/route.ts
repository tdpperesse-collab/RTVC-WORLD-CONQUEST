// Enregistre une vue sur une vidéo
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  const video = await db.video.findUnique({ where: { id } })
  if (!video) return NextResponse.json({ error: 'Vidéo introuvable.' }, { status: 404 })

  const session = await getServerSession(authOptions)
  let body: any = {}
  try { body = await req.json() } catch {}
  const duration = Number(body?.duration) || 0
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? null

  await db.$transaction([
    db.viewStat.create({
      data: {
        videoId: id,
        userId: session?.user?.id ?? null,
        duration,
        ip,
      },
    }),
    db.video.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }),
  ])
  return NextResponse.json({ ok: true })
}
