# Worklog — Projet Plateforme OTT RTVC Koumé

Projet : Conception et optimisation d'une plateforme OTT audiovisuelle intégrant l'accès Internet par satellite
Étudiant : Stage DUT (IUT de Ngaoundéré, Cameroun) — soutenance dans 2 semaines
Stack retenue : Next.js 16 + TypeScript + Prisma (SQLite) + Nginx-RTMP + FFmpeg + HLS
Partie satellite : Documentation/maquette (pas de tests réels Starlink)

---
Task ID: 1
Agent: Orchestrateur (Claude principal)
Task: Initialisation du worklog et lancement des chantiers parallèles

Work Log:
- Lecture des documents THEME DE STAGE.docx et Cahier_des_Charges_RTVC_Koume.docx
- Validation des choix utilisateur : Option A (Next.js), Ubuntu 26.04 LTS / 11 Go RAM, satellite en doc
- Création du worklog partagé
- Lancement du chantier plateforme Next.js (Task 2-a, agent full-stack)
- Rédaction du guide Nginx-RTMP pour Ubuntu (Task 2-b, livré dans le chat)

Stage Summary:
- Worklog initialisé
- Deux chantiers parallèles démarrés : plateforme web + guide streaming
- Palette retenue pour la plateforme : rouge profond + or (chaîne chrétienne RTVC Koumé), pas de bleu/indigo

---
Task ID: 2-a
Agent: full-stack-developer
Task: Build the complete OTT streaming platform (Next.js)

Work Log:
- Lecture du worklog initial + audit du projet Next.js existant (package.json, prisma, globals.css, components/ui shadcn déjà en place).
- Installation de bcryptjs pour le hash des mots de passe (CredentialsProvider NextAuth).
- Rédaction du schéma Prisma complet : User (avec role USER/ADMIN), Category, Video (avec isLive/isPublished/viewCount), Subscription, Payment (XAF, MOBILE_MONEY/CARD), ViewStat. Relations et onDelete cascade configurés. `bun run db:push` exécuté avec succès.
- Création du script `prisma/seed.ts` : 1 admin (admin@rtvc-koume.org / admin123), 1 user démo (demo@rtvc-koume.org / demo123), 5 catégories (Cultes, Enseignements, Témoignages, Musique, Jeunesse), 11 vidéos (10 VOD + 1 LIVE) avec titres français réalistes, 1 abonnement démo, 60 ViewStats simulées sur 14 jours. Exécuté avec succès.
- Refonte de `src/app/globals.css` : palette chrétienne bordeaux + or en OKLCH (aucun bleu/indigo), mode sombre par défaut, scrollbar custom, dégradés décoratifs, animations (pulse EN DIRECT, fade-in).
- Layout mis à jour : langue fr, Providers (SessionProvider + ThemeProvider dark + QueryClientProvider), Toaster sonner, métadonnées françaises RTVC Koumé, logo SVG personnalisé (croix dorée + ondes de diffusion).
- Configuration NextAuth v4 (`src/lib/auth.ts`) : CredentialsProvider + bcrypt, callbacks JWT/session exposant `id` et `role`, secret dév. Types étendus dans `src/types/next-auth.d.ts`.
- API routes créées (App Router) :
  • /api/auth/[...nextauth] — handler NextAuth
  • /api/auth/register — inscription (zod + bcrypt)
  • /api/videos (GET public avec filtres category/q/live/limit, POST admin)
  • /api/videos/[id] (GET, PUT admin, DELETE admin)
  • /api/videos/[id]/view (POST — incrémente viewCount + crée ViewStat)
  • /api/categories (GET avec _count videos)
  • /api/subscriptions/subscribe (POST — crée subscription + payment, GET — abonnement actif utilisateur)
  • /api/admin/stats (GET admin — KPIs + vues 14 jours + top vidéos + abonnés récents)
