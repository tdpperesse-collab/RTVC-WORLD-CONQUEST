// Helpers pour les appels API relatifs (compatibles gateway Caddy).
// On n'utilise jamais d'URL absolue — tout passe par fetch relatif.

export async function api<T = any>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })
  const text = await res.text()
  const data = text ? safeParse(text) : null
  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && 'error' in data && (data as any).error) ||
      `Erreur ${res.status}`
    throw new Error(typeof msg === 'string' ? msg : 'Erreur inconnue')
  }
  return data as T
}

function safeParse(s: string) {
  try { return JSON.parse(s) } catch { return s }
}

export function formatXAF(amount: number | string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' FCFA'
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'à l\'instant'
  const min = Math.floor(sec / 60)
  if (min < 60) return `il y a ${min} min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `il y a ${hr} h`
  const day = Math.floor(hr / 24)
  if (day < 30) return `il y a ${day} j`
  const month = Math.floor(day / 30)
  if (month < 12) return `il y a ${month} mois`
  return `il y a ${Math.floor(month / 12)} an(s)`
}
