# KDEKOM - Explication de l'Usage Pratique du Fichier

## 🎯 CONTEXTE MÉTIER

**KDEKOM** est une structure de **portage commercial** ou **plateforme d'intermédiation**.

### Le Business Model :

KDEKOM fait le lien entre :
- **Des consultants/freelances** (Fred, Eric, Ml, Lt, Boom, etc.)
- **Des clients** qui ont besoin de prestations
- **Des apporteurs d'affaires** qui ramènent des clients

**Principe** : Quand un client paie 500€ pour une mission, KDEKOM :
1. Encaisse l'argent
2. Déduit ses frais de fonctionnement
3. Répartit le reste entre les consultants selon des règles établies

---

## 📋 WORKFLOW CONCRET - Comment on utilise le fichier

### **ÉTAPE 1 : Une nouvelle mission arrive**

**Exemple** : Colpa (apporteur d'affaires) amène un client "Adrian" qui a besoin d'une prestation.

**Ce qu'on fait :**
1. On ouvre la feuille **MISSIONS**
2. On crée une nouvelle ligne
3. On remplit manuellement :

```
Apporteur (A) : Colpa
Client (F) : Adrian
Mission (H) : "contrat Da"
Mois (I) : Mars
Montant facturé (L) : 1550 €
```

### **ÉTAPE 2 : On configure la mission**

On décide maintenant **qui va travailler** et **comment répartir** :

**Saisies manuelles :**

```
Frais initiaux (N) : 0 € (ou une déduction si besoin)
Frais agence (P) : 77,50 €
Ml (S) : 49,60 € (si Ml gère cette mission)
Lt (T) : 0 € (si Lt ne gère pas cette mission)
```

**Choix des pourcentages de répartition :**

```
Pourcentage Fred (Y) : 3% (0,03)
Pourcentage Eric (AA) : 0%
Pourcentage Boom (AC) : 0%
```

### **ÉTAPE 3 : Le fichier calcule automatiquement**

Dès qu'on saisit ces données, **Excel calcule tout seul** :

```
Reste (O) = 1550 - 0 = 1550 €
Avant commission (U) = 1550 - 77,50 - 49,60 = 1422,90 €
Commission apporteur Colpa (B) = 44,64 € (saisie ou calculée selon accord)
Commission parrain (D) = 5% de U si parrain existe
Base répartition (V) = U - B - D = 1378,26 €

Montant Fred (Z) = (1378,26 × 3%) + frais = 41,35 €
Reliquat (AU) = V × (100% - tous les %) = 1336,91 €
```

**Tout est automatique** ! ✅

---

## 📊 FEUILLE MISSIONS - Utilisation Détaillée

### **Colonnes qu'on REMPLIT MANUELLEMENT :**

| Colonne | Quoi saisir | Quand |
|---------|-------------|-------|
| A | Apporteur | Qui a amené le client ? |
| B | Commission apporteur | Montant fixe négocié avec l'apporteur |
| C | Parrain | Si l'apporteur a été parrainé par quelqu'un |
| F | Client | Nom du client |
| H | Mission | Description de la prestation |
| I | Mois | Quel mois facturer |
| L | Montant facturé | Le prix HT de la prestation |
| N | Frais initiaux | Déductions éventuelles |
| P | Frais agence | Frais de structure |
| Q, R | Frais fixes | Autres frais (parfois = bonus Fred) |
| S | Ml | Montant de gestion pour Ml |
| T | Lt | Montant de gestion pour Lt |
| Y | % Fred | Quel pourcentage du reste pour Fred |
| AA | % Eric | Quel pourcentage pour Eric |
| AC, AE, AG... | % autres | Pourcentages pour les autres personnes |

### **Colonnes CALCULÉES AUTOMATIQUEMENT :**

Tout le reste ! (O, U, V, Z, AB, AD, AF, AH, AU...)

---

## 📈 FEUILLE RECAP - Utilisation

### **À quoi elle sert ?**

La feuille RECAP **agrège automatiquement** toutes les missions par mois.

**Cas d'usage :**

1. **Fin du mois de Mars** → Je veux savoir :
   - Combien j'ai facturé ce mois (CA Total)
   - Combien j'ai encaissé (CA Payé)
   - Combien Fred a gagné ce mois
   - Combien Eric a gagné
   - Mon reliquat total

2. **Je consulte RECAP** :
   - Colonne "Mars"
   - Ligne "Fred" → 5584,57 €
   - Ligne "Eric" → 0 €
   - Ligne "CA Total" → 7507 €

**C'est automatique** : Les formules `SUMIFS` additionnent toutes les missions de Mars.

### **Ce qu'on fait avec RECAP :**

✅ **Payer les consultants** : "Fred, ce mois-ci tu as gagné 5584 €"
✅ **Piloter l'activité** : "On a fait 7507 € de CA en Mars, c'est moins que février"
✅ **Suivre les frais** : "On a 621,80 € de provision charges ce mois"
✅ **Calculer les commissions apporteurs** : "Colpa a apporté 656 € de commissions sur l'année"

---

## 📝 FEUILLE DONNÉES - Utilisation

### **À quoi elle sert ?**

C'est un **référentiel** : la liste de toutes les personnes et clients.

**Colonnes :**
- **Apporteur** : Tous les apporteurs possibles (Colpa, Na Oya, Vero...)
- **Parrain** : Qui a amené cet apporteur
- **Gestion** : Type de structure de l'apporteur
- **Client** : Liste de tous les clients
- **Réglé** : Le client a-t-il payé ? (OUI/NON)

**Usage :**
- Vérifier si un client existe déjà
- Connaître le parrain d'un apporteur (pour la commission 5%)
- Suivre les paiements

---

## 🔄 CYCLE COMPLET D'UNE MISSION

### **Exemple réel : Mission Adrian par Colpa**

#### **1. Signature du contrat (Début Mars)**

Colpa appelle : "J'ai un client Adrian qui a besoin d'une prestation à 1550 €/mois"

**Action** : On crée une ligne dans MISSIONS
- Client : Adrian
- Apporteur : Colpa
- Montant : 1550 €
- Mois : Mars

#### **2. Configuration de la mission**

On décide qui travaille :
- **Fred** va gérer la mission → 3% de répartition
- **Ml** s'occupe de la gestion → 49,60 € fixes
- **Colpa** a apporté l'affaire → 44,64 € de commission
- **Frais agence** : 77,50 €

**On saisit ces valeurs** → Le fichier calcule tout.

#### **3. Facturation client (Fin Mars)**

Le client Adrian paie **1550 €** → On met à jour :
- Montant payé (M) : 1550 €
- Statut dans "Données" : Réglé = OUI

#### **4. Répartition des revenus (Début Avril)**

On consulte **RECAP** colonne "Mars" :
- Fred a gagné : 5584,57 € (toutes missions confondues)
- Colpa doit recevoir sa commission : 44,64 €
- Ml doit recevoir : 49,60 €

**On fait les virements**.

#### **5. Mois suivant (Avril)**

Le contrat continue → On crée une nouvelle ligne pour Avril :
- Même client (Adrian)
- Même mission (contrat Da)
- Mois : Avril
- Même montant : 1550 €

**Et le cycle recommence**.

---

## 💡 LOGIQUE DE RÉPARTITION - Pourquoi ces règles ?

### **1. Ml et Lt : Gestionnaires**

**Rôle** : Gestion administrative, facturation, relances clients

**Rémunération** : Montant fixe par mission (ex: 49,60 € ou 250 €)

**Pourquoi** : Ils font le même travail quelle que soit la taille de la mission

---

### **2. Fred, Eric, Boom, etc. : Consultants/Associés**

**Rôle** : Réaliser les prestations ou être actionnaires

**Rémunération** : Pourcentage du "reste" après frais

**Pourquoi** : Plus la mission rapporte, plus ils gagnent (logique de partage de profits)

**Fred a un bonus** : Il reçoit aussi Q+R (frais fixes) car il est peut-être le gérant principal.

---

### **3. Apporteurs (Colpa, Na Oya, etc.)**

**Rôle** : Trouver des clients

**Rémunération** : Commission fixe par mission (ex: 44,64 €)

**Pourquoi** : Ils ne travaillent pas sur la mission, juste l'apport d'affaires

---

### **4. Parrains**

**Rôle** : Ont recruté/formé un apporteur

**Rémunération** : 5% de U (reste avant commissions)

**Pourquoi** : Réseau MLM (marketing multi-niveaux) pour développer les apporteurs

**Calcul** : Automatique avec formule `=IF(C="", 0, U×5%)`

---

### **5. Reliquat**

**C'est quoi** : Ce qui reste après toutes les répartitions

**Pourcentage** : 100% - (Fred% + Eric% + Boom% + ...)

**À quoi ça sert** :
- Trésorerie de KDEKOM
- Réserve pour charges
- Dividendes futurs
- Investissements

**Exemple** :
- Base répartition (V) = 1000 €
- Fred = 3%, Eric = 5% → Total alloué = 8%
- Reliquat = 1000 × (100% - 8%) = 920 €

---

## 📊 CAS D'USAGE CONCRETS

### **Usage 1 : Calculer mon salaire du mois**

**Moi (Fred)** :
1. J'ouvre RECAP
2. Je regarde la ligne "Fred", colonne du mois
3. C'est mon revenu du mois

→ **Automatique**, pas besoin de chercher dans MISSIONS

---

### **Usage 2 : Ajouter un nouveau consultant**

**Exemple** : On recrute "Damien"

1. Dans MISSIONS : On ajoute une colonne "% Damien" et "Montant Damien"
2. Dans RECAP : On ajoute une ligne "Damien" avec formule SUMIFS
3. Dans Données : On ajoute Damien dans les apporteurs si nécessaire

---

### **Usage 3 : Suivre un client spécifique**

**Question** : "Combien on a gagné avec le client Adrian en 2024 ?"

**Réponse** :
1. Ouvrir MISSIONS
2. Filtrer colonne F (Client) = "Adrian"
3. Sommer la colonne V (base répartition) ou AU (reliquat)

---

### **Usage 4 : Vérifier les paiements**

**Chaque mois** :
- Comparer "CA Total" (facturé) vs "CA Payé" (encaissé)
- Si différence → Relances clients
- Mettre à jour "Réglé" dans Données

---

### **Usage 5 : Piloter l'activité**

**Indicateurs suivis dans RECAP** :

- **CA Général** : Combien on génère au total
- **CA Total** : Combien on facture réellement
- **CA Payé** : Combien on encaisse
- **Reliquat total** : Combien reste pour KDEKOM
- **Évolution mensuelle** : Mars vs Avril vs Mai...

**Graphiques possibles** :
- Évolution CA par mois
- Répartition par consultant
- Top clients (ceux qui rapportent le plus)

---

## 🎯 QUI UTILISE CE FICHIER ?

### **Le Gérant (probablement Fred)**

**Utilise :**
- MISSIONS : Créer/modifier les missions
- RECAP : Piloter l'activité globale
- Données : Gérer les références

**Fréquence** : Quotidienne

---

### **La Comptable/Gestionnaire (Ml ou Lt)**

**Utilise :**
- MISSIONS : Vérifier les montants, relances
- RECAP : Calcul des paies
- Données : Statuts de paiement

**Fréquence** : Hebdomadaire/Mensuelle

---

### **Les Consultants (Eric, Boom, etc.)**

**Utilise :**
- RECAP : Consulter leur ligne pour voir leurs revenus

**Fréquence** : Mensuelle (fin de mois)

---

### **Les Apporteurs (Colpa, Vero, etc.)**

**Utilise :**
- RECAP : Voir leurs commissions (ligne Apporteurs)

**Fréquence** : Mensuelle

---

## 🔍 POINTS CLÉS À RETENIR

### **1. C'est un outil de GESTION DE TRÉSORERIE**

Objectif : Savoir combien on gagne, combien on doit payer à qui, et combien il reste.

### **2. C'est SEMI-AUTOMATIQUE**

- On saisit les missions une par une (manuellement)
- Le fichier calcule tout le reste (automatiquement)

### **3. C'est un SYSTÈME DE RÉPARTITION**

Chaque euro facturé est distribué selon des règles précises :
- Frais fixes d'abord (agence, gestion)
- Commissions apporteurs ensuite
- Répartition consultants selon %
- Reliquat pour KDEKOM

### **4. C'est ÉVOLUTIF**

- On peut ajouter de nouveaux consultants
- On peut modifier les pourcentages
- On peut changer les frais

### **5. C'est la SOURCE DE VÉRITÉ**

Tout part de MISSIONS :
- Les paies des consultants
- Les commissions des apporteurs
- La trésorerie de KDEKOM
- La compta annuelle

---

## 🚀 LIMITES DU FICHIER EXCEL ACTUEL

### **Problèmes identifiés :**

❌ **Pas de contrôle d'erreur** : On peut saisir 150% de répartition par erreur
❌ **Pas d'historique** : Difficile de voir les modifications
❌ **Pas de droits d'accès** : Tout le monde voit tout
❌ **Pas de notifications** : On doit penser à mettre à jour
❌ **Risque de corruption** : Un fichier Excel peut se corrompre
❌ **Pas de graphiques automatiques** : Il faut les créer manuellement
❌ **Multi-utilisateur difficile** : Conflits de versions

### **Ce qu'apporterait une APPLICATION :**

✅ Validation automatique (pourcentages ≤ 100%)
✅ Historique complet des modifications
✅ Rôles et permissions (consultant ne voit que ses données)
✅ Notifications (nouvelle mission, paiement reçu)
✅ Sauvegarde cloud automatique
✅ Graphiques temps réel
✅ Collaboration simultanée
✅ Export Excel/PDF à la demande
✅ Application mobile pour consultation

---

## 📌 CONCLUSION

**Ce fichier est le CŒUR de la gestion financière de KDEKOM.**

Il permet de :
1. **Enregistrer** chaque mission avec ses détails
2. **Calculer** automatiquement les répartitions
3. **Consolider** les données par mois/personne
4. **Piloter** l'activité (CA, marges, reliquats)
5. **Payer** correctement chaque intervenant

**C'est un système complet, mais en Excel** → L'application permettrait de **professionnaliser** tout ça avec :
- Plus de sécurité
- Plus de contrôles
- Plus de confort d'utilisation
- Plus d'automatisation

---

**Maintenant que vous comprenez EXACTEMENT comment ça fonctionne, voulez-vous qu'on passe à la conception de l'application ?** 🚀
