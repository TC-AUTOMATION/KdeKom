import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download } from 'lucide-react';

export default function PartnerMissions() {
  // Mock data
  const missions = [
    { id: 1, client: 'TechCorp', mission: 'Audit SEO', date: '2024-10-15', amount: 1500, status: 'Payé', commission: 450 },
    { id: 2, client: 'Studio Design', mission: 'Refonte Site', date: '2024-11-02', amount: 3200, status: 'En cours', commission: 960 },
    { id: 3, client: 'Bakery & Co', mission: 'Campagne Ads', date: '2024-11-10', amount: 800, status: 'Facturé', commission: 240 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mes Missions</h2>
        <p className="text-slate-500">Suivez l'état de vos missions et commissions.</p>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Rechercher une mission..." 
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4 text-slate-500" />
        </Button>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4 text-slate-500" />
        </Button>
      </div>

      <div className="grid gap-4">
        {missions.map((mission) => (
          <Card key={mission.id} className="hover:shadow-md transition-shadow border-slate-200">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg text-slate-900">{mission.client}</h3>
                  <Badge variant={mission.status === 'Payé' ? 'default' : 'secondary'} className={
                    mission.status === 'Payé' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 
                    mission.status === 'En cours' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                    'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }>
                    {mission.status}
                  </Badge>
                </div>
                <p className="text-slate-500 text-sm">{mission.mission} • {new Date(mission.date).toLocaleDateString('fr-FR')}</p>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500">Commission estimée</p>
                <p className="text-xl font-bold text-emerald-600">
                  {mission.commission.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}