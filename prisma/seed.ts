// Plateforme OTT RTVC Koumé — Seed script
// Charge les données initiales : admin, user démo, catégories, vidéos

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Début du seed RTVC Koumé...')

  // --- Nettoyage ---
  await db.viewStat.deleteMany()
  await db.payment.deleteMany()
  await db.subscription.deleteMany()
  await db.video.deleteMany()
  await db.category.deleteMany()
  await db.user.deleteMany()

  // --- Utilisateurs ---
  const adminPass = await bcrypt.hash('admin123', 10)
  const demoPass = await bcrypt.hash('demo123', 10)

  const admin = await db.user.create({
    data: {
      email: 'admin@rtvc-koume.org',
      name: 'Administrateur RTVC',
      password: adminPass,
      role: 'ADMIN',
    },
  })

  const demo = await db.user.create({
    data: {
      email: 'demo@rtvc-koume.org',
      name: 'Utilisateur Démo',
      password: demoPass,
      role: 'USER',
    },
  })

  // Un abonnement démo actif
  const now = new Date()
  await db.subscription.create({
    data: {
      userId: demo.id,
      plan: 'MONTHLY',
      status: 'ACTIVE',
      startedAt: now,
      expiresAt: new Date(now.getTime() + 30 * 24 * 3600 * 1000),
      payments: {
        create: [
          {
            amount: 3000,
            currency: 'XAF',
            method: 'MOBILE_MONEY',
            status: 'COMPLETED',
            reference: 'MM-DEMO-0001',
          },
        ],
      },
    },
  })

  console.log(`✅ Utilisateurs créés : admin (${admin.email}), démo (${demo.email})`)

  // --- Catégories ---
  const categories = await Promise.all([
    db.category.create({ data: { name: 'Cultes', slug: 'cultes', description: 'Cultes du dimanche et rassemblements de la communauté.' } }),
    db.category.create({ data: { name: 'Enseignements', slug: 'enseignements', description: 'Études bibliques, prédications et enseignements profonds.' } }),
    db.category.create({ data: { name: 'Témoignages', slug: 'temoignages', description: 'Vies transformées par l\'Évangile.' } }),
    db.category.create({ data: { name: 'Musique', slug: 'musique', description: 'Louanges, chants et compositions chrétiennes.' } }),
    db.category.create({ data: { name: 'Jeunesse', slug: 'jeunesse', description: 'Programmes dédiés aux jeunes et adolescents.' } }),
  ])

  console.log(`✅ ${categories.length} catégories créées`)

  // --- Vidéos ---
  const sampleVideos = [
    {
      title: 'Culte du dimanche — La grâce de Dieu',
      description: 'Culte dominical diffusé en direct depuis Koumé. Message sur la grâce imméritée de Dieu à travers Jésus-Christ.',
      categorySlug: 'cultes',
      duration: 5420,
      thumb: 'https://picsum.photos/seed/culte1/640/360',
    },
    {
      title: 'Enseignement : La foi qui déplace les montagnes',
      description: 'Étude approfondie sur la foi biblique. Comment vivre une foi authentique au quotidien, selon Matthieu 17:20.',
      categorySlug: 'enseignements',
      duration: 3180,
      thumb: 'https://picsum.photos/seed/enseignement1/640/360',
    },
    {
      title: 'Témoignage de Marie — De l\'addiction à la liberté',
      description: 'Une vie brisée restaurée par Christ. Marie partage son parcours de délivrance et de restauration.',
      categorySlug: 'temoignages',
      duration: 1845,
      thumb: 'https://picsum.photos/seed/temoignage1/640/360',
    },
    {
      title: 'Louange — Il est digne (Live)',
      description: 'Moment de louange en direct de la communauté. Chant d\'adoration et de gratitude.',
      categorySlug: 'musique',
      duration: 2640,
      thumb: 'https://picsum.photos/seed/musique1/640/360',
    },
    {
      title: 'Jeunesse : Tenir ferme dans la foi',
      description: 'Programme jeunesse. Comment rester fidèle à Dieu à l\'école, à l\'université et au travail.',
      categorySlug: 'jeunesse',
      duration: 2260,
      thumb: 'https://picsum.photos/seed/jeunesse1/640/360',
    },
    {
      title: 'Culte de Pâques — La résurrection',
      description: 'Culte spécial Pâques. Célébration de la résurrection de Jésus-Christ et de l\'espérance qu\'elle apporte.',
      categorySlug: 'cultes',
      duration: 6120,
      thumb: 'https://picsum.photos/seed/culte2/640/360',
    },
    {
      title: 'Enseignement : Le pouvoir de la prière',
      description: 'Découvrir comment la prière transforme les situations. Basé sur Jacques 5:16.',
      categorySlug: 'enseignements',
      duration: 2790,
      thumb: 'https://picsum.photos/seed/enseignement2/640/360',
    },
    {
      title: 'Témoignage de Jean — Guéri du cancer',
      description: 'Un miracle de guérison. Jean raconte comment Dieu l\'a touché alors que la médecine avait abandonné.',
      categorySlug: 'temoignages',
      duration: 1980,
      thumb: 'https://picsum.photos/seed/temoignage2/640/360',
    },
    {
      title: 'Cantique — Au sang de l\'Agneau',
      description: 'Hymne chrétien classique interprété par le chœur de la communauté missionnaire.',
      categorySlug: 'musique',
      duration: 1620,
      thumb: 'https://picsum.photos/seed/musique2/640/360',
    },
    {
      title: 'Jeunesse : Choix de carrière selon Dieu',
      description: 'Comment orienter sa vie professionnelle en cherchant d\'abord le royaume de Dieu.',
      categorySlug: 'jeunesse',
      duration: 2400,
      thumb: 'https://picsum.photos/seed/jeunesse2/640/360',
    },
  ]

  // Un flux HLS de démo (Mux test stream) pour toutes les vidéos de démonstration
  const DEMO_HLS = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'

  for (const v of sampleVideos) {
    const cat = categories.find((c) => c.slug === v.categorySlug)!
    await db.video.create({
      data: {
        title: v.title,
        description: v.description,
        thumbnailUrl: v.thumb,
        videoUrl: DEMO_HLS,
        duration: v.duration,
        categoryId: cat.id,
        isLive: false,
        isPublished: true,
        viewCount: Math.floor(Math.random() * 800) + 50,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000),
      },
    })
  }

  // Une vidéo "live" simulée (qui pointe vers le flux local Nginx-RTMP, mais par défaut on garde le flux Mux de démo)
  await db.video.create({
    data: {
      title: 'Culte en direct — Diffusion LIVE',
      description: 'Diffusion en direct du culte. Rediffusion disponible après la fin du direct.',
      thumbnailUrl: 'https://picsum.photos/seed/live1/640/360',
      videoUrl: DEMO_HLS, // Le flux local /live/stream.m3u8 est configurable côté UI
      duration: 0,
      categoryId: categories.find((c) => c.slug === 'cultes')!.id,
      isLive: true,
      isPublished: true,
      viewCount: 124,
      publishedAt: new Date(),
    },
  })

  console.log(`✅ ${sampleVideos.length + 1} vidéos créées`)

  // --- Vues simulées pour le tableau de bord admin ---
  for (let i = 0; i < 60; i++) {
    const v = await db.video.findFirst({ skip: Math.floor(Math.random() * sampleVideos.length) })
    if (!v) continue
    await db.viewStat.create({
      data: {
        videoId: v.id,
        userId: Math.random() > 0.6 ? demo.id : null,
        duration: Math.floor(Math.random() * 600) + 30,
        ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        watchedAt: new Date(Date.now() - Math.random() * 14 * 24 * 3600 * 1000),
      },
    })
  }

  console.log('✅ Statistiques de vues simulées créées')
  console.log('🎉 Seed terminé avec succès !')
}

main()
  .catch((e) => {
    console.error('❌ Erreur de seed :', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
