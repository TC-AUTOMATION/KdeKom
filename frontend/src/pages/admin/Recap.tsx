import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchRecap } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Download, Printer, TrendingUp, TrendingDown } from 'lucide-react';

export default function AdminRecap() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Default to current month if not specified
  const currentMonth = new Date().toISOString().slice(0, 7);
  const selectedMonth = searchParams.get('month') || currentMonth;

  useEffect(() => {
    loadRecap(selectedMonth);
  }, [selectedMonth]);

  async function loadRecap(month: string) {
    setLoading(true);
    try {
      const result = await fetchRecap(month);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleMonthChange(value: string) {
    setSearchParams({ month: value });
  }

  // Generate last 12 months for select
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7);
  });

  if (loading && !data) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Récapitulatif Financier</h2>
          <p className="text-slate-500 mt-1">Consolidation mensuelle et répartition.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Sélectionner un mois" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4 text-slate-500" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {data && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top KPIs */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-blue-600 text-white border-none shadow-lg shadow-blue-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-100 text-sm font-medium">CA Total Facturé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(data.caTotal)}</div>
                <div className="mt-2 text-xs text-blue-200 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Objectif mensuel atteint à 85%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-500 text-sm font-medium">CA Encaissé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{formatCurrency(data.caPaye)}</div>
                <div className="mt-2 text-xs text-slate-500">
                  Taux de recouvrement: {data.caTotal > 0 ? Math.round((data.caPaye / data.caTotal) * 100) : 0}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-600 text-sm font-medium">Reliquat Net</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-700">{formatCurrency(data.reliquatTotal)}</div>
                <div className="mt-2 text-xs text-emerald-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Marge nette conservée
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Table */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle>Répartition par Bénéficiaire</CardTitle>
              <CardDescription>Détail des commissions et rétributions pour {selectedMonth}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-medium">Bénéficiaire</th>
                      <th className="px-6 py-3 font-medium text-right">Montant</th>
                      <th className="px-6 py-3 font-medium text-right">% du CA Total</th>
                      <th className="px-6 py-3 font-medium text-center">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.personTotals && Object.entries(data.personTotals).map(([name, amount]: [string, any]) => (
                      <tr key={name} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{name}</td>
                        <td className="px-6 py-4 text-right font-mono text-slate-700">{formatCurrency(amount)}</td>
                        <td className="px-6 py-4 text-right text-slate-500">
                          {data.caTotal > 0 ? ((amount / data.caTotal) * 100).toFixed(1) : 0}%
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            Calculé
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.personTotals && Object.keys(data.personTotals).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">
                          Aucune répartition pour ce mois.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 font-semibold text-slate-900 border-t border-slate-200">
                    <tr>
                      <td className="px-6 py-4">Total Distribué</td>
                      <td className="px-6 py-4 text-right font-mono">
                        {formatCurrency(Object.values(data.personTotals).reduce((a: any, b: any) => a + b, 0) as number)}
                      </td>
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}