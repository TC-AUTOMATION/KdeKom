import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPersonDetails } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PersonDetails() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPersonDetails(id).then(setData).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (!data) return <div>Personne non trouvée</div>;

  const { person, apporteurMissions, distributionMissions } = data;

  const totalApporteurCommissions = apporteurMissions.reduce((sum: number, m: any) => sum + Number(m.apporteur_commission), 0);
  const totalDistributions = distributionMissions.reduce((sum: number, m: any) => sum + Number(m.distributed_amount), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{person.name}</h2>
      <p className="text-muted-foreground capitalize">{person.role}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Commissions Apporteur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalApporteurCommissions)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenus Distribués</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDistributions)}</div>
          </CardContent>
        </Card>
      </div>

      {apporteurMissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missions Apportées</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mois</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Mission</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apporteurMissions.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.month}</TableCell>
                    <TableCell>{m.client_name}</TableCell>
                    <TableCell>{m.title}</TableCell>
                    <TableCell className="text-right">{formatCurrency(m.apporteur_commission)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {distributionMissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenus de Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mois</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Mission</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributionMissions.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.month}</TableCell>
                    <TableCell>{m.client_name}</TableCell>
                    <TableCell>{m.title}</TableCell>
                    <TableCell className="text-right">{(Number(m.percentage) * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(m.distributed_amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}