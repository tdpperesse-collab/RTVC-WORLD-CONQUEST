'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, X, SlidersHorizontal, Film } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { VideoCard, type VideoItem } from '@/components/rtvc/video-card'
import { VideoCardSkeleton } from '@/components/rtvc/video-card-skeleton'
import { VideoDetailDialog } from '@/components/rtvc/video-detail-dialog'
import { api } from '@/lib/api'
import { useRtvc } from '@/store/rtvc'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
}

export function VodSection() {
  const vodCategory = useRtvc((s) => s.vodCategory)
  const setVodCategory = useRtvc((s) => s.setVodCategory)
  const vodSearch = useRtvc((s) => s.vodSearch)
  const setVodSearch = useRtvc((s) => s.setVodSearch)
  const selectedVideoId = useRtvc((s) => s.selectedVideoId)
  const closeVideo = useRtvc((s) => s.closeVideo)

  const [debouncedSearch, setDebouncedSearch] = useState(vodSearch)

  // Debounce recherche
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(vodSearch), 300)
    return () => clearTimeout(t)
  }, [vodSearch])

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<{ categories: Category[] }>('/api/categories'),
  })
  const categories = catData?.categories ?? []

  const queryString = new URLSearchParams({
    limit: '50',
    ...(vodCategory ? { category: vodCategory } : {}),
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
  }).toString()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['vod', vodCategory, debouncedSearch],
    queryFn: () => api<{ videos: VideoItem[] }>(`/api/videos?${queryString}`),
  })

  const videos = data?.videos ?? []

  return (
    <div className="rtvc-fade-in px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Film className="size-7 text-amber-500" />
          Catalogue vidéo à la demande
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {videos.length} contenu{videos.length > 1 ? 's' : ''} disponible{videos.length > 1 ? 's' : ''}
          {vodCategory && ` dans « ${categories.find((c) => c.slug === vodCategory)?.name ?? vodCategory} »`}
        </p>
      </div>

      {/* Filtres */}
      <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/80 backdrop-blur-xl border-b border-border/60 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={vodSearch}
              onChange={(e) => setVodSearch(e.target.value)}
              placeholder="Rechercher un titre, un thème…"
              className="pl-9 pr-9"
              aria-label="Rechercher"
            />
            {vodSearch && (
              <button
                onClick={() => setVodSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent/50"
                aria-label="Effacer la recherche"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto rtvc-scroll pb-1 -mb-1">
            <SlidersHorizontal className="size-4 text-muted-foreground shrink-0 mr-1" />
            <CategoryPill
              active={!vodCategory}
              onClick={() => setVodCategory(null)}
              label="Toutes"
            />
            {categories.map((c) => (
              <CategoryPill
                key={c.id}
                active={vodCategory === c.slug}
                onClick={() => setVodCategory(vodCategory === c.slug ? null : c.slug)}
                label={c.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grille */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto size-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Aucun résultat</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Essayez une autre recherche ou changez de catégorie.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setVodSearch('')
              setVodCategory(null)
            }}
          >
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <>
          {isFetching && !isLoading && (
            <div className="text-xs text-muted-foreground mb-3 animate-pulse">
              Mise à jour…
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </>
      )}

      {/* Modal de détail */}
      <VideoDetailDialog
        videoId={selectedVideoId}
        onClose={closeVideo}
      />
    </div>
  )
}

function CategoryPill({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-accent'
      )}
    >
      {label}
    </button>
  )
}