- Store Zustand (`src/store/rtvc.ts`) : navigation SPA entre 6 sections, vidéo sélectionnée, filtres VOD, user sync.
- Composant lecteur HLS (`src/components/rtvc/hls-player.tsx`) : charge hls.js depuis CDN jsdelivr, gère états chargement/erreur, badge EN DIRECT pulsé, contrôles personnalisés (play/pause, mute, plein écran), traçage de vue après 5s. URL live locale `/live/stream.m3u8?XTransformPort=8080` (passe par Caddy) avec fallback flux démo Mux.
- App shell : Header sticky (logo + nav desktop/mobile + toggle thème + menu user dropdown + bouton Admin conditionnel) et Footer sticky (`mt-auto` sur root `min-h-screen flex flex-col`).
- 6 sections SPA construites :
  • Accueil : hero bannière + vidéo à la une + grille 5 catégories + tendances + dernières publications.
  • Live : lecteur HLS principal + sidebar autres programmes + note technique pour soutenance.
  • VOD : grille catalog avec recherche debounce + filtres catégorie pills (sticky) + modal détail avec lecteur + métadonnées + partage.
  • Abonnements : 3 formules (Mensuel 3000, Annuel 30000, Premium 60000 FCFA) + bandeau souscription active + dialog paiement Mobile Money/Carte + FAQ.
  • Connexion : tabs Login/Register avec validation, comptes démo affichés.
  • Admin : KPIs (users, vidéos, abonnés, revenus XAF) + graphe recharts AreaChart vues 14 jours + top vidéos + abonnés récents + table gestion vidéos (CRUD) + table abonnés + dialog formulaire vidéo complet.
- `src/app/page.tsx` assemblé : Header + main (section active) + Footer, scroll-to-top sur changement de section, useSyncUser pour synchroniser session dans le store.
- Hook `useSyncUser` (corrigé : import `useSession` depuis `next-auth/react` et non `next-auth`).
- Helper `src/lib/api.ts` : fetch relatif (compat gateway Caddy), formatXAF, formatDuration, timeAgo.
- Tests Agent Browser : page d'accueil rendue (hero + catégories + 12 vidéos), navigation Live (erreur flux local → clic "Flux de démonstration" → lecteur actif avec contrôles), VOD (catalog + filtres + modal lecture), Abonnements (choix Mensuel → dialog paiement → soumission → "Vous êtes abonné — Formule Mensuel" affiché), Connexion (login admin@rtvc-koume.org/admin123 → bouton Admin apparaît), Admin (KPIs + graphe + table vidéos + dialog ajout vidéo fonctionnel). Aucune erreur console.
- Lint `bun run lint` : passe sans erreur ni warning.

Stage Summary:
- Plateforme OTT RTVC Koumé complète et fonctionnelle, prête pour la soutenance DUT.
- 6 sections SPA (Accueil, Live, VOD, Abonnements, Connexion, Admin) toutes opérationnelles et testées au navigateur.
- 8 routes API REST documentées et sécurisées (admin gate sur /api/admin/stats, /api/videos POST/PUT/DELETE).
- Authentification NextAuth credentials + bcrypt, rôles USER/ADMIN, comptes démo seedés.
- Lecteur HLS.js via CDN avec badge EN DIRECT, contrôles personnalisés, gestion d'erreurs, fallback flux démo.
- Paiement mock Mobile Money / Carte bancaire en FCFA (XAF) avec création Subscription + Payment en base.
- Tableau de bord admin : KPIs, AreaChart recharts 14 jours, top vidéos, abonnés récents, CRUD vidéos complet.
- Palette chrétienne bordeaux + or, mode sombre par défaut, responsive mobile-first, footer sticky, accessibilité (sémantique HTML, ARIA, alt text).
- Stack final : Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui (New York) + Prisma SQLite + NextAuth v4 + Zustand + TanStack Query + recharts + sonner + hls.js (CDN).
- Comptes démo : admin@rtvc-koume.org/admin123 (ADMIN) et demo@rtvc-koume.org/demo123 (USER, abonnement Mensuel actif).
- Note : le dev.log ne contient que l'erreur EADDRINUSE d'une tentative manuelle de `bun run dev` (le serveur auto-démarré par le système tourne sur le PID 1127 depuis 01:09 et répond HTTP 200 sur /, /api/categories, /api/videos ; /api/admin/stats renvoie bien 403 sans auth admin).

