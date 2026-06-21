'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'
import { Radio, Flame, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HlsPlayer } from '@/components/rtvc/hls-player'
import { api } from '@/lib/api'
import { useRtvc } from '@/store/rtvc'
import type { VideoItem } from '@/components/rtvc/video-card'

// Flux live local via le gateway Caddy (Nginx-RTMP sur le port 8080).
// On retombe sur un flux HLS public de démo si le flux local n'est pas actif.
const LOCAL_LIVE_URL = '/live/stream.m3u8?XTransformPort=8080'
const FALLBACK_LIVE_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'

export function LiveSection() {
  const openVideo = useRtvc((s) => s.openVideo)
  const setSection = useRtvc((s) => s.setSection)
  const [useFallback, setUseFallback] = useState(false)

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['live-videos'],
    queryFn: () => api<{ videos: VideoItem[] }>('/api/videos?live=1&limit=6'),
  })

  const liveVideo = data?.videos?.[0]
  const otherLives = (data?.videos ?? []).slice(1, 5)
  const streamUrl = useFallback ? FALLBACK_LIVE_URL : LOCAL_LIVE_URL

  return (
    <div className="rtvc-fade-in px-4 sm:px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-red-700 text-white px-2.5 py-1 rounded-md text-xs font-bold">
            <span className="size-2 rounded-full bg-white rtvc-live-pulse" />
            EN DIRECT
          </span>
          <Badge variant="outline" className="border-amber-500/40 text-amber-400">
            <Radio className="size-3" /> Culte en direct
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2">Diffusion en direct</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Culte dominical diffusé en direct depuis Koumé. Rediffusion disponible après la fin du direct.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lecteur principal */}
        <div className="lg:col-span-2 space-y-3">
          <HlsPlayer
            key={streamUrl}
            src={streamUrl}
            isLive
            poster={liveVideo?.thumbnailUrl ?? undefined}
            className="w-full rtvc-card-glow"
          />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-bold">{liveVideo?.title ?? 'Culte en direct — RTVC Koumé'}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <Flame className="size-3.5 text-amber-500" />
                {liveVideo ? `${liveVideo.viewCount.toLocaleString('fr-FR')} spectateurs` : 'Diffusion en cours'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseFallback((v) => !v)}
              >
                {useFallback ? 'Flux local' : 'Flux de démonstration'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Rafraîchir"
                onClick={() => refetch()}
              >
                <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          {liveVideo?.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{liveVideo.description}</p>
          )}
        </div>

        {/* Sidebar — autres directs / rediffusions */}
        <aside className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Autres programmes
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto rtvc-scroll pr-1">
            {otherLives.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucune autre diffusion pour le moment.</p>
            )}
            {otherLives.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSection('vod')
                  openVideo(v.id)
                }}
                className="w-full flex gap-3 p-2 rounded-lg hover:bg-accent/40 transition-colors text-left group"
              >
                <div className="relative w-32 aspect-video rounded-md overflow-hidden shrink-0 bg-muted">
                  {v.thumbnailUrl && (
                    <Image
                      src={v.thumbnailUrl}
                      alt={v.title}
                      fill
                      sizes="128px"
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {v.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {v.viewCount.toLocaleString('fr-FR')} vues
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Note technique pour la soutenance */}
      <div className="mt-8 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 text-sm">
        <p className="font-semibold text-amber-500 mb-1 flex items-center gap-2">
          <AlertCircle className="size-4" /> Détails techniques
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Le flux live provient du serveur <code className="px-1 py-0.5 rounded bg-muted">Nginx-RTMP</code> local
          (port 8080) via HLS, conformément au cahier des charges. En l'absence d'un encodeur
          actif, un flux de démonstration peut être utilisé via le bouton ci-dessus. L'URL utilisée
          est <code className="px-1 py-0.5 rounded bg-muted">/live/stream.m3u8?XTransformPort=8080</code> pour passer
          par la passerelle Caddy.
        </p>
      </div>
    </div>
  )
}
