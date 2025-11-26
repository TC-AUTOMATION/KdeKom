import { useState, useEffect } from 'react';
import { fetchClients } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Users, Search, Plus, ChevronRight, Edit, Trash2, List, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';

interface ClientData {
  id: string;
  nom: string;
  note?: string;
  nb_missions: number;
  ca_total: number;
  total_subvention: number;
  total_paye: number;
}

export default function Clients() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setIsLoading(true);
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Filter clients based on search query
  const filteredClients = clients.filter(client => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return client.nom.toLowerCase().includes(query) ||
      client.note?.toLowerCase().includes(query);
  });

  // Sort by CA total descending
  const sortedClients = [...filteredClients].sort((a, b) => b.ca_total - a.ca_total);

  // Calculate totals for KPIs
  const totalCA = clients.reduce((sum, c) => sum + c.ca_total, 0);
  const totalSubvention = clients.reduce((sum, c) => sum + c.total_subvention, 0);
  const totalPaye = clients.reduce((sum, c) => sum + c.total_paye, 0);
  const totalEnAttente = totalCA - totalSubvention - totalPaye;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-app-border border-t-app-text-muted rounded-full mb-4 mx-auto"></div>
          <p className="text-lg font-medium text-app-text-secondary">Chargement des clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-text-primary">Gestion des Clients</h1>
          <p className="text-app-text-muted mt-1">{clients.length} client{clients.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowList(!showList)}
          >
            {showList ? <LayoutDashboard className="h-5 w-5 mr-2" /> : <List className="h-5 w-5 mr-2" />}
            {showList ? 'Vue globale' : 'Liste'}
          </Button>
          <Button>
            <Plus className="h-5 w-5 mr-2" />
            Nouveau client
          </Button>
        </div>
      </div>

      {!showList && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
              <p className="text-sm text-app-text-muted">CA Subvention</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{formatCurrency(totalSubvention)}</p>
            </div>
            <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
              <p className="text-sm text-app-text-muted">CA Total</p>
              <p className="text-2xl font-bold text-app-text-primary mt-1">{formatCurrency(totalCA)}</p>
            </div>
            <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
              <p className="text-sm text-app-text-muted">CA Payé</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(totalPaye)}</p>
            </div>
            <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
              <p className="text-sm text-app-text-muted">En attente</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{formatCurrency(totalEnAttente)}</p>
            </div>
          </div>

          {/* Top 10 Clients */}
          <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
            <div className="px-6 py-4 border-b border-app-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-app-text-primary">Top 10 Clients par CA</h3>
              <button
                onClick={() => setShowList(true)}
                className="text-sm text-app-text-muted hover:text-app-text-secondary flex items-center gap-1 transition-colors"
              >
                Voir tout
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {sortedClients.slice(0, 10).map((client, index) => {
                  const shareOfRevenue = totalCA > 0 ? (client.ca_total / totalCA) * 100 : 0;
                  const enAttente = client.ca_total - client.total_subvention - client.total_paye;

                  return (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 bg-app-dark rounded-lg border border-app-border"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 bg-app-border rounded-lg text-xs font-semibold text-app-text-secondary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-app-text-primary truncate">{client.nom}</p>
                          <p className="text-xs text-app-text-muted">
                            {client.nb_missions} mission{client.nb_missions > 1 ? 's' : ''} - {shareOfRevenue.toFixed(1)}% du CA
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-app-text-primary">{formatCurrency(client.ca_total)}</p>
                        {enAttente > 0 && (
                          <p className="text-xs text-orange-400">{formatCurrency(enAttente)} en attente</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {showList && (
        <>
          {/* Filter Bar */}
          <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-app-border">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <label className="block text-xs font-medium text-app-text-muted mb-2">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-app-text-muted" />
                  <Input
                    type="text"
                    placeholder="Nom du client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
            <div className="px-6 py-4 border-b border-app-border">
              <h3 className="text-lg font-semibold text-app-text-primary">Liste des clients</h3>
            </div>
            {filteredClients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Client</TableHead>
                    <TableHead className="text-center">Note</TableHead>
                    <TableHead className="text-center">Missions</TableHead>
                    <TableHead className="text-center">CA Subvention</TableHead>
                    <TableHead className="text-center">CA Total</TableHead>
                    <TableHead className="text-center">CA Payé</TableHead>
                    <TableHead className="text-center">En attente</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedClients.map((client) => (
                    <TableRow key={client.id} className="cursor-pointer">
                      <TableCell className="text-center font-medium text-app-text-primary">
                        {client.nom}
                      </TableCell>
                      <TableCell className="text-center text-app-text-muted">
                        {client.note || '-'}
                      </TableCell>
                      <TableCell className="text-center font-medium text-app-text-primary">
                        {client.nb_missions}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-blue-400">
                        {formatCurrency(client.total_subvention)}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-app-text-primary">
                        {formatCurrency(client.ca_total)}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-green-400">
                        {formatCurrency(client.total_paye)}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-orange-400">
                        {formatCurrency(client.ca_total - client.total_subvention - client.total_paye)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
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
                <Users className="h-12 w-12 text-app-text-muted mx-auto mb-4" />
                <p className="text-app-text-muted">
                  {searchQuery ? 'Aucun client trouvé' : 'Aucun client enregistré'}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
