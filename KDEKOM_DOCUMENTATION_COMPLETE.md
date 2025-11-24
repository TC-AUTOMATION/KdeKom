# KDEKOM - Documentation Complète du Système Financier

## Vue d'ensemble

Système de gestion financière pour l'activité KDEKOM permettant de :
1. Suivre les missions et leurs montants
2. Calculer les commissions et frais
3. Répartir les revenus entre différentes personnes
4. Consolider les données mensuellement

---

## Structure du Fichier Excel

### 3 Feuilles Interconnectées

1. **MISSIONS** : Détail de chaque mission (279 lignes, 47 colonnes)
2. **RECAP** : Vue consolidée mensuelle (699 lignes, 14 colonnes)
3. **Données** : Données de référence (apporteurs, parrains, clients)

---

## FEUILLE MISSIONS - Détail des Colonnes

### Colonnes d'Identification (A-I)

| Colonne | Nom dans Excel | Description |
|---------|----------------|-------------|
| A | Apport | Nom de l'apporteur d'affaires |
| B | x | Commission apporteur (calculée) |
| C | Parr | Parrain |
| D | x | Commission parrain = 5% de U |
| F | Client | Nom du client |
| G | - | Type d'agence (kdekom, etc.) |
| H | Mission | Nom/description de la mission |
| I | Mois | Mois de la mission (Janvier, Février, etc.) |

### Colonnes Financières - Montants (J-V)

| Colonne | Nom | Formule | Description |
|---------|-----|---------|-------------|
| J | - | `=L` | Montant brut total (pour CA Général) |
| L | € | (saisi) | **Montant facturé** |
| M | €€ | `=L` | Montant total (copie de L) |
| N | x | (saisi) | Frais/Déduction initiale |
| O | Reste | `=M-N` | Reste après première déduction |
| P | Agence | (saisi) | Frais d'agence |
| Q | x | (saisi) | Frais fixes |
| R | Gestion | (saisi) | Frais de gestion |
| S | Ml | (saisi) | Montant pour Ml |
| T | Lt | (saisi) | Montant pour Lt |
| U | Avant | `=O-P-Q-R-S-T` | Reste avant commissions |
| V | Apport | `=U-B-D` | **BASE DE RÉPARTITION** (après commissions) |

### Colonnes de Répartition (W-AU)

| Colonne | Nom | Type | Formule | Description |
|---------|-----|------|---------|-------------|
| X | x | % | `=100%-Y-AA-AC-AE-AG-AI-AK-AM-AO-AQ` | % reliquat |
| Y | - | % | (saisi) | Pourcentage Fred |
| Z | Fred | € | `=(V*Y)+Q+R` | Montant Fred |
| AA | - | % | (saisi) | Pourcentage Eric |
| AB | Eric | € | `=(V*AA)` | Montant Eric |
| AC | - | % | (saisi) | Pourcentage Boom |
| AD | Boom | € | `=V*AC` | Montant Boom |
| AE | - | % | (saisi) | Pourcentage Damien |
| AF | Damien | € | `=V*AE` | Montant Damien |
| AG | - | % | (saisi) | Pourcentage Maitre |
| AH | Maitre | € | `=V*AG` | Montant Maitre |
| AI-AQ | x | % | (saisi) | Autres pourcentages |
| AJ-AR | x | € | `=V*pourcentage` | Autres montants |
| AU | Reliquat | € | `=V*X` | Reliquat final |

---

## FEUILLE RECAP - Consolidation Mensuelle

### Structure des Données

- **Colonnes** : ANNEE (total annuel) + 12 mois (Janvier à Décembre)
- **Lignes** : Catégories de CA, frais, répartitions

### Principales Lignes

