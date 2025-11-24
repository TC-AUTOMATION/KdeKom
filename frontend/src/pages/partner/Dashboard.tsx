import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, DollarSign, Calendar, FileText } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

export default function PartnerDashboard() {
  // Mock data for partner view
  const stats = {
    totalCommission: 12500,
    pendingCommission: 3200,
    missionsCount: 14,
    nextPaymentDate: '2025-12-05'
  };

  const chartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      axisLine: { lineStyle: { color: '#cbd5e1' } }
    },
    yAxis: { 
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } }
    },
    series: [{
      data: [820, 932, 901, 934, 1290, 1330],
      type: 'line',
      smooth: true,
      symbolSize: 8,
      itemStyle: { color: '#10b981' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0)' }
          ]
        }
      }
    }]
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bonjour, John 👋</h2>
          <p className="text-slate-500">Voici un aperçu de vos performances.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <FileText className="mr-2 h-4 w-4" />
          Déclarer une mission
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Commissions Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalCommission.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +15% ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">En Attente</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.pendingCommission.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            <p className="text-xs text-slate-500 mt-1">
              Prochain paiement le {new Date(stats.nextPaymentDate).toLocaleDateString('fr-FR')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Missions Actives</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.missionsCount}</div>
            <p className="text-xs text-slate-500 mt-1">
              2 nouvelles cette semaine
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Évolution des Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={chartOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-white">Dernières Activités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">Commission reçue</p>
                    <p className="text-xs text-slate-400">Mission Client Alpha • +450,00 €</p>
                    <p className="text-[10px] text-slate-500 mt-1">Il y a 2 jours</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
              Voir tout l'historique
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}