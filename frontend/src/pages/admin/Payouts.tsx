import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

interface PayoutRecord {
  id: string;
  name: string;
  role: 'Consultant' | 'Business Provider';
  earningsBase: number;
  earningsBonus: number;
  totalEarnings: number;
  status: 'Pending' | 'Processed';
}

export default function Payouts() {
  const [period, setPeriod] = useState('october-2023');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payouts, setPayouts] = useState<PayoutRecord[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Consultant',
      earningsBase: 12000,
      earningsBonus: 1500,
      totalEarnings: 13500,
      status: 'Pending'
    },
    {
      id: '2',
      name: 'David Chen',
      role: 'Business Provider',
      earningsBase: 8500,
      earningsBonus: 800,
      totalEarnings: 9300,
      status: 'Pending'
    },
    {
      id: '3',
      name: 'Emily Davis',
      role: 'Consultant',
      earningsBase: 15000,
      earningsBonus: 2200,
      totalEarnings: 17200,
      status: 'Processed'
    },
    {
      id: '4',
      name: 'Michael Brown',
      role: 'Business Provider',
      earningsBase: 7000,
      earningsBonus: 1000,
      totalEarnings: 8000,
      status: 'Processed'
    },
    {
      id: '5',
      name: 'Jessica Wilson',
      role: 'Consultant',
      earningsBase: 11500,
      earningsBonus: 1200,
      totalEarnings: 12700,
      status: 'Pending'
    },
    {
      id: '6',
      name: 'Robert Miller',
      role: 'Business Provider',
      earningsBase: 9000,
      earningsBonus: 950,
      totalEarnings: 9950,
      status: 'Pending'
    }
  ]);

  const filteredPayouts = payouts.filter(payout => {
    const matchesRole = roleFilter === 'all' || payout.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    return matchesRole && matchesStatus;
  });

  const totalPayouts = payouts.reduce((sum, p) => sum + p.totalEarnings, 0);
  const pendingPayouts = payouts.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.totalEarnings, 0);
  const processedPayouts = payouts.filter(p => p.status === 'Processed').reduce((sum, p) => sum + p.totalEarnings, 0);

  const handleMarkAsProcessed = (id: string) => {
    setPayouts(prev =>
      prev.map(p => p.id === id ? { ...p, status: 'Processed' as const } : p)
    );
  };

  const handleRefresh = () => {
    // Reload payouts data
    alert('Rafraîchir les données');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Paiements</h2>
          <p className="text-muted-foreground">Gérez les paiements des consultants et partenaires commerciaux</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total des Paiements pour Oct 2023
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalPayouts)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paiements en Attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{formatCurrency(pendingPayouts)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paiements Traités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{formatCurrency(processedPayouts)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Période:</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="october-2023">Octobre 2023</SelectItem>
                  <SelectItem value="september-2023">Septembre 2023</SelectItem>
                  <SelectItem value="august-2023">Août 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Rôle:</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Consultant">Consultant</SelectItem>
                  <SelectItem value="Business Provider">Business Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Statut:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Pending">En Attente</SelectItem>
                  <SelectItem value="Processed">Traité</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser Données
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payouts Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nom</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Revenus (Base)</TableHead>
                <TableHead className="text-right">Revenus (Bonus)</TableHead>
                <TableHead className="text-right">Revenus Totaux</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun paiement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayouts.map((payout) => (
                  <TableRow key={payout.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{payout.name}</TableCell>
                    <TableCell>{payout.role}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(payout.earningsBase)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(payout.earningsBonus)}
                    </TableCell>
                    <TableCell className="text-right font-semibold font-mono">
                      {formatCurrency(payout.totalEarnings)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          payout.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                        }
                      >
                        {payout.status === 'Pending' ? 'En Attente' : 'Traité'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {payout.status === 'Pending' ? (
                        <Button
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700"
                          onClick={() => handleMarkAsProcessed(payout.id)}
                        >
                          Marquer comme Traité
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          Voir Détails
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination placeholder */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page 1 sur 5
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Précédent
            </Button>
            <Button variant="outline" size="sm">
              Suivant
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
