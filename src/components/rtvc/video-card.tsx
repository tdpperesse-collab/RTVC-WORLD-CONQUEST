'use client'

import Image from 'next/image'
import { Play, Eye, Clock, Radio } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/api'
import { useRtvc } from '@/store/rtvc'

export interface VideoItem {
  id: string
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  videoUrl: string
  duration: number
  viewCount: number
  isLive: boolean
  publishedAt: string | Date
  category?: { id: string; name: string; slug: string } | null
}

interface VideoCardProps {
  video: VideoItem
  className?: string
}

export function VideoCard({ video, className }: VideoCardProps) {
  const openVideo = useRtvc((s) => s.openVideo)
  const setSection = useRtvc((s) => s.setSection)
  const setVodCategory = useRtvc((s) => s.setVodCategory)

  const open = () => {
    setSection('vod')
    openVideo(video.id)
  }

  return (
    <article
      className={cn(
        'group cursor-pointer rtvc-card-glow rounded-xl overflow-hidden bg-card border border-border/60 transition-all hover:border-primary/60 hover:-translate-y-0.5',
        className
      )}
      onClick={open}
      role="button"
      tabIndex={0}
      aria-label={`Lire la vidéo : ${video.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open()
        }
      }}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 rtvc-burgundy-gradient" />
        )}

        {/* Overlay play */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="size-14 rounded-full bg-primary/90 backdrop-blur flex items-center justify-center shadow-xl">
            <Play className="size-7 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2">
          {video.isLive ? (
            <span className="inline-flex items-center gap-1 bg-red-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow">
              <span className="size-1.5 rounded-full bg-white rtvc-live-pulse" />
              EN DIRECT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-black/70 text-white text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur">
              <Clock className="size-3" />
              {formatDuration(video.duration)}
            </span>
          )}
          {video.category && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSection('vod')
                setVodCategory(video.category!.slug)
              }}
              className="bg-amber-500/90 hover:bg-amber-400 text-black text-[11px] font-semibold px-2 py-0.5 rounded-md backdrop-blur transition-colors"
            >
              {video.category.name}
            </button>
          )}
        </div>

        {/* Live icon */}
        {video.isLive && (
          <div className="absolute bottom-2 right-2">
            <Radio className="size-5 text-white drop-shadow" />
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        {video.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {video.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3" />
            {video.viewCount.toLocaleString('fr-FR')} vues
          </span>
          <span className="opacity-50">•</span>
          <span className="truncate">
            {new Date(video.publishedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </article>
  )
}