| Ligne | Catégorie | Formule Janvier (C) | Formule ANNEE (B) | Source |
|-------|-----------|---------------------|-------------------|--------|
| 2 | CA Général | (saisie) | (saisie) | Somme colonne J MISSIONS |
| 3 | CA Total | `=SUMIFS(MISSIONS!$J$3:$J$2096, MISSIONS!$I$3:$I$2096, C$1)` | `=SUM(C3:N3)` | Somme colonne J |
| 4 | CA Payé | `=SUMIFS(MISSIONS!$L$3:$L$2096, MISSIONS!$I$3:$I$2096, C$1)` | `=SUM(C4:N4)` | Somme colonne L |
| 7 | Provision Charges | (saisie) | (saisie) | Calcul manuel |
| 10-16 | Frais récurrents | (saisies) | (saisies) | Montants fixes |
| 18 | Reliquat | (saisie) | (saisie) | À calculer |
| 19 | Reste | `=SUMIFS(MISSIONS!$AU$3:$AU$2119, MISSIONS!$I$3:$I$2119, C$1)` | `=SUM(C19:N19)` | Somme Reliquat |
| 21-24 | Ml, Lt, Fred, Eric | `=SUMIFS(MISSIONS!$colonne, MISSIONS!$I, mois)` | `=SUM(mois)` | Par personne |
| 41-46 | Apporteurs | (saisies ou formules) | (calculs) | Commissions |

### Frais Récurrents Mensuels

| Poste | Montant/mois |
|-------|--------------|
| Compta Kdekom | 92 € |
| Domaine | 60 € |
| Téléphone | 9 € |
| Quickbooks | 15 € |
| Wize | 4,20 € |
| Google | 7,50 € |
| Amazon | 8 € |

---

## FLUX FINANCIER - Cascade de Calculs

### Pour chaque mission :

```
1. Montant Facturé (L)
   ↓
2. Reste après frais (O) = L - N
   ↓
3. Reste avant commissions (U) = O - P - Q - R - S - T
   ↓
4. BASE RÉPARTITION (V) = U - CommissionApporteur(B) - CommissionParrain(D)
   ↓
5. Répartition :
   - Fred = V × PourcentageFred + Frais(Q+R)
   - Eric = V × PourcentageEric
   - Boom = V × PourcentageBoom
   - Damien = V × PourcentageDamien
   - Maitre = V × PourcentageMaitre
   - Autres personnes (x) = V × Pourcentages respectifs
   - Reliquat = V × (100% - Σ Pourcentages)
```

### Commissions

- **Commission Parrain (D)** : `IF(C="", 0, U×5%)` → 5% de U si parrain existe
- **Commission Apporteur (B)** : Valeur saisie manuellement

---

## RÈGLES MÉTIER IDENTIFIÉES

### 1. Types de CA

- **CA Général** : Montant brut total de toutes les missions
- **CA Total** : Montant facturé (après première déduction)
- **CA Payé** : Montant effectivement encaissé

### 2. Hiérarchie des Personnes

**Gestionnaires directs** (montants fixes par mission) :
- Ml
- Lt

**Associés principaux** (pourcentages de V) :
- Fred (+ bonus Q+R)
- Eric
- Boom
- Damien
- Maitre

**Autres** (x1, x2, etc.) : Pourcentages variables

### 3. Apporteurs d'Affaires

Personnes référencées dans la feuille "Données" :
- Eric A, Fred, Hervé, Dono, Colpa, Na Oya, B&A, Vero, Sns, Acte, Damien

Chacun reçoit une commission pour les affaires apportées.

### 4. Consolidation Mensuelle

- Les données MISSIONS alimentent RECAP via `SUMIFS` sur le mois
- RECAP calcule les totaux annuels par `SUM` des 12 mois
- Les frais récurrents sont répétés chaque mois

---

## DONNÉES DE RÉFÉRENCE (Feuille "Données")

