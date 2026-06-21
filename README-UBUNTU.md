# Plateforme OTT RTVC Koumé

Plateforme de streaming audiovisuel pour la RTVC Koumé (Communauté Missionnaire Chrétienne Internationale).
Projet de stage — Conception et optimisation d'une plateforme OTT intégrant l'accès Internet par satellite.

## Installation rapide sur Ubuntu

```bash
# 1. Extraire l'archive
tar -xzf rtvc-koume-platform.tar.gz
cd rtvc-koume-platform

# 2. Lancer le script d'installation
chmod +x SETUP-UBUNTU.sh
./SETUP-UBUNTU.sh

# 3. Démarrer la plateforme
npm run dev
```

Puis ouvre http://localhost:3000 dans ton navigateur.

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Administrateur | admin@rtvc-koume.org | admin123 |
| Utilisateur | demo@rtvc-koume.org | demo123 |

## Architecture

```
Caméra → OBS Studio → Nginx-RTMP (1935) → HLS (.m3u8 + .ts) → HTTP (8080)
                                                                    ↓
Plateforme Next.js (3000) ← HLS.js ← /live/stream.m3u8
```

## Stack technique

- **Frontend** : Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend** : Next.js API Routes + Prisma ORM (SQLite)
- **Auth** : NextAuth.js v4 (credentials + bcrypt)
- **Streaming** : Nginx-RTMP + FFmpeg + HLS
- **State** : Zustand + TanStack Query

## Fonctionnalités

- ✅ Catalogue VOD avec recherche et filtres
- ✅ Streaming live avec lecteur HLS.js (ABR)
- ✅ Authentification (login/register)
- ✅ Système d'abonnements (Mensuel/Annuel/Premium en FCFA)
- ✅ Paiement mock (Mobile Money / Carte bancaire)
- ✅ Dashboard admin (KPIs, graphiques, CRUD vidéos, gestion abonnés)
- ✅ Mode sombre / clair
- ✅ Responsive mobile-first

## Prérequis serveur de streaming

Pour le flux live, installer séparément Nginx-RTMP + FFmpeg :
1. Compiler Nginx avec le module RTMP (voir le guide fourni)
2. Configurer nginx.conf (RTMP sur 1935, HLS sur 8080)
3. Installer OBS Studio
4. Configurer OBS : `rtmp://localhost/live`, clé `stream`

## Structure du projet

```
├── prisma/
│   ├── schema.prisma      # Schéma de base de données
│   └── seed.ts            # Données de démonstration
├── src/
│   ├── app/
│   │   ├── api/           # Routes API REST
│   │   ├── page.tsx       # Page principale (SPA)
│   │   └── layout.tsx     # Layout + providers
│   ├── components/
│   │   ├── ui/            # Composants shadcn/ui
│   │   └── rtvc/          # Composants métier RTVC
│   ├── lib/               # Utilitaires (auth, db, api)
│   ├── store/             # Stores Zustand
│   └── types/             # Types TypeScript
└── SETUP-UBUNTU.sh        # Script d'installation
```

## Personnalisation des images

Pour remplacer les images par défaut :
1. Place tes images dans `public/images/`
2. Modifie les URLs dans `prisma/seed.ts`
3. Relance le seed : `npx tsx prisma/seed.ts`

## Licence

Projet académique — IUT de Ngaoundéré, Cameroun.
