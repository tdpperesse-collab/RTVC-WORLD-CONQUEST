#!/bin/bash
# ============================================================
#  SCRIPT D'INSTALLATION — Plateforme OTT RTVC Koumé
#  À exécuter sur Ubuntu 24.04+ / 26.04 après extraction de l'archive
# ============================================================
set -e

echo "============================================================"
echo "  INSTALLATION DE LA PLATEFORME OTT RTVC KOUMÉ"
echo "============================================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

# 1. Vérifier Node.js
echo "[1/7] Vérification de Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | sed 's/v//')
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        ok "Node.js $NODE_VERSION détecté"
    else
        warn "Node.js $NODE_VERSION détecté (version < 18), mise à jour nécessaire..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
        ok "Node.js mis à jour vers $(node -v)"
    fi
else
    warn "Node.js non installé, installation en cours..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    ok "Node.js $(node -v) installé"
fi

# 2. Vérifier npm
echo ""
echo "[2/7] Vérification de npm..."
if command -v npm &> /dev/null; then
    ok "npm $(npm -v) détecté"
else
    err "npm non trouvé. Installe Node.js d'abord."
fi

# 3. Installer les dépendances
echo ""
echo "[3/7] Installation des dépendances (cela peut prendre 3-5 minutes)..."
npm install --legacy-peer-deps
ok "Dépendances installées"

# 4. Configurer les variables d'environnement
echo ""
echo "[4/7] Configuration des variables d'environnement..."
if [ ! -f .env ]; then
    cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="rtvc-koume-secret-key-change-in-production-2024"
NEXTAUTH_URL="http://localhost:3000"
EOF
    ok "Fichier .env créé"
else
    ok "Fichier .env déjà présent"
fi

# 5. Initialiser la base de données
echo ""
echo "[5/7] Initialisation de la base de données..."
npx prisma generate
npx prisma db push
ok "Base de données créée"

# 6. Charger les données de démonstration
echo ""
echo "[6/7] Chargement des données de démonstration..."
npx tsx prisma/seed.ts || npx prisma db seed
ok "Données seedées (admin, user démo, catégories, vidéos)"

# 7. Tester le serveur Nginx-RTMP (optionnel)
echo ""
echo "[7/7] Vérification du serveur de streaming..."
if curl -s http://localhost:8080/ | grep -q "RTVC Koume"; then
    ok "Serveur Nginx-RTMP détecté sur le port 8080"
    echo "   Le flux live sera disponible dans la section Live"
else
    warn "Serveur Nginx-RTMP non détecté sur le port 8080"
    echo "   Si tu veux tester le live, démarre Nginx-RTMP + OBS avant de lancer la plateforme"
fi

echo ""
echo "============================================================"
echo "  INSTALLATION TERMINÉE ! 🎉"
echo "============================================================"
echo ""
echo "Pour démarrer la plateforme :"
echo "  npm run dev"
echo ""
echo "Puis ouvre dans ton navigateur :"
echo "  http://localhost:3000"
echo ""
echo "Comptes de démonstration :"
echo "  Admin : admin@rtvc-koume.org / admin123"
echo "  User  : demo@rtvc-koume.org / demo123"
echo ""
echo "Pour le streaming live (section Live) :"
echo "  1. Démarre Nginx : sudo /usr/local/nginx/sbin/nginx"
echo "  2. Démarre OBS Studio (stream vers rtmp://localhost/live, clé: stream)"
echo "  3. Le flux s'affichera automatiquement dans la section Live"
echo ""
echo "Bon courage pour ta soutenance ! 🚀"
