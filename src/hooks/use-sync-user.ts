'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRtvc } from '@/store/rtvc'

// Synchronise l'utilisateur NextAuth dans le store Zustand global.
export function useSyncUser() {
  const { data: session, status } = useSession()
  const setUser = useRtvc((s) => s.setUser)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        id: (session.user as any).id,
        email: session.user.email ?? undefined,
        name: session.user.name,
        role: (session.user as any).role ?? 'USER',
      })
    } else if (status === 'unauthenticated') {
      setUser(null)
    }
  }, [session, status, setUser])
}