| Colonne | Description |
|---------|-------------|
| Apporteur | Personne qui apporte le client |
| Parrain | Personne qui parraine l'apporteur |
| Gestion | Type de gestion (L'Agence, KdeKom, etc.) |
| Mois | Mois associé |
| Client | Nom du client |
| Réglé | Statut de paiement (OUI/NON) |

---

## POINTS D'ATTENTION POUR L'APPLICATION

### 1. Validation des Données

- Le total des pourcentages ne doit pas dépasser 100%
- Les montants Ml et Lt doivent être cohérents avec les missions
- La somme CA Total + CA Payé doit être logique par rapport à CA Général

### 2. Calculs Automatiques

- Commission parrain : toujours 5% de U si parrain existe
- Reliquat : automatique (100% - tous les pourcentages)
- Fred : seul à recevoir un bonus (Q+R) en plus de son pourcentage

### 3. Consolidation

- RECAP doit toujours refléter la somme des MISSIONS
- Les formules SUMIFS utilisent le mois comme critère
- Les totaux annuels sont des sommes de colonnes

### 4. Intégrité Référentielle

- Les clients doivent exister dans "Données"
- Les apporteurs doivent être référencés
- Les mois doivent être cohérents

---

## EXEMPLE CONCRET : Mission Adrian/Colpa

**Mission** : contrat Da
**Mois** : Mars
**Montant facturé (L)** : 500 €

### Calculs :

1. **M** (Total) = 500 € (copie de L)
2. **N** (Frais) = 250 €
3. **O** (Reste) = 500 - 250 = 250 €
4. **P, Q, R, S** = 0 €
5. **T** (Lt) = 250 €
6. **U** (Avant) = 250 - 0 - 0 - 0 - 0 - 250 = 0 €
7. **B** (Commission apporteur) = 0 €
8. **D** (Commission parrain 5%) = 0 € (car U = 0)
9. **V** (Base répartition) = 0 - 0 - 0 = 0 €

**Répartition finale** :
- Lt reçoit : 250 €
- Reliquat : 0 €
- Autres : 0 €

---

## ARCHITECTURE RECOMMANDÉE POUR L'APPLICATION

### 1. Base de Données

**Tables principales** :
- `missions` (toutes les colonnes de la feuille MISSIONS)
- `personnes` (Ml, Lt, Fred, Eric, etc.)
- `apporteurs` (données de référence)
- `clients`
- `parametres` (frais récurrents, taux commission)

### 2. Modules Fonctionnels

- **Gestion des Missions** : Créer, modifier, supprimer missions
- **Calcul Automatique** : Cascade de calculs (O → U → V → répartitions)
- **Consolidation** : Générer RECAP par mois/année
- **Rapports** : Export Excel, PDF, graphiques
- **Validation** : Contrôles d'intégrité (pourcentages, montants)

### 3. Règles de Gestion à Implémenter

```javascript
// Pseudo-code
function calculateMission(mission) {
  // Étape 1 : Calculs de base
  mission.O = mission.M - mission.N
  mission.U = mission.O - mission.P - mission.Q - mission.R - mission.S - mission.T

  // Étape 2 : Commissions
  mission.D = mission.parrain ? mission.U * 0.05 : 0
  mission.V = mission.U - mission.B - mission.D

  // Étape 3 : Calcul du reliquat
  let totalPourcentages = mission.pourcentages.reduce((sum, p) => sum + p, 0)
  mission.X = 1 - totalPourcentages  // Pourcentage reliquat

  // Étape 4 : Répartition
  mission.Fred = (mission.V * mission.pourcentageFred) + mission.Q + mission.R
  mission.Eric = mission.V * mission.pourcentageEric
  mission.Boom = mission.V * mission.pourcentageBoom
  // ... etc pour chaque personne
  mission.Reliquat = mission.V * mission.X

  return mission
}
```

### 4. Interface Utilisateur

**Écrans principaux** :
1. Dashboard : Vue d'ensemble (CA, missions en cours, reliquats)
2. Liste des missions : Tableau avec filtres (mois, client, statut)
3. Formulaire mission : Saisie/édition avec calculs en temps réel
4. Récapitulatif mensuel : Vue RECAP avec graphiques
5. Gestion des personnes : Pourcentages par défaut, historique
6. Paramètres : Frais récurrents, taux commission

---

## PROCHAINES ÉTAPES

1. ✅ Structure complète analysée
2. ✅ Formules identifiées
3. ✅ Relations CA comprises
4. ✅ Logique de répartition documentée
5. ⏳ Choix des technologies (Frontend, Backend, Base de données)
6. ⏳ Conception de la base de données
7. ⏳ Développement de l'application

---

**Document créé le** : 2025-11-18
**Fichier source** : kdekom.xlsx
**Analysé par** : Claude Code
