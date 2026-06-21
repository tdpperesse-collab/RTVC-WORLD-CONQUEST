'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Film,
  CreditCard,
  Banknote,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Shield,
  Activity,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { api, formatXAF, timeAgo, formatDuration } from '@/lib/api'
import { useRtvc } from '@/store/rtvc'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AdminStats {
  stats: {
    totalUsers: number
    totalVideos: number
    totalSubscriptions: number
    totalRevenue: number
    currency: string
    totalViews: number
  }
  viewsByDay: { date: string; label: string; count: number }[]
  topVideos: any[]
  recentSubscriptions: any[]
  recentVideos: any[]
}

export function AdminSection() {
  const { data: session } = useSession()
  const setSection = useRtvc((s) => s.setSection)
  const [tab, setTab] = useState<'overview' | 'videos' | 'subscribers'>('overview')
  const [editing, setEditing] = useState<any | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const qc = useQueryClient()
  const { data, isLoading, refetch } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api<AdminStats>('/api/admin/stats'),
  })

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="px-4 sm:px-6 py-20 text-center">
        <Shield className="size-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Accès réservé</h1>
        <p className="text-muted-foreground mt-2">
          Vous devez être connecté en tant qu'administrateur.
        </p>
        <Button className="mt-4 bg-primary" onClick={() => setSection('connexion')}>
          Se connecter
        </Button>
      </div>
    )
  }

  const stats = data?.stats
  const cards = [
    { label: 'Utilisateurs', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-rose-400' },
    { label: 'Vidéos publiées', value: stats?.totalVideos ?? 0, icon: Film, color: 'text-amber-400' },
    { label: 'Abonnés actifs', value: stats?.totalSubscriptions ?? 0, icon: CreditCard, color: 'text-rose-300' },
    { label: 'Revenus', value: formatXAF(stats?.totalRevenue ?? 0), icon: Banknote, color: 'text-amber-500' },
  ]

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette vidéo ? Cette action est irréversible.')) return
    try {
      await api(`/api/videos/${id}`, { method: 'DELETE' })
      toast.success('Vidéo supprimée.')
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      qc.invalidateQueries({ queryKey: ['vod'] })
      qc.invalidateQueries({ queryKey: ['home-videos'] })
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur.')
    }
  }

  return (
    <div className="rtvc-fade-in px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Shield className="size-7 text-amber-500" />
            Tableau de bord administrateur
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vue d'ensemble de la plateforme RTVC Koumé.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <Activity className="size-4" /> Actualiser
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => { setEditing(null); setCreateOpen(true) }}
          >
            <Plus className="size-4" /> Ajouter une vidéo
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border/60 overflow-x-auto rtvc-scroll">
        {([
          { id: 'overview', label: 'Vue d\'ensemble' },
          { id: 'videos', label: 'Gestion des vidéos' },
          { id: 'subscribers', label: 'Abonnés' },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading || !data ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <>
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((c) => {
                  const Icon = c.icon
                  return (
                    <Card key={c.label} className="border-border/60">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{c.label}</p>
                            <p className="text-2xl font-bold mt-1">{c.value}</p>
                          </div>
                          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className={cn('size-5', c.color)} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Graphique des vues */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="size-5 text-amber-500" />
                    Vues des 14 derniers jours
                  </CardTitle>
                  <CardDescription>
                    Total : {data.stats.totalViews.toLocaleString('fr-FR')} vues enregistrées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.viewsByDay} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.62 0.20 25)" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="oklch(0.62 0.20 25)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'oklch(0.7 0 0)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: 'oklch(0.7 0 0)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            background: 'oklch(0.18 0.012 25)',
                            border: '1px solid oklch(1 0 0 / 0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '12px',
                          }}
                          labelStyle={{ color: 'oklch(0.80 0.17 80)' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          name="Vues"
                          stroke="oklch(0.62 0.20 25)"
                          strokeWidth={2}
                          fill="url(#viewsGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top vidéos + abonnés récents */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="text-lg">Top vidéos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.topVideos.map((v, i) => (
                        <div key={v.id} className="flex items-center gap-3">
                          <div className="size-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </div>
                          <div className="relative w-16 aspect-video rounded-md overflow-hidden shrink-0 bg-muted">
                            {v.thumbnailUrl && (
                              <Image src={v.thumbnailUrl} alt={v.title} fill sizes="64px" className="object-cover" unoptimized />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{v.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Eye className="size-3" /> {v.viewCount.toLocaleString('fr-FR')} vues
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">{v.category?.name}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="text-lg">Abonnés récents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-72 overflow-y-auto rtvc-scroll space-y-2">
                      {data.recentSubscriptions.length === 0 && (
                        <p className="text-sm text-muted-foreground">Aucun abonné pour le moment.</p>
                      )}
                      {data.recentSubscriptions.map((s) => (
                        <div key={s.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-accent/30">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{s.user?.name ?? s.user?.email}</p>
                            <p className="text-xs text-muted-foreground">{timeAgo(s.startedAt)}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {s.plan === 'MONTHLY' ? 'Mensuel' : s.plan === 'YEARLY' ? 'Annuel' : 'Premium'}
                            </Badge>
                            <p className="text-xs text-amber-500 font-semibold mt-0.5">
                              {formatXAF(s.payments?.[0]?.amount ?? 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {tab === 'videos' && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Toutes les vidéos</CardTitle>
                <CardDescription>Gérez le catalogue VOD et les diffusions live.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto rtvc-scroll">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Miniature</TableHead>
                        <TableHead>Titre</TableHead>
                        <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                        <TableHead className="text-right">Vues</TableHead>
                        <TableHead className="hidden sm:table-cell">Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentVideos.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell>
                            <div className="relative w-16 aspect-video rounded-md overflow-hidden bg-muted">
                              {v.thumbnailUrl && (
                                <Image src={v.thumbnailUrl} alt={v.title} fill sizes="64px" className="object-cover" unoptimized />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm line-clamp-1 max-w-xs">{v.title}</div>
                            <div className="text-xs text-muted-foreground">{formatDuration(v.duration)}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="text-xs">{v.category?.name}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">{v.viewCount.toLocaleString('fr-FR')}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {v.isLive ? (
                              <Badge className="bg-red-700 text-white text-xs">LIVE</Badge>
                            ) : v.isPublished ? (
                              <Badge variant="secondary" className="text-xs">Publié</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Brouillon</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label="Modifier"
                                onClick={() => { setEditing(v); setCreateOpen(true) }}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive hover:text-destructive"
                                aria-label="Supprimer"
                                onClick={() => handleDelete(v.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'subscribers' && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Liste des abonnés</CardTitle>
                <CardDescription>Abonnements récents et actifs.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto rtvc-scroll">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Abonné</TableHead>
                        <TableHead>Formule</TableHead>
                        <TableHead className="hidden sm:table-cell">Méthode</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead className="hidden md:table-cell">Depuis</TableHead>
                        <TableHead>Expire</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentSubscriptions.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="font-medium text-sm">{s.user?.name}</div>
                            <div className="text-xs text-muted-foreground">{s.user?.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {s.plan === 'MONTHLY' ? 'Mensuel' : s.plan === 'YEARLY' ? 'Annuel' : 'Premium'}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">
                            {s.payments?.[0]?.method === 'MOBILE_MONEY' ? 'Mobile Money' : 'Carte'}
                          </TableCell>
                          <TableCell className="text-right text-amber-500 font-semibold text-sm">
                            {formatXAF(s.payments?.[0]?.amount ?? 0)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {timeAgo(s.startedAt)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(s.expiresAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <VideoFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        editing={editing}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['admin-stats'] })
          qc.invalidateQueries({ queryKey: ['vod'] })
          qc.invalidateQueries({ queryKey: ['home-videos'] })
          qc.invalidateQueries({ queryKey: ['live-videos'] })
        }}
      />
    </div>
  )
}

function VideoFormDialog({
  open,
  onOpenChange,
  editing,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: any | null
  onSuccess: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')
  const [duration, setDuration] = useState('0')
  const [categoryId, setCategoryId] = useState('')
  const [isLive, setIsLive] = useState(false)
  const [isPublished, setIsPublished] = useState(true)
  const [loading, setLoading] = useState(false)

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<{ categories: any[] }>('/api/categories'),
    enabled: open,
  })

  // Sync form quand on édite
  useState(() => {
    if (editing) {
      setTitle(editing.title ?? '')
      setDescription(editing.description ?? '')
      setThumbnailUrl(editing.thumbnailUrl ?? '')
      setVideoUrl(editing.videoUrl ?? '')
      setDuration(String(editing.duration ?? '0'))
      setCategoryId(editing.categoryId ?? '')
      setIsLive(editing.isLive ?? false)
      setIsPublished(editing.isPublished ?? true)
    }
  })

  // Reset quand on ferme
  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setTimeout(() => {
        setTitle(''); setDescription(''); setThumbnailUrl('')
        setVideoUrl('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')
        setDuration('0'); setCategoryId(''); setIsLive(false); setIsPublished(true)
      }, 200)
    }
    onOpenChange(v)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !videoUrl || !categoryId) {
      toast.error('Titre, URL vidéo et catégorie sont requis.')
      return
    }
    setLoading(true)
    try {
      const body = { title, description, thumbnailUrl, videoUrl, duration: Number(duration) || 0, categoryId, isLive, isPublished }
      if (editing) {
        await api(`/api/videos/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
        toast.success('Vidéo mise à jour.')
      } else {
        await api('/api/videos', { method: 'POST', body: JSON.stringify(body) })
        toast.success('Vidéo créée.')
      }
      onSuccess()
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur.')
    } finally {
      setLoading(false)
    }
  }

  // Sync si editing change
  if (open && editing && title === '' && editing.title) {
    setTitle(editing.title)
    setDescription(editing.description ?? '')
    setThumbnailUrl(editing.thumbnailUrl ?? '')
    setVideoUrl(editing.videoUrl ?? '')
    setDuration(String(editing.duration ?? '0'))
    setCategoryId(editing.categoryId ?? '')
    setIsLive(editing.isLive ?? false)
    setIsPublished(editing.isPublished ?? true)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto rtvc-scroll">
        <DialogHeader>
          <DialogTitle>{editing ? 'Modifier la vidéo' : 'Nouvelle vidéo'}</DialogTitle>
          <DialogDescription>
            Renseignez les informations de la vidéo. Les champs marqués d'un * sont requis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Culte du dimanche — La grâce de Dieu" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Résumé du contenu, versets bibliques, etc." />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">URL miniature</Label>
              <Input id="thumbnailUrl" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://…/image.jpg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Durée (secondes)</Label>
              <Input id="duration" type="number" min="0" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="3600" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL de la vidéo (HLS .m3u8 ou .mp4) *</Label>
            <Input id="videoUrl" required value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…/stream.m3u8" />
            <p className="text-xs text-muted-foreground">
              Pour un direct local : <code className="px-1 rounded bg-muted">/live/stream.m3u8?XTransformPort=8080</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {catData?.categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between p-3 rounded-lg border border-border/60 bg-muted/30">
            <div className="flex items-center gap-3">
              <Switch id="isLive" checked={isLive} onCheckedChange={setIsLive} />
              <Label htmlFor="isLive" className="cursor-pointer">
                <span className="text-sm font-medium">Diffusion en direct</span>
                <span className="block text-xs text-muted-foreground">Marque la vidéo comme LIVE</span>
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="isPublished" checked={isPublished} onCheckedChange={setIsPublished} />
              <Label htmlFor="isPublished" className="cursor-pointer">
                <span className="text-sm font-medium">Publier</span>
                <span className="block text-xs text-muted-foreground">Visible publiquement</span>
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {editing ? 'Enregistrer' : 'Créer la vidéo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
