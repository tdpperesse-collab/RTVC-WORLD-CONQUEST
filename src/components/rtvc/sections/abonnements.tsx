'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Crown,
  Calendar,
  Sparkles,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useSession } from 'next-auth/react'
import { api, formatXAF } from '@/lib/api'
import { useRtvc } from '@/store/rtvc'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    id: 'MONTHLY' as const,
    name: 'Mensuel',
    price: 3000,
    period: '/ mois',
    description: 'Accès complet pour un mois renouvelable.',
    features: [
      'Accès illimité au catalogue VOD',
      'Cultes en direct en HD',
      'Sans publicité',
      'Support par e-mail',
    ],
    icon: Calendar,
    highlighted: false,
  },
  {
    id: 'YEARLY' as const,
    name: 'Annuel',
    price: 30000,
    period: '/ an',
    description: 'Économisez 17% par rapport au mensuel.',
    features: [
      'Tout le plan Mensuel',
      '2 mois offerts',
      'Téléchargement hors-ligne (5 vidéos)',
      'Qualité Full HD 1080p',
      'Support prioritaire',
    ],
    icon: Sparkles,
    highlighted: true,
    badge: 'Le plus populaire',
  },
  {
    id: 'PREMIUM' as const,
    name: 'Premium',
    price: 60000,
    period: '/ an',
    description: 'L\'expérience RTVC Koumé ultime.',
    features: [
      'Tout le plan Annuel',
      'Qualité 4K Ultra HD',
      'Téléchargement illimité',
      'Accès anticipé aux nouveaux contenus',
      'Sessions de prière privées en ligne',
      'Accès aux archives complètes',
    ],
    icon: Crown,
    highlighted: false,
    badge: 'Premium',
  },
]

function planLabel(plan: string): string {
  switch (plan) {
    case 'MONTHLY': return 'Mensuel'
    case 'YEARLY': return 'Annuel'
    case 'PREMIUM': return 'Premium'
    default: return plan.toLowerCase()
  }
}