---
Task ID: 2-b
Agent: Orchestrateur (Claude principal)
Task: Guide d'installation Nginx-RTMP + FFmpeg sur Ubuntu 26.04 + correction libpcre3 → libpcre2-dev

Work Log:
- Rédaction du guide complet d'installation Nginx-RTMP + FFmpeg + HLS livré dans le chat à l'utilisateur (9 étapes + tableau de commandes + pièges courants).
- Utilisateur a remonté une erreur sur la 1ère commande : paquets libpcre3 et libpcre3-dev introuvables sur Ubuntu 26.04 "Resolute".
- Diagnostic : Ubuntu 26.04 (comme Ubuntu 24.04+) a remplacé PCRE1 par PCRE2. Le paquet correct est libpcre2-dev.
- Commande corrigée fournie à l'utilisateur : `sudo apt install -y build-essential libpcre2-dev libssl-dev zlib1g-dev git wget ffmpeg`.
- Nginx 1.26+ supporte nativement PCRE2, aucune option supplémentaire n'est requise pour ./configure.
- Utilisateur doit reprendre à l'étape 1 corrigée puis enchaîner étapes 2 à 9 du guide.

Stage Summary:
- Guide d'installation Nginx-RTMP + FFmpeg + HLS livré (9 étapes, ~250 lignes).
- Correctif PCRE2 documenté (adaptation à Ubuntu 26.04 Resolute).
- En attente du retour utilisateur après exécution des étapes 1-2 (install dépendances + compilation Nginx).
- Plateforme Next.js toujours opérationnelle sur port 3000 (PID 1127), HTTP 200 vérifié.
- Prochaines étapes à valider avec utilisateur : ABR multi-bitrate, doc satellite Starlink, mémoire de stage.

---
Task ID: 2-b (suite)
Agent: Orchestrateur (Claude principal)
Task: Correction erreurs compilation Nginx sur Ubuntu 26.04 (suite)

Work Log:
- Utilisateur a remonté une 2ème erreur de compilation : `fatal error: crypt.h: Aucun fichier ou dossier de ce nom`.
- Diagnostic : sur Ubuntu 24.04+ et 26.04, la bibliothèque crypt a été séparée de libc6-dev dans le paquet dédié libcrypt-dev.
- Solution fournie : `sudo apt install -y libcrypt-dev` puis relance de `./configure` (pour détection crypt) puis `make && sudo make install`.
- Vérification à surveiller dans la sortie configure : "checking for crypt.h ... found" (était "not found").

Stage Summary:
- 2 correctifs successifs nécessaires pour adaptation à Ubuntu 26.04 "Resolute" :
  1. libpcre3-dev → libpcre2-dev (PCRE2 remplace PCRE1)
  2. libcrypt-dev manquant (bibliothèque crypt séparée de libc6-dev)
- Ces adaptations sont normales et démontrent la capacité de l'étudiant à résoudre des problèmes de packaging Linux (point positif pour la soutenance).
- En attente du retour utilisateur après `make && sudo make install` pour validation de l'installation Nginx.

---
Task ID: 2-b (suite 2)
Agent: Orchestrateur (Claude principal)
Task: Validation compilation Nginx + suite configuration

Work Log:
- Petit malentendu clarifié : les lignes "checking for crypt.h ... found" étaient des exemples de sortie attendue, pas des commandes à taper. Utilisateur les avait copiées dans bash → "commande introuvable" (inoffensif).
- Utilisateur a relancé correctement : ./configure → make → sudo make install.
- Vérification `/usr/local/nginx/sbin/nginx -v` → "nginx version: nginx/1.26.3" ✅
- Nginx 1.26.3 + module RTMP installé avec succès sur Ubuntu 26.04.
- Prochaine étape : créer /tmp/hls + éditer nginx.conf + démarrer le serveur.

Stage Summary:
- Compilation Nginx-RTMP réussie sur Ubuntu 26.04 Resolute.
- Étapes restantes du volet streaming : config nginx.conf (RTMP+HLS), démarrage, test OBS, test VLC, intégration plateforme.

