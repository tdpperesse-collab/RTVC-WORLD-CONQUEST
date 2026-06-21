'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Play, Radio, TrendingUp, ChevronRight, Flame, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VideoCard, type VideoItem } from '@/components/rtvc/video-card'
import { VideoCardSkeleton } from '@/components/rtvc/video-card-skeleton'
import { api } from '@/lib/api'
import { useRtvc } from '@/store/rtvc'

export function HomeSection() {
  const setSection = useRtvc((s) => s.setSection)
  const openVideo = useRtvc((s) => s.openVideo)
  const setVodCategory = useRtvc((s) => s.setVodCategory)

  const { data, isLoading } = useQuery({
    queryKey: ['home-videos'],
    queryFn: () => api<{ videos: VideoItem[] }>('/api/videos?limit=12'),
  })

  const videos = data?.videos ?? []
  const liveVideos = videos.filter((v) => v.isLive)
  const featured = liveVideos[0] ?? videos[0]
  const trending = [...videos].sort((a, b) => b.viewCount - a.viewCount).slice(0, 4)
  const recent = videos.filter((v) => v.id !== featured?.id).slice(0, 8)

  const categories = [
    { slug: 'cultes', name: 'Cultes', desc: 'Cultes du dimanche', color: 'from-red-900 to-rose-800' },
    { slug: 'enseignements', name: 'Enseignements', desc: 'Études bibliques', color: 'from-amber-700 to-yellow-800' },
    { slug: 'temoignages', name: 'Témoignages', desc: 'Vies transformées', color: 'from-rose-800 to-red-900' },
    { slug: 'musique', name: 'Musique', desc: 'Louanges', color: 'from-yellow-700 to-amber-800' },
    { slug: 'jeunesse', name: 'Jeunesse', desc: 'Pour les jeunes', color: 'from-red-800 to-amber-900' },
  ]

  return (
    <div className="rtvc-fade-in">
      {/* HERO */}
      {featured && (
        <section className="relative -mx-4 sm:-mx-6 px-4 sm:px-6 pt-6">
          <div className="relative overflow-hidden rounded-2xl rtvc-hero-gradient border border-border/60">
            <div className="grid lg:grid-cols-2 gap-6 p-6 sm:p-10 lg:p-14 items-center">
              <div className="space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                  {featured.isLive ? (
                    <Badge className="bg-red-700 hover:bg-red-700 text-white gap-1.5">
                      <span className="size-1.5 rounded-full bg-white rtvc-live-pulse" />
                      EN DIRECT MAINTENANT
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1.5">
                      <Sparkles className="size-3 text-amber-500" /> À LA UNE
                    </Badge>
                  )}
                  {featured.category && (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-400">
                      {featured.category.name}
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                  {featured.title}
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg max-w-xl line-clamp-3">
                  {featured.description}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    size="lg"
                    onClick={() => {
                      setSection('vod')
                      openVideo(featured.id)
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Play className="size-5 fill-white" />
                    Regarder
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setSection('live')}
                  >
                    <Radio className="size-5" />
                    Voir le direct
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                  <span className="inline-flex items-center gap-1.5">
                    <Flame className="size-4 text-amber-500" />
                    {featured.viewCount.toLocaleString('fr-FR')} spectateurs
                  </span>
                </div>
              </div>

              <div className="relative aspect-video rounded-xl overflow-hidden rtvc-card-glow">
                {featured.thumbnailUrl && (
                  <Image
                    src={featured.thumbnailUrl}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent" />
                <button
                  onClick={() => {
                    setSection('vod')
                    openVideo(featured.id)
                  }}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label={`Lire : ${featured.title}`}
                >
                  <div className="size-20 rounded-full bg-primary/90 backdrop-blur flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="size-9 text-white fill-white ml-1" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CATÉGORIES */}
      <section className="px-4 sm:px-6 pt-12">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold">Explorer par catégorie</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Trouvez le contenu qui nourrit votre foi.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => {
                setSection('vod')
                setVodCategory(c.slug)
              }}
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${c.color} p-5 text-left aspect-[4/3] flex flex-col justify-end border border-border/40 hover:scale-[1.02] transition-transform`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="relative">
                <p className="font-bold text-white text-base sm:text-lg">{c.name}</p>
                <p className="text-xs text-white/80 mt-0.5">{c.desc}</p>
              </div>
              <ChevronRight className="absolute top-3 right-3 size-5 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </section>

      {/* TENDANCES */}
      <section className="px-4 sm:px-6 pt-12">
        <div className="flex items-end justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-amber-500" />
            <h2 className="text-2xl font-bold">Tendances</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSection('vod')}>
            Tout voir <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <VideoCardSkeleton key={i} />)
            : trending.map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      </section>

      {/* RÉCENTS */}
      <section className="px-4 sm:px-6 pt-12 pb-16">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl font-bold">Dernières publications</h2>
          <Button variant="ghost" size="sm" onClick={() => setSection('vod')}>
            Tout voir <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)
            : recent.map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      </section>
    </div>
  )
}
