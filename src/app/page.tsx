'use client'

import { useEffect } from 'react'
import { Header } from '@/components/rtvc/header'
import { Footer } from '@/components/rtvc/footer'
import { HomeSection } from '@/components/rtvc/sections/home'
import { LiveSection } from '@/components/rtvc/sections/live'
import { VodSection } from '@/components/rtvc/sections/vod'
import { AbonnementsSection } from '@/components/rtvc/sections/abonnements'
import { ConnexionSection } from '@/components/rtvc/sections/connexion'
import { AdminSection } from '@/components/rtvc/sections/admin'
import { useRtvc } from '@/store/rtvc'
import { useSyncUser } from '@/hooks/use-sync-user'

export default function Home() {
  const section = useRtvc((s) => s.section)
  useSyncUser()

  // Scroll en haut à chaque changement de section
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [section])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full">
        {section === 'home' && <HomeSection />}
        {section === 'live' && <LiveSection />}
        {section === 'vod' && <VodSection />}
        {section === 'abonnements' && <AbonnementsSection />}
        {section === 'connexion' && <ConnexionSection />}
        {section === 'admin' && <AdminSection />}
      </main>
      <Footer />
    </div>
  )
}