---
Task ID: 2-c
Agent: Orchestrateur (Claude principal)
Task: Configuration nginx.conf + démarrage serveur streaming

Work Log:
- Création du dossier /tmp/hls avec droits utilisateur.
- Édition du fichier /usr/local/nginx/conf/nginx.conf avec config simplifiée (RTMP sur 1935, HLS sur 8080, CORS autorisé pour la plateforme Next.js).
- Config simplifiée : FFmpeg sera lancé manuellement dans un terminal séparé (plus pédagogique pour la soutenance).
- Validation config : `nginx -t` → syntax OK.
- Démarrage : `sudo /usr/local/nginx/sbin/nginx` → 2 processus nginx (master + worker) actifs.
- Test HTTP : `curl http://localhost:8080/` → "RTVC Koume Streaming Server OK" ✅.
- Serveur streaming opérationnel, prêt à recevoir le flux OBS.

Stage Summary:
- Serveur Nginx-RTMP fonctionnel sur Ubuntu 26.04 (ports 1935 RTMP + 8080 HTTP/HLS).
- Prochaine étape : installation OBS Studio + premier test de stream live RTMP → HLS.

---
Task ID: 2-d
Agent: Orchestrateur (Claude principal)
Task: Configuration OBS + premier test de stream RTMP → HLS

Work Log:
- Analyse de la capture d'écran OBS via VLM : OBS 32.1.2 fonctionnel, source "Périphérique de capture vidéo" (webcam) déjà ajoutée, 30 FPS, CPU 4%.
- Utilisateur était confus sur la localisation des réglages (fenêtre principale vs menu Paramètres) — clarification fournie.
- Configuration OBS guidée : onglet Flux (rtmp://localhost/live + clé "stream") + onglet Vidéo (1280x720, 30 FPS).
- Démarrage du stream : SUCCÈS.
- Vérification /tmp/hls/ : 16 segments .ts (stream-17 à stream-31) + playlist stream.m3u8 (242 octets).
- Taille segments ~700 KB / 2s → débit ~2800 kbps (cohérent 720p).
- Propriétaire nobody:nogroup (Nginx worker user — normal).

Stage Summary:
- CHAÎNE COMPLÈTE DE STREAMING FONCTIONNELLE : Caméra → OBS → RTMP (1935) → Nginx-RTMP → HLS (.m3u8 + .ts) → HTTP (8080).
- Architecture du cahier des charges section 3 validée et opérationnelle.
- Prochaine étape : validation visuelle avec VLC puis intégration dans la plateforme web RTVC Koumé (section Live avec HLS.js).

---
Task ID: 2-d (suite)
Agent: Orchestrateur (Claude principal)
Task: Correction config Nginx + validation VLC

Work Log:
- Erreur HTTP 404 Not Found sur VLC lors du premier test.
- Diagnostic : incohérence de chemins dans nginx.conf — hls_path=/tmp/hls mais root /tmp + URL /live → Nginx cherchait /tmp/live/stream.m3u8 (inexistant).
- Correctif appliqué : location /live/ { alias /tmp/hls/; } au lieu de location /live { root /tmp; }.
- Le slash final sur /live/ est important pour le bon fonctionnement de alias.
- Configuration complète réécrite et recollée par l'utilisateur dans nano.
- nginx -t : syntax OK + test successful.
- nginx -s reload : Nginx a rechargé la config sans interruption du stream.
- curl -I http://localhost:8080/live/stream.m3u8 → HTTP 200 OK ✅.
- VLC lit le flux : VALIDATION VISUELLE RÉUSSIE ✅.

Stage Summary:
- CHAÎNE COMPLÈTE DE STREAMING VALIDÉE END-TO-END : Caméra → OBS → RTMP → Nginx-RTMP → HLS → HTTP → VLC.
- Prochaine étape : validation dans la plateforme web RTVC Koumé (section Live avec lecteur HLS.js).
- Après validation web : chantiers ABR multi-bitrate + documentation satellite Starlink + trame mémoire.
