'use client'

import { Radio, Mail, Phone, MapPin, Heart } from 'lucide-react'
import { useRtvc, type Section } from '@/store/rtvc'

export function Footer() {
  const setSection = useRtvc((s) => s.setSection)

  const links: { label: string; section: Section }[] = [
    { label: 'Accueil', section: 'home' },
    { label: 'Direct', section: 'live' },
    { label: 'Catalogue VOD', section: 'vod' },
    { label: 'Abonnements', section: 'abonnements' },
  ]

  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-9 rounded-md rtvc-burgundy-gradient flex items-center justify-center">
              <Radio className="size-5 text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-base">
                <span className="rtvc-gold-text">RTVC</span> Koumé
              </p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                Communauté Missionnaire Chrétienne Internationale
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Plateforme OTT audiovisuelle chrétienne diffusant l'Évangile au Cameroun
            et en Afrique francophone. Cultes en direct, enseignements, témoignages
            et louanges, accessibles même dans les zones rurales via satellite.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">Navigation</p>
          <ul className="space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.section}>
                <button
                  onClick={() => setSection(l.section)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">Contact</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="size-4 mt-0.5 shrink-0 text-amber-500" />
              Koumé, Région de l'Adamaoua, Cameroun
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-amber-500" />
              +237 6XX XXX XXX
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-amber-500" />
              contact@rtvc-koume.org
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} RTVC Koumé — Tous droits réservés.</p>
          <p className="flex items-center gap-1.5">
            Conçu avec <Heart className="size-3.5 text-red-500 fill-red-500" /> pour la gloire de Dieu
          </p>
        </div>
      </div>
    </footer>
  )
}
