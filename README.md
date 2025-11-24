# KDEKOM - Gestion des Missions et Répartitions Financières

Application web de gestion des missions, clients, apporteurs et répartitions financières pour KDEKOM.

## 📋 Caractéristiques

- **Interface moderne** avec React 19, TypeScript, Vite et shadcn/ui
- **Design carré** (sans coins arrondis) pour un style professionnel
- **Données complètes** : 235 missions, 45 clients, 12 apporteurs extraites de Excel
- **Toutes les données financières** : frais, commissions, répartitions, reliquats

## 🏗️ Architecture

```
kdekom-app/
├── frontend/          # Application React + TypeScript
│   ├── src/
│   │   ├── components/    # Composants UI réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   │   └── admin/     # Dashboard, Missions, Recap, Payouts, Contacts
│   │   ├── lib/           # Utilitaires et API
│   │   │   └── mockData.json  # Données extraites de l'Excel
│   │   └── index.css      # Styles globaux (design carré)
│   └── package.json
├── backend/           # Backend Node.js (optionnel, non utilisé actuellement)
└── KdeKom.xlsx       # Fichier Excel source
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone https://github.com/TC-AUTOMATION/KdeKom.git
cd KdeKom

# Installer les dépendances du frontend
cd frontend
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 📊 Pages Disponibles

### 1. **Dashboard** (`/admin`)
- KPI cards : CA Total, CA Payé, Reliquat Total
- Graphique mensuel d'évolution (CA Total vs CA Payé)
- Graphique circulaire de répartition des revenus
- Tableau des performances par consultant

### 2. **Missions** (`/admin/missions`)
- Liste complète des 235 missions avec données Excel
- Filtres avancés : Apporteur, Client, Consultant, Mois
- Recherche par nom de mission ou client
- Statuts et montants facturés
- Pagination (10/20/50 par page)

### 3. **Récapitulatif** (`/admin/recap`)
- Vue mensuelle consolidée
- CA Total Facturé, CA Encaissé, Reliquat Net
- Tableau de répartition par bénéficiaire
- Pourcentages du CA Total

### 4. **Paiements** (`/admin/payouts`)
- Gestion des paiements aux apporteurs et consultants
- Détail des commissions (base + bonus)
- Filtres par période, rôle et statut
- Statuts : Pending / Processed

### 5. **Contacts** (`/admin/contacts`)
- Gestion des apporteurs et relations
- Parrain (sponsor)
- Organisation client
- Statut de paiement (Réglé: OUI/NON)
- Panneau latéral pour détails complets

## 💾 Données

Toutes les données proviennent de **KdeKom.xlsx** et sont extraites avec Python dans `frontend/src/lib/mockData.json`.

### Champs extraits par mission :
- Informations générales : client, apporteur, mois, montant facturé
- Frais : initiaux, agence, gestion, ML, LT
- Commissions : apporteur, avant commission
- Répartitions : Fred, Eric, Boom, Damien, Maitre (% et montants)
- Reliquat calculé directement depuis l'Excel

## 🎨 Design System

- **Couleur primaire** : Bleu KDEKOM (`hsl(217.2 91.2% 59.8%)`)
- **Coins carrés** : `--radius: 0rem` (pas de border-radius)
- **Police** : Inter (Google Fonts)
- **Composants** : shadcn/ui avec Radix UI
- **Icônes** : Lucide React
- **Graphiques** : ECharts

## 🔧 Technologies

### Frontend
- **React 19** - Bibliothèque UI
- **TypeScript 5.9** - Typage statique
- **Vite 7.2** - Build tool ultra-rapide
- **Tailwind CSS 3.4** - Styling utility-first
- **shadcn/ui** - Composants UI modernes
- **Radix UI** - Primitives accessibles
- **ECharts** - Graphiques interactifs
- **React Router 7** - Navigation
- **Axios** - Client HTTP (pour API future)

### Backend (non utilisé actuellement)
- Node.js + Express
- SQLite
- TypeScript

## 📝 Scripts Disponibles

```bash
# Développement
npm run dev          # Lance Vite en mode dev

# Build
npm run build        # Compile pour production
npm run preview      # Preview du build de production

# Linting
npm run lint         # ESLint sur le code
```

## 🔄 État du Projet

**Version actuelle** : Frontend autonome avec données mockées

- ✅ Frontend complet et fonctionnel
- ✅ 235 missions avec données Excel complètes
- ✅ Design carré moderne
- ✅ Toutes les pages admin implémentées
- ✅ Filtres et recherche avancés
- ✅ Graphiques et visualisations
- ⏳ Backend optionnel (non connecté)

## 🤝 Contribution

Ce projet a été généré avec **Claude Code** (Anthropic).

Pour toute question ou suggestion :
- Créez une issue sur GitHub
- Contactez l'équipe KDEKOM

## 📄 Licence

Propriétaire - TC-AUTOMATION

---

🤖 **Generated with Claude Code** - https://claude.com/claude-code
