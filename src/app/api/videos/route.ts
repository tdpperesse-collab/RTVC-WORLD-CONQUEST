// Liste/Création de vidéos — GET public, POST admin
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') // slug
  const search = searchParams.get('q')?.trim() ?? ''
  const liveOnly = searchParams.get('live') === '1'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 200)

  const where: any = { isPublished: true }
  if (liveOnly) where.isLive = true
  if (category) {
    where.category = { slug: category }
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ]
  }

  const videos = await db.video.findMany({
    where,
    include: { category: true },
    orderBy: [{ isLive: 'desc' }, { publishedAt: 'desc' }],
    take: limit,
  })

  return NextResponse.json({ videos })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs.' }, { status: 403 })
  }
  try {
    const body = await req.json()
    const { title, description, thumbnailUrl, videoUrl, duration, categoryId, isLive, isPublished } = body

    if (!title || !videoUrl || !categoryId) {
      return NextResponse.json(
        { error: 'Titre, URL vidéo et catégorie sont requis.' },
        { status: 400 }
      )
    }
    const video = await db.video.create({
      data: {
        title: String(title),
        description: description ?? null,
        thumbnailUrl: thumbnailUrl ?? null,
        videoUrl: String(videoUrl),
        duration: Number(duration) || 0,
        categoryId: String(categoryId),
        isLive: Boolean(isLive),
        isPublished: isPublished === undefined ? true : Boolean(isPublished),
        publishedAt: new Date(),
      },
      include: { category: true },
    })
    return NextResponse.json({ video })
  } catch (e) {
    console.error('[videos POST]', e)
    return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 })
  }
}
