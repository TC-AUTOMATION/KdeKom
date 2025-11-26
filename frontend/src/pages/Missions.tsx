import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMissions, toggleMissionPaid } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useFilters } from '@/contexts/FilterContext';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { Plus, Search, Download, ChevronLeft, ChevronRight, Briefcase, Calendar, Edit, Trash2, CalendarRange } from 'lucide-react';
import { MissionForm } from '@/components/MissionForm';
import { MissionGroupForm } from '@/components/MissionGroupForm';

// Format month: "Janvier 2024" -> "Jan. 2024"
const formatMonth = (mois: string, annee: number) => {
  const moisCourt: Record<string, string> = {
    'Janvier': 'Jan.', 'Février': 'Fév.', 'Mars': 'Mar.', 'Avril': 'Avr.',
    'Mai': 'Mai', 'Juin': 'Juin', 'Juillet': 'Juil.', 'Août': 'Août',
    'Septembre': 'Sep.', 'Octobre': 'Oct.', 'Novembre': 'Nov.', 'Décembre': 'Déc.'
  };
  return `${moisCourt[mois] || mois} ${annee}`;
};

const moisNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function AdminMissions() {
  const navigate = useNavigate();
  const { selectedYear, selectedMonth, selectedClient } = useFilters();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states (local filters in addition to navbar)
  const [filterApporteur, setFilterApporteur] = useState('all');
  const [filterPaiement, setFilterPaiement] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadMissions();
  }, [selectedYear, selectedMonth, selectedClient]);

  async function loadMissions() {
    try {
      const allMissions = await fetchMissions();

      // Apply navbar filters
      let filtered = allMissions.filter((m: any) => {
        // Filter by year
        if (m.annee !== selectedYear) return false;
        // Filter by month if selected
        if (selectedMonth !== null && m.mois !== moisNames[selectedMonth]) return false;
        // Filter by client if selected
        if (selectedClient && m.client !== selectedClient) return false;
        return true;
      });

      setMissions(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePaid(id: string) {
    try {
      await toggleMissionPaid(id);
      loadMissions();
    } catch (error) {
      console.error(error);
    }
  }

  // Extract unique values for filters (from already filtered missions by navbar)
  const apporteurs = [...new Set(missions.map(m => m.apporteur_nom).filter(a => a && a !== '-'))].sort();

  // Apply local filters (in addition to navbar filters)
  const filteredMissions = missions.filter(mission => {
    const matchesSearch = searchTerm === '' ||
      mission.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.nom_mission?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesApporteur = filterApporteur === 'all' || mission.apporteur_nom === filterApporteur;
    const matchesPaiement = filterPaiement === 'all' ||
      (filterPaiement === 'paye' && mission.is_paid) ||
      (filterPaiement === 'impaye' && !mission.is_paid);

    return matchesSearch && matchesApporteur && matchesPaiement;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMissions = filteredMissions.slice(startIndex, startIndex + itemsPerPage);

  const clearFilters = () => {
    setFilterApporteur('all');
    setFilterPaiement('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = filterApporteur !== 'all' || filterPaiement !== 'all' || searchTerm;

  const getPaymentBadge = (isPaid: boolean) => {
    if (isPaid) {
      return <Badge variant="default" className="bg-status-success/20 text-status-success hover:bg-status-success/30">Payé</Badge>;
    }
    return <Badge variant="default" className="bg-status-warning/20 text-status-warning hover:bg-status-warning/30">En attente</Badge>;
  };

  const exportToCSV = () => {
    alert('Export CSV functionality');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-app-border border-t-app-text-muted rounded-full mb-4 mx-auto"></div>
          <p className="text-lg font-medium text-app-text-secondary">Chargement des missions...</p>
        </div>
      </div>
    );
  }

  if (showGroupForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-app-text-primary">Création groupée de Missions</h1>
            <p className="text-app-text-muted mt-1">Créez plusieurs missions d'un coup (ex: mission annuelle sur 12 mois)</p>
          </div>
        </div>
        <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
          <div className="p-6">
            <MissionGroupForm
              onSuccess={() => {
                setShowGroupForm(false);
                loadMissions();
              }}
              onCancel={() => setShowGroupForm(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-app-text-primary">Créer une Mission</h1>
            <p className="text-app-text-muted mt-1">Remplissez les informations de la mission</p>
          </div>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Annuler
          </Button>
        </div>
        <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
          <div className="p-6">
            <MissionForm onSuccess={() => {
              setShowForm(false);
              loadMissions();
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-text-primary">Gestion des Missions</h1>
          <p className="text-app-text-muted mt-1">{filteredMissions.length} mission{filteredMissions.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowGroupForm(true)}>
            <CalendarRange className="h-5 w-5 mr-2" />
            Création groupée
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle Mission
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-app-border">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-app-text-muted mb-2">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-app-text-muted" />
              <Input
                type="text"
                placeholder="Client, mission..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Apporteur Filter */}
          <div className="min-w-[150px]">
            <label className="block text-xs font-medium text-app-text-muted mb-2">Apporteur</label>
            <Select value={filterApporteur} onValueChange={setFilterApporteur}>
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {apporteurs.map(apporteur => (
                  <SelectItem key={apporteur} value={apporteur}>{apporteur}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Paiement Filter */}
          <div className="min-w-[150px]">
            <label className="block text-xs font-medium text-app-text-muted mb-2">Paiement</label>
            <Select value={filterPaiement} onValueChange={setFilterPaiement}>
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="paye">Payé</SelectItem>
                <SelectItem value="impaye">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Effacer filtres
              </Button>
            )}
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Missions Table */}
      <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
        <div className="px-6 py-4 border-b border-app-border">
          <h3 className="text-lg font-semibold text-app-text-primary">Liste des missions</h3>
        </div>
        {filteredMissions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-center">Mission</TableHead>
                <TableHead className="text-center">Client</TableHead>
                <TableHead className="text-center">Apporteur</TableHead>
                <TableHead className="text-center">Période</TableHead>
                <TableHead className="text-center">CA Total</TableHead>
                <TableHead className="text-center">Subvention</TableHead>
                <TableHead className="text-center">Part Client</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMissions.map((mission) => (
                <TableRow
                  key={mission.id}
                  className="cursor-pointer hover:bg-app-hover"
                  onClick={() => navigate(`/missions/${mission.id}`)}
                >
                  <TableCell className="text-center">
                    {getPaymentBadge(mission.is_paid)}
                  </TableCell>
                  <TableCell className="text-center font-medium text-app-text-primary">
                    {mission.nom_mission}
                  </TableCell>
                  <TableCell className="text-center text-app-text-muted">
                    {mission.client_nom}
                  </TableCell>
                  <TableCell className="text-center text-app-text-muted">
                    {mission.apporteur_nom || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-app-text-muted">
                      <Calendar className="w-4 h-4" />
                      {formatMonth(mission.mois, mission.annee)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-app-text-primary">
                    {formatCurrency(mission.ca_genere || 0)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold text-blue-400">{formatCurrency(mission.montant_sub || 0)}</span>
                    <span className="text-xs text-app-text-muted ml-1">({mission.pct_sub || 0}%)</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-semibold ${mission.is_paid ? 'text-green-400' : 'text-orange-400'}`}>
                      {formatCurrency(mission.montant_client || 0)}
                    </span>
                    <span className="text-xs text-app-text-muted ml-1">({mission.pct_client || 0}%)</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePaid(mission.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className={mission.is_paid ? "text-orange-400 hover:bg-orange-400/20" : "text-green-400 hover:bg-green-400/20"}
                        title={mission.is_paid ? "Marquer impayé" : "Marquer payé"}
                      >
                        <Briefcase className="w-4 h-4" />
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
            <Briefcase className="h-12 w-12 text-app-text-muted mx-auto mb-4" />
            <p className="text-app-text-muted">
              {searchTerm || hasActiveFilters ? 'Aucune mission trouvée' : 'Aucune mission enregistrée'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredMissions.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-app-border">
            <div className="text-sm text-app-text-muted">
              Affichage {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredMissions.length)} sur {filteredMissions.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
