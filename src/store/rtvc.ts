'use client'

// Store Zustand — Navigation SPA + état UI global de la plateforme RTVC Koumé.
import { create } from 'zustand'

export type Section = 'home' | 'live' | 'vod' | 'abonnements' | 'connexion' | 'admin'

interface RtvcState {
  section: Section
  // VOD — vidéo actuellement sélectionnée pour le modal de lecture
  selectedVideoId: string | null
  // Filtre catégorie courant (VOD)
  vodCategory: string | null
  vodSearch: string
  // Auth / utilisateur courant (récupéré côté client après login)
  user: { id?: string; email?: string; name?: string | null; role?: 'USER' | 'ADMIN' } | null
  setSection: (s: Section) => void
  openVideo: (id: string) => void
  closeVideo: () => void
  setVodCategory: (c: string | null) => void
  setVodSearch: (s: string) => void
  setUser: (u: RtvcState['user']) => void
}

export const useRtvc = create<RtvcState>((set) => ({
  section: 'home',
  selectedVideoId: null,
  vodCategory: null,
  vodSearch: '',
  user: null,
  setSection: (s) => set({ section: s, selectedVideoId: null }),
  openVideo: (id) => set({ selectedVideoId: id }),
  closeVideo: () => set({ selectedVideoId: null }),
  setVodCategory: (c) => set({ vodCategory: c }),
  setVodSearch: (s) => set({ vodSearch: s }),
  setUser: (u) => set({ user: u }),
}))
