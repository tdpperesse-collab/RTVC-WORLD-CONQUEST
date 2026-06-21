'use client'

// Lecteur HLS — charge hls.js dynamiquement depuis un CDN.
// Affiche les états : chargement, erreur, badge EN DIRECT, plein écran.

import { useEffect, useRef, useState, useCallback } from 'react'
import { Maximize, Minimize, AlertTriangle, Loader2, Radio, Volume2, VolumeX, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HlsPlayerProps {
  src: string
  isLive?: boolean
  poster?: string
  className?: string
  onViewTracked?: () => void
}

// Déclaration globale pour hls.js chargé via CDN
declare global {
  interface Window {
    Hls?: any
  }
}

let hlsPromise: Promise<any> | null = null
function loadHls(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.Hls) return Promise.resolve(window.Hls)
  if (hlsPromise) return hlsPromise
  hlsPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest'
    s.async = true
    s.onload = () => {
      if (window.Hls) resolve(window.Hls)
      else reject(new Error('hls.js non chargé'))
    }
    s.onerror = () => reject(new Error('Échec du chargement de hls.js'))
    document.head.appendChild(s)
  })
  return hlsPromise
}

export function HlsPlayer({ src, isLive = false, poster, className, onViewTracked }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<any>(null)
  const viewTrackedRef = useRef(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // Initialisation du lecteur
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let destroyed = false
    setLoading(true)
    setError(null)
    viewTrackedRef.current = false

    // Détermine si on doit utiliser le flux local via le gateway Caddy
    // (le caller peut passer un src relatif de type /live/stream.m3u8?XTransformPort=8080)
    const isHls = src.includes('.m3u8')

    const onLoaded = () => {
      if (destroyed) return
      setLoading(false)
      video.play().catch(() => {/* autoplay peut être bloqué */})
    }
    const onPlaying = () => { setPlaying(true); setLoading(false) }
    const onPause = () => setPlaying(false)
    const onErrorEv = () => {
      if (destroyed) return
      setError('Une erreur est survenue lors de la lecture.')
      setLoading(false)
    }
    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('playing', onPlaying)
    video.addEventListener('pause', onPause)
    video.addEventListener('error', onErrorEv)

    if (isHls) {
      // Safari natif
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src
      } else {
        loadHls()
          .then((Hls) => {
            if (destroyed) return
            if (!Hls.isSupported()) {
              setError('HLS non supporté par ce navigateur.')
              setLoading(false)
              return
            }
            const hls = new Hls({ enableWorker: true, lowLatencyMode: isLive })
            hlsRef.current = hls
            hls.loadSource(src)
            hls.attachMedia(video)
            hls.on(Hls.Events.ERROR, (_evt: any, data: any) => {
              if (data?.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    hls.startLoad()
                    setError('Flux réseau indisponible — reconnexion...')
                    break
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    hls.recoverMediaError()
                    break
                  default:
                    setError('Flux vidéo indisponible. Réessayez plus tard.')
                    setLoading(false)
                    hls.destroy()
                    break
                }
              }
            })
          })
          .catch(() => {
            setError('Impossible de charger le lecteur vidéo.')
            setLoading(false)
          })
      }
    } else {
      // MP4 direct
      video.src = src
    }

    // Trace la vue après 5 secondes de lecture effective
    const trackTimer = setTimeout(() => {
      if (!destroyed && !viewTrackedRef.current) {
        viewTrackedRef.current = true
        onViewTracked?.()
      }
    }, 5000)

    return () => {
      destroyed = true
      clearTimeout(trackTimer)
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('error', onErrorEv)
      if (hlsRef.current) {
        try { hlsRef.current.destroy() } catch {}
        hlsRef.current = null
      }
      video.removeAttribute('src')
      try { video.load() } catch {}
    }
  }, [src, isLive, onViewTracked])

  // Suivi du mode plein écran
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {})
    else document.exitFullscreen?.().catch(() => {})
  }, [])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }, [])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }, [])

  // Auto-hide controls
  useEffect(() => {
    if (!showControls) return
    const t = setTimeout(() => setShowControls(false), 3500)
    return () => clearTimeout(t)
  }, [showControls, playing])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative group bg-black overflow-hidden rounded-xl aspect-video select-none',
        className
      )}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        muted={isLive ? true : muted}
        controls={false}
        className="absolute inset-0 w-full h-full object-contain bg-black"
      />

      {/* Badge EN DIRECT */}
      {isLive && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-red-700/95 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-lg">
          <span className="size-2 rounded-full bg-white rtvc-live-pulse" />
          EN DIRECT
          <Radio className="size-3.5" />
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 text-white z-20">
          <Loader2 className="size-10 animate-spin text-amber-500" />
          <p className="text-sm">{isLive ? 'Connexion au direct…' : 'Chargement de la vidéo…'}</p>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 text-white z-20 p-4 text-center">
          <AlertTriangle className="size-10 text-amber-500" />
          <p className="text-sm font-medium max-w-md">{error}</p>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
            onClick={() => {
              setError(null)
              setLoading(true)
              // Force reload
              const v = videoRef.current
              if (v) {
                const cur = v.src
                v.src = ''
                setTimeout(() => { v.src = cur; v.load() }, 100)
              }
            }}
          >
            Réessayer
          </Button>
        </div>
      )}

      {/* Contrôles */}
      {!error && !loading && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 to-transparent p-3 flex items-center gap-2 transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 size-9"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Lecture'}
          >
            {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 size-9"
            onClick={toggleMute}
            aria-label={muted ? 'Activer le son' : 'Couper le son'}
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </Button>
          <div className="flex-1" />
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 size-9"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
          </Button>
        </div>
      )}
    </div>
  )
}
