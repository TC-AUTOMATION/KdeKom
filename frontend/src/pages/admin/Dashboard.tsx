import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { fetchMissions } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Download,
  Plus,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminDashboard() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMissions().then(data => {
      setMissions(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  // Calculate KPIs from exact Excel data
  const totalBilled = missions.reduce((sum, m) => sum + Number(m.amount_billed || 0), 0);
  const totalPaid = missions.reduce((sum, m) => sum + Number(m.paid_amount || 0), 0);
  const totalRevenue = missions.reduce((sum, m) => sum + Number(m.revenue || 0), 0);
  const totalReliquat = missions.reduce((sum, m) => sum + Number(m.reliquat || 0), 0);

  const paidPercentage = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;
  const reliquatPercentage = totalBilled > 0 ? Math.round((totalReliquat / totalBilled) * 100) : 0;

  // Prepare Chart Data (Monthly Revenue) - exact Excel data
  const monthlyData = missions.reduce((acc: any, m) => {
    const month = m.month;
    if (!acc[month]) {
      acc[month] = { total: 0, paid: 0, revenue: 0 };
    }
    acc[month].total += Number(m.amount_billed || 0);
    acc[month].paid += Number(m.paid_amount || 0);
    acc[month].revenue += Number(m.revenue || 0);
    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlyData).sort();

  const chartOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#1e293b' },
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    legend: {
      data: ['CA Total', 'CA Payé'],
      bottom: 0,
      textStyle: { color: '#64748b' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sortedMonths,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b' },
      boundaryGap: true
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
      axisLabel: {
        color: '#64748b',
        formatter: (value: number) => `${(value / 1000).toFixed(0)}k`
      }
    },
    series: [
      {
        name: 'CA Total',
        data: sortedMonths.map(k => monthlyData[k].total),
        type: 'bar',
        itemStyle: {
          color: '#60a5fa',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '35%'
      },
      {
        name: 'CA Payé',
        data: sortedMonths.map(k => monthlyData[k].paid),
        type: 'bar',
        itemStyle: {
          color: '#3b82f6',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '35%'
      }
    ]
  };

  // Mock consultant performance data
  const consultantPerformance = [
    { name: 'Fred Dubois', caTotal: 430000, caPaid: 335000, caReliquat: 65000, status: 'Reliquat' },
    { name: 'Eric Martin', caTotal: 295000, caPaid: 295000, caReliquat: 30000, status: 'Reliquat' },
    { name: 'Sarah Connor', caTotal: 100000, caPaid: 135000, caReliquat: 20000, status: 'Requis' },
    { name: 'Fred Dubois', caTotal: 75000, caPaid: 75000, caReliquat: 0, status: 'Reliquat' },
    { name: 'Eric Martin', caTotal: 35000, caPaid: 25000, caReliquat: 20000, status: 'Requis' },
  ];

  // Pie chart for Income Breakdown
  const pieChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}€ ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: { color: '#64748b' }
    },
    series: [
      {
        name: 'Répartition',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 63, name: 'Fred (63%)', itemStyle: { color: '#3b82f6' } },
          { value: 35, name: 'Eric (35%)', itemStyle: { color: '#60a5fa' } }
        ]
      }
    ]
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Aperçu Financier - Décembre 2023</h2>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Unité Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une Mission
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  CA Total
                </CardTitle>
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(totalBilled)}
              </div>
              <div className="flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 text-emerald-600 mr-1" />
                <span className="text-emerald-600 font-medium">+15%</span>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Target €25,000</span>
                <span>85%</span>
              </div>
              <Progress value={paidPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  CA Payé
                </CardTitle>
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(totalPaid)}
              </div>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground">Paid Revenue</span>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fred: €25,000, Eric: €30,000</span>
                <span>84%</span>
              </div>
              <Progress value={reliquatPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Reliquat Total
                </CardTitle>
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(totalReliquat)}
              </div>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground">Fred: €25,000, Eric: €30,000</span>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Évolution Mensuelle</CardTitle>
                <CardDescription className="text-xs">Jan-Dec 2023</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Exporter en PDF</DropdownMenuItem>
                  <DropdownMenuItem>Exporter en CSV</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <ReactECharts option={chartOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Répartition des Revenus par Consultant</CardTitle>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ReactECharts option={pieChartOption} style={{ height: '280px' }} />
          </CardContent>
        </Card>
      </div>

      {/* Consultant Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance des Consultants</CardTitle>
              <CardDescription>Détail des revenus par consultant</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Générer le Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    CA Total
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    CA Payé
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    CA Reliquat
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {consultantPerformance.map((consultant, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{consultant.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(consultant.caTotal)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {formatCurrency(consultant.caPaid)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {formatCurrency(consultant.caReliquat)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={consultant.status === 'Reliquat' ? 'default' : 'secondary'}
                        className={consultant.status === 'Reliquat' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}
                      >
                        {consultant.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        Voir Détails
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
