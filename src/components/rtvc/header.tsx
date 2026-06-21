'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  Home,
  Radio,
  Film,
  CreditCard,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Shield,
  User as UserIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRtvc, type Section } from '@/store/rtvc'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const NAV: { id: Section; label: string; icon: any }[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'live', label: 'Live', icon: Radio },
  { id: 'vod', label: 'VOD', icon: Film },
  { id: 'abonnements', label: 'Abonnements', icon: CreditCard },
]

export function Header() {
  const { section, setSection, user } = useRtvc()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentUser = session?.user ?? user
  const isAdmin = currentUser?.role === 'ADMIN'

  const go = (s: Section) => {
    setSection(s)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => go('home')}
          className="flex items-center gap-2.5 shrink-0 group"
          aria-label="Accueil RTVC Koumé"
        >
          <Image
            src="/logo.svg"
            alt="Logo RTVC Koumé"
            width={40}
            height={40}
            className="size-9 sm:size-10 transition-transform group-hover:scale-105"
            priority
          />
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">
              <span className="rtvc-gold-text">RTVC</span>{' '}
              <span className="text-foreground">Koumé</span>
            </span>
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Communauté Missionnaire
            </span>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = section === item.id
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            )
          })}
          {isAdmin && (
            <button
              onClick={() => go('admin')}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                section === 'admin'
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              )}
            >
              <Shield className="size-4" />
              Admin
            </button>
          )}
        </nav>

        <div className="flex-1" />

        {/* Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Changer de thème"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-accent/50 transition-colors">
                  <Avatar className="size-8 border border-border">
                    <AvatarFallback className="rtvc-burgundy-gradient text-white text-xs font-bold">
                      {(currentUser.name ?? currentUser.email ?? 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline text-sm font-medium max-w-[120px] truncate">
                    {currentUser.name ?? currentUser.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-sm font-semibold truncate">{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{currentUser.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => go('abonnements')}>
                  <CreditCard className="size-4 mr-2" /> Mon abonnement
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => go('admin')}>
                    <Shield className="size-4 mr-2" /> Tableau de bord
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-destructive focus:text-destructive">
                  <LogOut className="size-4 mr-2" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => go('connexion')} size="sm" className="bg-primary hover:bg-primary/90">
              <LogIn className="size-4" /> Connexion
            </Button>
          )}
        </div>

        {/* Mobile button */}
        <button
          className="md:hidden inline-flex items-center justify-center size-10 rounded-md hover:bg-accent/50"
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {NAV.map((item) => {
              const Icon = item.icon
              const active = section === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={cn(
                    'inline-flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left',
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              )
            })}
            {isAdmin && (
              <button
                onClick={() => go('admin')}
                className={cn(
                  'inline-flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left',
                  section === 'admin'
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                )}
              >
                <Shield className="size-4" /> Admin
              </button>
            )}
            <div className="border-t border-border/60 my-2" />
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex-1"
              >
                {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              </Button>
              {currentUser ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex-1 text-destructive"
                >
                  <LogOut className="size-4" /> Déconnexion
                </Button>
              ) : (
                <Button onClick={() => go('connexion')} size="sm" className="flex-1 bg-primary">
                  <LogIn className="size-4" /> Connexion
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
