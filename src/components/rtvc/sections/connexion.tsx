'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Loader2, LogIn, UserPlus, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { useRtvc } from '@/store/rtvc'
import { toast } from 'sonner'

export function ConnexionSection() {
  const setSection = useRtvc((s) => s.setSection)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Register state
  const [name, setName] = useState('')
  const [remail, setRemail] = useState('')
  const [rpassword, setRpassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (!res || res.error) {
        toast.error(res?.error ?? 'Identifiants invalides.')
        return
      }
      toast.success('Connexion réussie. Bienvenue !')
      setEmail('')
      setPassword('')
      setSection('home')
      // Recharge la page pour synchroniser la session dans le store
      setTimeout(() => window.location.reload(), 600)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email: remail, password: rpassword }),
      })
      toast.success('Compte créé. Connexion en cours…')
      const res = await signIn('credentials', {
        email: remail,
        password: rpassword,
        redirect: false,
      })
      if (res && !res.error) {
        setName('')
        setRemail('')
        setRpassword('')
        setSection('home')
        setTimeout(() => window.location.reload(), 600)
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Inscription échouée.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rtvc-fade-in px-4 sm:px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Bienvenue sur RTVC Koumé</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connectez-vous pour accéder à votre abonnement et à l'espace personnel.
          </p>
        </div>

        <Card className="border-border/60 rtvc-card-glow">
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <CardHeader className="pb-0">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">
                  <LogIn className="size-4" /> Connexion
                </TabsTrigger>
                <TabsTrigger value="register">
                  <UserPlus className="size-4" /> Inscription
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="vous@exemple.org"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPass ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent/50"
                        aria-label={showPass ? 'Masquer' : 'Afficher'}
                      >
                        {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
                    Se connecter
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="name"
                        required
                        placeholder="Jean Dupont"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="remail">Adresse e-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="remail"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="vous@exemple.org"
                        value={remail}
                        onChange={(e) => setRemail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rpassword">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="rpassword"
                        type={showPass ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        placeholder="Minimum 6 caractères"
                        value={rpassword}
                        onChange={(e) => setRpassword(e.target.value)}
                        className="pl-9 pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent/50"
                        aria-label={showPass ? 'Masquer' : 'Afficher'}
                      >
                        {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                    Créer mon compte
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>

          <CardFooter className="flex-col items-stretch gap-2 border-t pt-4">
            <div className="text-xs text-muted-foreground text-center">
              <p className="font-semibold mb-1">Comptes de démonstration</p>
              <p>Admin : <code className="text-amber-400">admin@rtvc-koume.org</code> / <code className="text-amber-400">admin123</code></p>
              <p>Utilisateur : <code className="text-amber-400">demo@rtvc-koume.org</code> / <code className="text-amber-400">demo123</code></p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
