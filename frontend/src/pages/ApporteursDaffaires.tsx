import { useEffect, useState } from 'react';
import { fetchApporteurs } from '@/lib/api';
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
import { Badge } from '@/components/ui/shadcn/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/shadcn/sheet';
import { Search, Plus, Handshake, TrendingUp, Users, Euro, Edit, Trash2, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/shadcn/separator';

interface ApporteurData {
  id: string;
  nom: string;
  note?: string;
  nb_missions: number;
  total_commissions: number;
}

export default function ApporteursDaffaires() {
  const [apporteurs, setApporteurs] = useState<ApporteurData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApporteur, setSelectedApporteur] = useState<ApporteurData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    loadApporteurs();
  }, []);

  async function loadApporteurs() {
    try {
      const data = await fetchApporteurs();
      setApporteurs(data);
    } catch (err) {
      console.error('Error loading apporteurs:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter
  const filteredApporteurs = apporteurs.filter(a => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return a.nom.toLowerCase().includes(query) || a.note?.toLowerCase().includes(query);
  });

  // Sort by total commissions
  const sortedApporteurs = [...filteredApporteurs].sort((a, b) => b.total_commissions - a.total_commissions);

  const handleViewDetails = (apporteur: ApporteurData) => {
    setSelectedApporteur(apporteur);
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
          <p className="text-lg font-medium text-app-text-secondary">Chargement des apporteurs...</p>
        </div>
      </div>
    );
  }

  // Statistiques globales
  const totalApporteurs = apporteurs.length;
  const totalCommissions = apporteurs.reduce((sum, a) => sum + a.total_commissions, 0);
  const totalMissions = apporteurs.reduce((sum, a) => sum + a.nb_missions, 0);
  const activeApporteurs = apporteurs.filter(a => a.nb_missions > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-text-primary">Apporteurs d'Affaires</h1>
          <p className="text-app-text-muted mt-1">{totalApporteurs} apporteur{totalApporteurs > 1 ? 's' : ''} - {activeApporteurs} actif{activeApporteurs > 1 ? 's' : ''}</p>
        </div>
        <Button>
          <Plus className="h-5 w-5 mr-2" />
          Nouvel apporteur
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Handshake className="h-4 w-4 text-app-text-muted" />
            <p className="text-sm text-app-text-muted">Total Apporteurs</p>
          </div>
          <p className="text-2xl font-bold text-app-text-primary">{totalApporteurs}</p>
        </div>

        <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-app-text-muted" />
            <p className="text-sm text-app-text-muted">Apporteurs Actifs</p>
          </div>
          <p className="text-2xl font-bold text-app-text-primary">{activeApporteurs}</p>
          <p className="text-xs text-app-text-muted mt-1">avec missions</p>
        </div>

        <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-app-text-muted" />
            <p className="text-sm text-app-text-muted">Total Missions</p>
          </div>
          <p className="text-2xl font-bold text-app-text-primary">{totalMissions}</p>
        </div>

        <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="h-4 w-4 text-app-text-muted" />
            <p className="text-sm text-app-text-muted">Total Commissions</p>
          </div>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalCommissions)}</p>
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
                placeholder="Nom de l'apporteur..."
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

      {/* Apporteurs Table */}
      <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
        <div className="px-6 py-4 border-b border-app-border">
          <h3 className="text-lg font-semibold text-app-text-primary">Liste des apporteurs</h3>
        </div>
        {sortedApporteurs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Nom</TableHead>
                <TableHead className="text-center">Note</TableHead>
                <TableHead className="text-center">Missions</TableHead>
                <TableHead className="text-center">Total Commissions</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedApporteurs.map((apporteur) => (
                <TableRow
                  key={apporteur.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest('button')) {
                      handleViewDetails(apporteur);
                    }
                  }}
                >
                  <TableCell className="text-center font-medium text-app-text-primary">
                    {apporteur.nom}
                  </TableCell>
                  <TableCell className="text-center text-app-text-muted">
                    {apporteur.note || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{apporteur.nb_missions}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-green-400">
                    {formatCurrency(apporteur.total_commissions)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(apporteur);
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
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-12 text-center">
            <Handshake className="h-12 w-12 text-app-text-muted mx-auto mb-4" />
            <p className="text-app-text-muted">
              {searchTerm ? 'Aucun apporteur trouvé' : 'Aucun apporteur enregistré'}
            </p>
          </div>
        )}
      </div>

      {/* Side Panel for Apporteur Details */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedApporteur && (
            <>
              <SheetHeader>
                <SheetTitle>Détails de l'Apporteur</SheetTitle>
                <SheetDescription className="text-xl font-semibold text-foreground">
                  {selectedApporteur.nom}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  {selectedApporteur.note && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Note
                        </h3>
                        <p className="text-base">{selectedApporteur.note}</p>
                      </div>
                      <Separator />
                    </>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Nombre de Missions
                    </h3>
                    <p className="text-2xl font-bold">{selectedApporteur.nb_missions}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Total Commissions
                    </h3>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(selectedApporteur.total_commissions)}
                    </p>
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