export function AbonnementsSection() {
  const { data: session } = useSession()
  const setSection = useRtvc((s) => s.setSection)
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[number] | null>(null)
  const [paymentOpen, setPaymentOpen] = useState(false)

  const qc = useQueryClient()
  const { data: subData } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => api<{ subscription: any }>('/api/subscriptions/subscribe'),
    enabled: !!session,
  })
  const activeSub = subData?.subscription

  const openPayment = (plan: typeof PLANS[number]) => {
    if (!session) {
      toast.info('Veuillez vous connecter pour souscrire.')
      setSection('connexion')
      return
    }
    setSelectedPlan(plan)
    setPaymentOpen(true)
  }

  return (
    <div className="rtvc-fade-in px-4 sm:px-6 py-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Badge variant="outline" className="border-amber-500/40 text-amber-400 mb-3">
          Abonnements RTVC
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold">
          Soutenez la mission, accédez à tout le contenu
        </h1>
        <p className="text-muted-foreground mt-3">
          Vos abonnements financent la diffusion de l'Évangile au Cameroun et
          dans les zones rurales d'Afrique francophone par satellite.
        </p>
      </div>

      {/* Bandeau de confiance */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground mb-8">
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-amber-500" /> Paiement sécurisé</span>
        <span className="inline-flex items-center gap-1.5"><Smartphone className="size-4 text-amber-500" /> Mobile Money</span>
        <span className="inline-flex items-center gap-1.5"><CreditCard className="size-4 text-amber-500" /> Carte bancaire</span>
        <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-4 text-amber-500" /> Sans engagement</span>
      </div>

      {/* Souscription active */}
      {activeSub && (
        <div className="mb-8 p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 flex items-center gap-3">
          <CheckCircle2 className="size-6 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              Vous êtes abonné — Formule {planLabel(activeSub.plan)}
            </p>
            <p className="text-xs text-muted-foreground">
              Expire le {new Date(activeSub.expiresAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}

      {/* Grille des plans */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const isCurrent = activeSub?.plan === plan.id
          return (
            <Card
              key={plan.id}
              className={cn(
                'relative flex flex-col',
                plan.highlighted
                  ? 'border-amber-500/60 rtvc-card-glow ring-1 ring-amber-500/30'
                  : 'border-border/60'
              )}
            >
              {plan.badge && (
                <div
                  className={cn(
                    'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap',
                    plan.highlighted ? 'rtvc-gold-gradient text-black' : 'bg-primary text-primary-foreground'
                  )}
                >
                  {plan.badge}
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div
                  className={cn(
                    'mx-auto size-12 rounded-xl flex items-center justify-center mb-2',
                    plan.highlighted ? 'rtvc-gold-gradient text-black' : 'bg-primary/15 text-primary'
                  )}
                >
                  <Icon className="size-6" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-bold">{formatXAF(plan.price)}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="size-4 mt-0.5 text-amber-500 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={cn(
                    'w-full',
                    plan.highlighted ? 'rtvc-gold-gradient text-black hover:opacity-90' : 'bg-primary hover:bg-primary/90'
                  )}
                  onClick={() => openPayment(plan)}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Formule active' : `Choisir ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* FAQ courte */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Questions fréquentes</h2>
        <div className="space-y-3">
          {[
            { q: 'Puis-je annuler à tout moment ?', a: 'Oui, sans engagement. Votre accès reste actif jusqu\'à la fin de la période payée.' },
            { q: 'Le direct est-il inclus ?', a: 'Oui, tous les plans donnent accès au culte en direct en HD minimum.' },
            { q: 'Quels moyens de paiement ?', a: 'Mobile Money (MTN, Orange) et carte bancaire (Visa, Mastercard).' },
            { q: 'Puis-je regarder hors-ligne ?', a: 'Oui, à partir du plan Annuel : téléchargez jusqu\'à 5 vidéos.' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-lg border border-border/60 bg-card/40">
              <p className="font-semibold text-sm">{item.q}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <PaymentDialog
          plan={selectedPlan}
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['my-subscription'] })
          }}
        />
      )}
    </div>
  )
}

function PaymentDialog({
  plan,
  open,
  onOpenChange,
  onSuccess,
}: {
  plan: typeof PLANS[number]
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
}) {
  const [method, setMethod] = useState<'MOBILE_MONEY' | 'CARD'>('MOBILE_MONEY')
  const [phone, setPhone] = useState('')
  const [card, setCard] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      await api('/api/subscriptions/subscribe', {
        method: 'POST',
        body: JSON.stringify({ plan: plan.id, method, phone, card }),
      })
      toast.success(`Paiement confirmé — formule ${plan.name} activée !`)
      onSuccess()
      onOpenChange(false)
      setPhone('')
      setCard('')
    } catch (e: any) {
      toast.error(e.message ?? 'Échec du paiement.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Paiement — Formule {plan.name}</DialogTitle>
          <DialogDescription>
            Montant à payer : <span className="font-bold text-foreground">{formatXAF(plan.price)}</span>. Renseignez vos informations de paiement pour activer la formule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm font-medium">Méthode de paiement</Label>
            <RadioGroup
              value={method}
              onValueChange={(v) => setMethod(v as any)}
              className="grid grid-cols-2 gap-2"
            >
              <label
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                  method === 'MOBILE_MONEY' ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/40'
                )}
              >
                <RadioGroupItem value="MOBILE_MONEY" />
                <Smartphone className="size-4" />
                <span className="text-sm font-medium">Mobile Money</span>
              </label>
              <label
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                  method === 'CARD' ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/40'
                )}
              >
                <RadioGroupItem value="CARD" />
                <CreditCard className="size-4" />
                <span className="text-sm font-medium">Carte bancaire</span>
              </label>
            </RadioGroup>
          </div>

          {method === 'MOBILE_MONEY' ? (
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro Mobile Money</Label>
              <Input
                id="phone"
                inputMode="tel"
                placeholder="6XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                MTN MoMo ou Orange Money. Vous recevrez une demande de validation.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="card">Numéro de carte</Label>
              <Input
                id="card"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={card}
                onChange={(e) => setCard(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Visa, Mastercard. Démonstration — ne saisissez pas de vraies données.
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground flex items-start gap-2 p-3 rounded-lg bg-muted/50">
            <ShieldCheck className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Transaction simulée pour la démonstration — aucun paiement réel ne sera effectué.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={loading} className="bg-primary hover:bg-primary/90">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            Payer {formatXAF(plan.price)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
