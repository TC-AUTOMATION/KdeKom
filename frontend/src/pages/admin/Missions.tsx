import { useEffect, useState } from 'react';
import { fetchMissions, toggleMissionPaid } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, Download, ChevronLeft, ChevronRight, Eye, Edit, X } from 'lucide-react';
import { MissionForm } from '@/components/MissionForm';

export default function AdminMissions() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states
  const [filterApporteur, setFilterApporteur] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [filterConsultant, setFilterConsultant] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadMissions();
  }, []);

  async function loadMissions() {
    try {
      const data = await fetchMissions();
      setMissions(data);
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

  // Extract unique values for filters
  const apporteurs = [...new Set(missions.map(m => m.apporteur_name).filter(Boolean))];
  const clients = [...new Set(missions.map(m => m.client_name).filter(Boolean))];
  const consultants = [...new Set(missions.map(m => m.consultant_name).filter(Boolean))];
  const months = [...new Set(missions.map(m => m.month).filter(Boolean))].sort();

  // Apply filters
  const filteredMissions = missions.filter(mission => {
    const matchesSearch = searchTerm === '' ||
      mission.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesApporteur = filterApporteur === 'all' || mission.apporteur_name === filterApporteur;
    const matchesClient = filterClient === 'all' || mission.client_name === filterClient;
    const matchesConsultant = filterConsultant === 'all' || mission.consultant_name === filterConsultant;
    const matchesMonth = filterMonth === 'all' || mission.month === filterMonth;

    return matchesSearch && matchesApporteur && matchesClient && matchesConsultant && matchesMonth;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMissions = filteredMissions.slice(startIndex, startIndex + itemsPerPage);

  const clearFilters = () => {
    setFilterApporteur('all');
    setFilterClient('all');
    setFilterConsultant('all');
    setFilterMonth('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = filterApporteur !== 'all' || filterClient !== 'all' || filterConsultant !== 'all' || filterMonth !== 'all' || searchTerm;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
      pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
      completed: { label: 'Completed', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.active;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const exportToCSV = () => {
    // CSV export logic here
    alert('Export CSV functionality');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (showForm) {
    return (
      <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Créer / Modifier Mission</h2>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Annuler
          </Button>
        </div>
        <Card className="p-6">
          <MissionForm onSuccess={() => {
            setShowForm(false);
            loadMissions();
          }} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Aperçu des Missions</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Mission
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Filtrer par Apporteur:</label>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Filtrer par Client:</label>
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client} value={client}>{client}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Filtrer par Consultant:</label>
            <Select value={filterConsultant} onValueChange={setFilterConsultant}>
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {consultants.map(consultant => (
                  <SelectItem key={consultant} value={consultant}>{consultant}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Filtrer par Mois:</label>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {months.map(month => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">&nbsp;</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher missions..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">&nbsp;</label>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Effacer
                </Button>
              )}
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Statut</TableHead>
                <TableHead>ID Mission</TableHead>
                <TableHead>Nom de la Mission</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Consultant</TableHead>
                <TableHead>Apporteur</TableHead>
                <TableHead>Mois</TableHead>
                <TableHead className="text-right">Montant Facturé</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Aucune mission trouvée
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMissions.map((mission) => (
                  <TableRow key={mission.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      {getStatusBadge(mission.status || 'active')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      M-{String(mission.id).padStart(4, '0')}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {mission.title}
                    </TableCell>
                    <TableCell>{mission.client_name}</TableCell>
                    <TableCell>{mission.consultant_name || mission.apporteur_name}</TableCell>
                    <TableCell>{mission.apporteur_name}</TableCell>
                    <TableCell>{mission.month}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(mission.amount_billed)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="default">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleTogglePaid(mission.id)}>
                              Marquer comme {mission.is_paid ? "non payé" : "payé"}
                            </DropdownMenuItem>
                            <DropdownMenuItem>Modifier</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredMissions.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Affichage {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredMissions.length)} sur {filteredMissions.length} entrées
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
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

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Lignes par page:</span>
                <Select value={String(itemsPerPage)} onValueChange={(val) => {
                  // Handle itemsPerPage change
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
