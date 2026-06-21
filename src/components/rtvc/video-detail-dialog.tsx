'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Calendar, Tag, Share2, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HlsPlayer } from '@/components/rtvc/hls-player'
import { api, formatDuration, timeAgo } from '@/lib/api'
import type { VideoItem } from '@/components/rtvc/video-card'
import { toast } from 'sonner'

interface Props {
  videoId: string | null
  onClose: () => void
}

export function VideoDetailDialog({ videoId, onClose }: Props) {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => api<{ video: VideoItem }>(`/api/videos/${videoId}`),
    enabled: !!videoId,
  })

  const video = data?.video

  const handleViewTracked = () => {
    if (!videoId) return
    fetch(`/api/videos/${videoId}/view`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {})
    qc.invalidateQueries({ queryKey: ['vod'] })
    qc.invalidateQueries({ queryKey: ['home-videos'] })
  }

  const handleShare = async () => {
    if (!video) return
    try {
      if (navigator.share) {
        await navigator.share({ title: video.title, text: video.description ?? '' })
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/?v=${video.id}`)
        toast.success('Lien copié dans le presse-papiers.')
      }
    } catch {}
  }

  return (
    <Dialog open={!!videoId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0 max-h-[95vh] overflow-y-auto rtvc-scroll">
        {isLoading || !video ? (
          <div className="aspect-video bg-muted animate-pulse" />
        ) : (
          <>
            <div className="bg-black">
              <HlsPlayer
                src={video.videoUrl}
                isLive={video.isLive}
                poster={video.thumbnailUrl ?? undefined}
                onViewTracked={handleViewTracked}
                className="rounded-none border-0"
              />
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <DialogHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <DialogTitle className="text-xl sm:text-2xl font-bold leading-tight pr-2">
                    {video.title}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={handleShare}
                    aria-label="Partager"
                  >
                    <Share2 className="size-4" />
                  </Button>
                </div>
                <DialogDescription className="sr-only">
                  Détails de la vidéo {video.title}
                </DialogDescription>
              </DialogHeader>

              {/* Métadonnées */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {video.category && (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-400">
                    <Tag className="size-3" /> {video.category.name}
                  </Badge>
                )}
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3.5" /> {video.viewCount.toLocaleString('fr-FR')} vues
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5" /> {timeAgo(video.publishedAt)}
                </span>
                {!video.isLive && (
                  <span className="inline-flex items-center gap-1">
                    Durée : {formatDuration(video.duration)}
                  </span>
                )}
              </div>

              {/* Description */}
              {video.description && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {video.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                <Button onClick={handleShare} variant="outline" size="sm">
                  <Share2 className="size-4" /> Partager
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
