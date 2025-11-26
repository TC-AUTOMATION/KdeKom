# Migration vers shadcn/ui

Ce document décrit la migration complète de l'interface utilisateur vers shadcn/ui.

## Changements effectués

### 1. Configuration

#### Dépendances installées
- `class-variance-authority` - Gestion des variantes de composants
- `@radix-ui/*` - Composants primitifs accessibles
- `tailwindcss-animate` - Animations Tailwind

#### Fichiers de configuration
- `tailwind.config.js` - Mise à jour avec les variables CSS shadcn
- `components.json` - Configuration du CLI shadcn
- `src/index.css` - Ajout des variables CSS pour le thème
- `src/lib/utils.ts` - Fonction utilitaire `cn()` pour fusionner les classes
- `index.html` - Activation du dark mode par défaut

### 2. Composants shadcn/ui créés

Tous les composants sont dans `src/components/ui/shadcn/`:

- **button.tsx** - Boutons avec variantes (default, destructive, outline, secondary, ghost, link)
- **card.tsx** - Cartes avec Header, Title, Description, Content, Footer
- **dialog.tsx** - Modales/Dialogues accessibles
- **input.tsx** - Champs de saisie
- **label.tsx** - Labels pour les formulaires
- **table.tsx** - Tableaux avec Header, Body, Row, Cell
- **select.tsx** - Sélecteurs dropdown
- **badge.tsx** - Badges/étiquettes
- **separator.tsx** - Séparateurs
- **checkbox.tsx** - Cases à cocher
- **switch.tsx** - Interrupteurs on/off
- **tooltip.tsx** - Info-bulles
- **textarea.tsx** - Zones de texte multi-lignes
- **dropdown-menu.tsx** - Menus déroulants

### 3. Migration des composants existants

Les composants UI existants ont été migrés pour utiliser shadcn en interne tout en conservant leur API:

#### Modal.tsx
- **Avant**: Composant custom avec framer-motion et createPortal
- **Après**: Wrapper autour de `Dialog` shadcn
- **API conservée**: `isOpen`, `onClose`, `title`, `children`, `size`

#### StatsCard.tsx
- **Avant**: Composant custom avec styles Tailwind
- **Après**: Utilise `Card` et `CardContent` shadcn
- **API conservée**: Identique, seuls les styles internes ont changé

#### Table.tsx
- **Avant**: Composant table custom
- **Après**: Utilise les composants `Table`, `TableHeader`, `TableBody`, etc. de shadcn
- **API conservée**: Interface générique avec colonnes préservée

### 4. Système de thème

Le projet utilise maintenant un système de variables CSS pour les couleurs:

```css
/* Variables disponibles en light mode */
--background
--foreground
--card
--card-foreground
--popover
--popover-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--destructive
--destructive-foreground
--border
--input
--ring
```

**Dark mode activé par défaut** via `class="dark"` sur `<html>`

## Utilisation

### Importer des composants shadcn

```tsx
// Import depuis l'index
import { Button, Card, Dialog } from '@/components/ui/shadcn'

// Ou import direct
import { Button } from '@/components/ui/shadcn/button'
```

### Exemples

#### Bouton
```tsx
import { Button } from '@/components/ui/shadcn/button'

<Button variant="default">Cliquez-moi</Button>
<Button variant="destructive">Supprimer</Button>
<Button variant="outline">Annuler</Button>
<Button variant="ghost" size="sm">Petit bouton</Button>
```

#### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/shadcn/card'

<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Contenu de la carte
  </CardContent>
</Card>
```

#### Dialog
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titre du dialogue</DialogTitle>
    </DialogHeader>
    <div>Contenu</div>
  </DialogContent>
</Dialog>
```

#### Input avec Label
```tsx
import { Input } from '@/components/ui/shadcn/input'
import { Label } from '@/components/ui/shadcn/label'

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="email@example.com" />
</div>
```

#### Table
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/shadcn/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nom</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Avantages de shadcn/ui

1. **Accessibilité** - Basé sur Radix UI, composants accessibles par défaut
2. **Personnalisable** - Code source directement dans le projet, modifiable à volonté
3. **Type-safe** - Entièrement TypeScript
4. **Cohérent** - Design system unifié avec variables CSS
5. **Performant** - Pas de bundle JavaScript supplémentaire, juste les composants utilisés
6. **Dark mode** - Support natif du thème sombre

## Migration continue

Pour migrer d'autres pages/composants:

1. Remplacer les boutons `<button>` par `<Button>` shadcn
2. Remplacer les `<input>` par `<Input>` avec `<Label>`
3. Remplacer les cartes custom par `<Card>`
4. Utiliser `cn()` pour fusionner les classes conditionnelles

## Fonction utilitaire cn()

```tsx
import { cn } from '@/lib/utils'

// Fusionner des classes avec conditions
<div className={cn(
  "base-class",
  isActive && "active-class",
  className // props
)} />
```

## Ressources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
