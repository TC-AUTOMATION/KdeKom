import { useEffect, useState } from 'react';
import { fetchCollaborateurs } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shadcn/table';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/shadcn/sheet';
import { Search, Plus, UserCog, TrendingUp, Users, Euro, Edit, Trash2, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/shadcn/separator';

interface CollaborateurData {
  id: string;
  nom: string;
  note?: string;
  total_gains: number;
  total_potentiel: number;
}

export default function Collaborateurs() {
  const [collaborateurs, setCollaborateurs] = useState<CollaborateurData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollab, setSelectedCollab] = useState<CollaborateurData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    loadCollaborateurs();
  }, []);

  async function loadCollaborateurs() {
    try {
      const data = await fetchCollaborateurs();
      setCollaborateurs(data);
    } catch (err) {
      console.error('Error loading collaborateurs:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter
  const filteredCollaborateurs = collaborateurs.filter(c => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return c.nom.toLowerCase().includes(query) || c.note?.toLowerCase().includes(query);
  });

  // Sort by total gains
  const sortedCollaborateurs = [...filteredCollaborateurs].sort((a, b) => b.total_gains - a.total_gains);

  const handleViewDetails = (collab: CollaborateurData) => {
    setSelectedCollab(collab);
    setSheetOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
  };

  const hasActiveFilters = searchTerm !== '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-app-border border-t-app-text-muted rounded-full mb-4 mx-auto"></div>
          <p className="text-lg font-medium text-app-text-secondary">Chargement des collaborateurs...</p>
        </div>
      </div>
    );
  }

  // Statistiques globales
  const totalCollaborateurs = collaborateurs.length;
  const totalGains = collaborateurs.reduce((sum, c) => sum + c.total_gains, 0);
  const totalPotentiel = collaborateurs.reduce((sum, c) => sum + c.total_potentiel, 0);
  const totalEnAttente = totalPotentiel - totalGains;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-text-primary">Gestion des Collaborateurs</h1>
          <p className="text-app-text-muted mt-1">{totalCollaborateurs} collaborateur{totalCollaborateurs > 1 ? 's' : ''}</p>
        </div>
        <Button>
          <Plus className="h-5 w-5 mr-2" />
          Nouveau collaborateur
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-app-text-muted" />
            <p className="text-sm text-app-text-muted">Collaborateurs</p>
          </div>
          <p className="text-2xl font-bold text-app-text-primary">{totalCollaborateurs}</p>
        </div>

        <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="h-4 w-4 text-app-text-muted" />
            <p className="text-sm text-app-text-muted">Total Distribué</p>
          </div>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalGains)}</p>
        </div>

        <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-app-text-muted" />
            <p className="text-sm text-app-text-muted">Potentiel Total</p>
          </div>
          <p className="text-2xl font-bold text-app-text-primary">{formatCurrency(totalPotentiel)}</p>
        </div>

        <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="h-4 w-4 text-app-text-muted" />
            <p className="text-sm text-app-text-muted">En Attente</p>
          </div>
          <p className="text-2xl font-bold text-orange-400">{formatCurrency(totalEnAttente)}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-app-border">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <label className="block text-xs font-medium text-app-text-muted mb-2">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-app-text-muted" />
              <Input
                type="text"
                placeholder="Nom du collaborateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>
                Effacer filtres
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Collaborateurs Table */}
      <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
        <div className="px-6 py-4 border-b border-app-border">
          <h3 className="text-lg font-semibold text-app-text-primary">Liste des collaborateurs</h3>
        </div>
        {sortedCollaborateurs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Nom</TableHead>
                <TableHead className="text-center">Note</TableHead>
                <TableHead className="text-center">Total Perçu</TableHead>
                <TableHead className="text-center">Potentiel</TableHead>
                <TableHead className="text-center">En Attente</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCollaborateurs.map((collab) => {
                const enAttente = collab.total_potentiel - collab.total_gains;
                return (
                  <TableRow
                    key={collab.id}
                    className="cursor-pointer"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.closest('button')) {
                        handleViewDetails(collab);
                      }
                    }}
                  >
                    <TableCell className="text-center font-medium text-app-text-primary">
                      {collab.nom}
                    </TableCell>
                    <TableCell className="text-center text-app-text-muted">
                      {collab.note || '-'}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-green-400">
                      {formatCurrency(collab.total_gains)}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-app-text-primary">
                      {formatCurrency(collab.total_potentiel)}
                    </TableCell>
                    <TableCell className="text-center">
                      {enAttente > 0 ? (
                        <span className="font-semibold text-orange-400">
                          {formatCurrency(enAttente)}
                        </span>
                      ) : (
                        <span className="text-app-text-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(collab);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:bg-blue-400/20"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={(e) => e.stopPropagation()}
                          variant="ghost"
                          size="sm"
                          className="text-app-text-muted hover:bg-app-border"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={(e) => e.stopPropagation()}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:bg-red-400/20"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="py-12 text-center">
            <UserCog className="h-12 w-12 text-app-text-muted mx-auto mb-4" />
            <p className="text-app-text-muted">
              {searchTerm ? 'Aucun collaborateur trouvé' : 'Aucun collaborateur enregistré'}
            </p>
          </div>
        )}
      </div>

      {/* Side Panel for Collaborateur Details */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedCollab && (
            <>
              <SheetHeader>
                <SheetTitle>Détails du Collaborateur</SheetTitle>
                <SheetDescription className="text-xl font-semibold text-foreground">
                  {selectedCollab.nom}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  {selectedCollab.note && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Note
                        </h3>
                        <p className="text-base">{selectedCollab.note}</p>
                      </div>
                      <Separator />
                    </>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Total Perçu
                    </h3>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(selectedCollab.total_gains)}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Potentiel Total
                    </h3>
                    <p className="text-2xl font-bold">
                      {formatCurrency(selectedCollab.total_potentiel)}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      En Attente de Paiement
                    </h3>
                    {selectedCollab.total_potentiel - selectedCollab.total_gains > 0 ? (
                      <p className="text-2xl font-bold text-orange-400">
                        {formatCurrency(selectedCollab.total_potentiel - selectedCollab.total_gains)}
                      </p>
                    ) : (
                      <p className="text-base text-muted-foreground">Aucun paiement en attente</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1">
                    Modifier
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Voir Missions
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
