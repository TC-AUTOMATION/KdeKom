import { useEffect, useState } from 'react';
import { fetchClients, fetchPersons } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Search, Plus, Eye, Edit2, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface RelationshipDetails {
  apporteurName: string;
  parrain: string;
  client: string;
  apporteur: string;
  missionRef: string;
  paymentStatus: string;
  lastUpdated: string;
}

export default function AdminContacts() {
  const [clients, setClients] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipDetails | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchClients(), fetchPersons()]).then(([c, p]) => {
      setClients(c);
      setPersons(p);
      setLoading(false);
    });
  }, []);

  // Mock data for the apporteurs table
  const apporteurs = [
    {
      id: '1',
      name: 'Marie Curie',
      parrain: 'Pierre Dupont',
      clientOrg: 'TechSolutions Inc',
      missionRef: 'M-2345',
      paymentStatus: 'OUI'
    },
    {
      id: '2',
      name: 'Albert Einstein',
      parrain: '-',
      clientOrg: 'Innovatech SA',
      missionRef: 'M-5678',
      paymentStatus: 'NON'
    },
    {
      id: '3',
      name: 'Niels Bohr',
      parrain: 'Marie Curie',
      clientOrg: 'Global Pharma',
      missionRef: 'M-9012',
      paymentStatus: 'OUI'
    }
  ];

  const filteredApporteurs = apporteurs.filter(apporteur => {
    const matchesSearch = searchTerm === '' ||
      apporteur.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apporteur.clientOrg.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apporteur.paymentStatus === statusFilter;
    const matchesClient = clientFilter === 'all' || apporteur.clientOrg === clientFilter;

    return matchesSearch && matchesStatus && matchesClient;
  });

  const uniqueClients = [...new Set(apporteurs.map(a => a.clientOrg))];

  const handleViewDetails = (apporteur: any) => {
    setSelectedRelationship({
      apporteurName: apporteur.name,
      parrain: apporteur.parrain,
      client: apporteur.clientOrg,
      apporteur: apporteur.name,
      missionRef: apporteur.missionRef,
      paymentStatus: apporteur.paymentStatus,
      lastUpdated: '2023-10-27'
    });
    setSheetOpen(true);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setClientFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = statusFilter !== 'all' || clientFilter !== 'all' || searchTerm;

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Données de Base : Apporteurs & Relations</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une Nouvelle Entrée
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Recherche"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="OUI">Payé (OUI)</SelectItem>
                <SelectItem value="NON">Non Payé (NON)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                {uniqueClients.map(client => (
                  <SelectItem key={client} value={client}>{client}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Effacer les filtres
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nom de l'Apporteur</TableHead>
                <TableHead>Parrain (Sponsor)</TableHead>
                <TableHead>Organisation Client</TableHead>
                <TableHead>Réf. de Mission</TableHead>
                <TableHead className="text-center">Réglé (Paiement)</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApporteurs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun apporteur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredApporteurs.map((apporteur) => (
                  <TableRow key={apporteur.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{apporteur.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {apporteur.parrain}
                    </TableCell>
                    <TableCell>{apporteur.clientOrg}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {apporteur.missionRef}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          apporteur.paymentStatus === 'OUI'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-red-100 text-red-700 hover:bg-red-100'
                        }
                      >
                        {apporteur.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleViewDetails(apporteur)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Side Panel for Relationship Details */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedRelationship && (
            <>
              <SheetHeader>
                <SheetTitle>Détails de la Relation:</SheetTitle>
                <SheetDescription className="text-xl font-semibold text-foreground">
                  {selectedRelationship.apporteurName}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Parrain:</h3>
                    <p className="text-base font-medium">{selectedRelationship.parrain}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Apporteur:</h3>
                    <p className="text-base font-medium">{selectedRelationship.apporteur}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Client:</h3>
                    <p className="text-base font-medium">{selectedRelationship.client}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Statut de Paiement:</h3>
                    <Badge
                      className={
                        selectedRelationship.paymentStatus === 'OUI'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-100 text-red-700 hover:bg-red-100'
                      }
                    >
                      {selectedRelationship.paymentStatus}
                    </Badge>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Dernière Mise à Jour:</h3>
                    <p className="text-base">{selectedRelationship.lastUpdated}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1">
                    Modifier
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Exporter
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Clients and Partners Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Clients</h3>
            <p className="text-3xl font-bold">{clients.length}</p>
            <p className="text-sm text-muted-foreground">Total des entreprises clientes</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Partenaires & Consultants</h3>
            <p className="text-3xl font-bold">{persons.length}</p>
            <p className="text-sm text-muted-foreground">Total des collaborateurs</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
