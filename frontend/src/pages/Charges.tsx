import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Building2, FileText, LayoutDashboard, List, ChevronRight, Plus, Edit, Trash2
} from 'lucide-react';
import { fetchChargesStats, Charge, ChargeProvision, ChargesMensuellesExtended, createCharge, updateCharge, deleteCharge } from '../lib/api';
import { Button } from '@/components/ui/shadcn/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { Badge } from '@/components/ui/shadcn/badge';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/shadcn/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { cn } from '@/lib/utils';
import ReactECharts from 'echarts-for-react';

interface ChargesStats {
  chargesFixes: Charge[];
  totalChargesFixes: number;
  totalChargesFixesAnnuel: number;
  provisions: ChargeProvision[];
  totalProvision: number;
  totalChargesConsommees: number;
  reliquatGlobal: number;
  nbMois: number;
  byMonth: ChargesMensuellesExtended[];
}

const Charges: React.FC = () => {
  const [stats, setStats] = useState<ChargesStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showList, setShowList] = useState(false);

  // Edit charge state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null);
  const [chargeForm, setChargeForm] = useState({
    nom: '',
    montant_mensuel: '',
    type: 'mensuelle' as 'mensuelle' | 'ponctuelle',
    mois: '',
    annee: new Date().getFullYear().toString()
  });
  const [isSaving, setIsSaving] = useState(false);

  // Liste des mois pour le sélecteur
  const moisList = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Liste des années (année courante + 2 ans avant/après)
  const currentYear = new Date().getFullYear();
  const anneeList = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchChargesStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSheet = (charge?: Charge) => {
    if (charge) {
      setEditingCharge(charge);
      setChargeForm({
        nom: charge.nom,
        montant_mensuel: charge.montant_mensuel.toString(),
        type: charge.type || 'mensuelle',
        mois: charge.mois || '',
        annee: charge.annee?.toString() || currentYear.toString(),
      });
    } else {
      setEditingCharge(null);
      setChargeForm({
        nom: '',
        montant_mensuel: '',
        type: 'mensuelle',
        mois: '',
        annee: currentYear.toString()
      });
    }
    setSheetOpen(true);
  };

  const handleSaveCharge = async () => {
    if (!chargeForm.nom || !chargeForm.montant_mensuel) return;
    // For ponctuelle, require mois and annee
    if (chargeForm.type === 'ponctuelle' && (!chargeForm.mois || !chargeForm.annee)) return;

    setIsSaving(true);
    try {
      const montant = parseFloat(chargeForm.montant_mensuel);
      if (isNaN(montant)) return;

      // For ponctuelle charges, annual = monthly (one-time), for mensuelle, annual = monthly * 12
      const montantAnnuel = chargeForm.type === 'ponctuelle' ? montant : montant * 12;

      const chargeData = {
        nom: chargeForm.nom,
        montant_mensuel: montant,
        montant_annuel: montantAnnuel,
        type: chargeForm.type,
        ...(chargeForm.type === 'ponctuelle' && {
          mois: chargeForm.mois,
          annee: parseInt(chargeForm.annee),
        }),
      };

      if (editingCharge) {
        await updateCharge(editingCharge.id, chargeData);
      } else {
        await createCharge({
          ...chargeData,
          categorie: 'fixe',
        });
      }
      setSheetOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving charge:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCharge = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette charge ?')) return;

    try {
      await deleteCharge(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting charge:', err);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Chart options for monthly charges with reliquat
  const chartOptions = useMemo(() => {
    if (!stats) return {};

    const months = stats.byMonth.map(m => `${m.mois.substring(0, 3)} ${m.annee}`);
    const provisions = stats.byMonth.map(m => m.provision);
    const chargesFixes = stats.byMonth.map(m => m.charges_fixes);
    const reliquats = stats.byMonth.map(m => m.reliquat);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        borderColor: '#333',
        textStyle: { color: '#fff' },
        formatter: (params: any) => {
          const month = stats.byMonth.find(m => `${m.mois.substring(0, 3)} ${m.annee}` === params[0].axisValue);
          let html = `<div style="padding: 8px;"><strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((p: any) => {
            html += `<span style="color:${p.color};">●</span> ${p.seriesName}: ${formatCurrency(p.value)}<br/>`;
          });
          if (month) {
            html += `<br/><strong>Reliquat cumulé: ${formatCurrency(month.reliquat)}</strong></div>`;
          }
          return html;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: { color: '#888', rotate: 45 },
        axisLine: { lineStyle: { color: '#333' } }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Montants',
          axisLabel: {
            color: '#888',
            formatter: (val: number) => `${val}€`
          },
          splitLine: { lineStyle: { color: '#222' } }
        },
        {
          type: 'value',
          name: 'Reliquat',
          axisLabel: {
            color: '#888',
            formatter: (val: number) => `${val}€`
          },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Provision',
          type: 'bar',
          data: provisions,
          itemStyle: { color: '#22c55e' }
        },
        {
          name: 'Charges Fixes',
          type: 'bar',
          data: chargesFixes,
          itemStyle: { color: '#ef4444' }
        },
        {
          name: 'Reliquat Cumulé',
          type: 'line',
          yAxisIndex: 1,
          data: reliquats,
          smooth: true,
          itemStyle: { color: '#3b82f6' },
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0)' }
              ]
            }
          }
        }
      ]
    };
  }, [stats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-app-border border-t-app-text-muted rounded-full mb-4 mx-auto"></div>
          <p className="text-lg font-medium text-app-text-secondary">Chargement des charges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-medium text-status-error">Erreur lors du chargement des charges</p>
          <p className="text-sm text-app-text-muted mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-text-primary">Gestion des Charges</h1>
          <p className="text-app-text-muted mt-1">Suivi des dépenses fixes et provisions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowList(!showList)}
            variant="outline"
          >
            {showList ? <LayoutDashboard className="h-5 w-5 mr-2" /> : <List className="h-5 w-5 mr-2" />}
            {showList ? 'Vue globale' : 'Détails'}
          </Button>
          <Button onClick={() => handleOpenSheet()}>
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle charge
          </Button>
        </div>
      </div>

      {!showList && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Charges Fixes Mensuelles */}
            <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
              <p className="text-sm text-app-text-muted">Charges Fixes / Mois</p>
              <p className="text-2xl font-bold text-app-text-primary mt-1">
                {formatCurrency(stats.totalChargesFixes)}
              </p>
            </div>

            {/* Total Provision */}
            <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
              <p className="text-sm text-app-text-muted">Total Provisions</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {formatCurrency(stats.totalProvision)}
              </p>
              <p className="text-xs text-app-text-muted mt-2">
                {stats.provisions.length} mission{stats.provisions.length > 1 ? 's' : ''}
              </p>
            </div>

            {/* Total Charges Consommées */}
            <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-6">
              <p className="text-sm text-app-text-muted">Charges Consommées</p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {formatCurrency(stats.totalChargesConsommees)}
              </p>
              <p className="text-xs text-app-text-muted mt-2">
                Sur {stats.nbMois} mois avec provisions
              </p>
            </div>

            {/* Reliquat */}
            <div className={cn(
              "bg-app-dark/50 backdrop-blur-sm border rounded-lg shadow-lg p-6",
              stats.reliquatGlobal >= 0 ? "border-green-500/50" : "border-red-500/50"
            )}>
              <p className="text-sm text-app-text-muted">Reliquat</p>
              <p className={cn(
                "text-2xl font-bold mt-1",
                stats.reliquatGlobal >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {formatCurrency(stats.reliquatGlobal)}
              </p>
              <p className="text-xs text-app-text-muted mt-2">
                Provisions - Charges
              </p>
            </div>

            {/* Reste */}
            <div className={cn(
              "bg-app-dark/50 backdrop-blur-sm border rounded-lg shadow-lg p-6",
              (stats.totalProvision - stats.totalChargesConsommees + stats.reliquatGlobal) >= 0 ? "border-green-500/50" : "border-red-500/50"
            )}>
              <p className="text-sm text-app-text-muted">Reste</p>
              <p className={cn(
                "text-2xl font-bold mt-1",
                (stats.totalProvision - stats.totalChargesConsommees + stats.reliquatGlobal) >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {formatCurrency(stats.totalProvision - stats.totalChargesConsommees + stats.reliquatGlobal)}
              </p>
              <p className="text-xs text-app-text-muted mt-2">
                Provisions - Charges + Reliquat
              </p>
            </div>
          </div>

          {/* Monthly Chart - Full Width */}
          <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
            <div className="px-6 py-4 border-b border-app-border">
              <h3 className="text-base font-semibold text-app-text-primary">Charges par Mois</h3>
            </div>
            <div className="p-4">
              <ReactECharts option={chartOptions} style={{ height: '350px' }} />
            </div>
          </div>

          {/* Fixed Charges List */}
          <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
              <div className="px-6 py-4 border-b border-app-border flex items-center justify-between">
                <h3 className="text-base font-semibold text-app-text-primary">Charges Fixes</h3>
                <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                  {formatCurrency(stats.totalChargesFixes)}/mois
                </Badge>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {stats.chargesFixes.map((charge, index) => (
                    <div
                      key={charge.id}
                      className="flex items-center justify-between p-3 bg-app-dark/50 backdrop-blur-sm rounded-lg border border-app-border group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-app-border rounded-lg text-xs font-semibold text-app-text-secondary">
                          {index + 1}
                        </div>
                        <span className="font-medium text-app-text-primary">{charge.nom}</span>
                        {charge.type === 'ponctuelle' && (
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                            {charge.mois && charge.annee ? `${charge.mois} ${charge.annee}` : 'Ponctuelle'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-semibold text-app-text-primary">{formatCurrency(charge.montant_mensuel)}</p>
                          <p className="text-xs text-app-text-muted">{formatCurrency(charge.montant_annuel)}/an</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-app-text-muted hover:text-app-text-primary hover:bg-app-border"
                            onClick={() => handleOpenSheet(charge)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/20"
                            onClick={() => handleDeleteCharge(charge.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          {/* Provisions Section */}
          {stats.provisions.length > 0 && (
            <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
              <div className="px-6 py-4 border-b border-app-border flex items-center justify-between">
                <h3 className="text-base font-semibold text-app-text-primary">Provisions Missions</h3>
                <Button
                  onClick={() => setShowList(true)}
                  variant="link"
                  size="sm"
                  className="text-app-text-muted hover:text-app-text-secondary"
                >
                  Voir tout
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stats.provisions.slice(0, 6).map((prov) => (
                    <div
                      key={prov.mission_id}
                      className="flex items-center justify-between p-3 bg-app-dark/50 backdrop-blur-sm rounded-lg border border-app-border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-app-text-primary truncate">{prov.mission_nom}</p>
                        <p className="text-xs text-app-text-muted">{prov.client_nom} - {prov.mois} {prov.annee}</p>
                      </div>
                      <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 ml-2">
                        {formatCurrency(prov.montant)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showList && (
        <>
          {/* Fixed Charges Table */}
          <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
            <div className="px-6 py-4 border-b border-app-border">
              <h3 className="text-lg font-semibold text-app-text-primary">Charges Fixes Mensuelles</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Service</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Montant</TableHead>
                  <TableHead className="text-center">Montant Annuel</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.chargesFixes.map((charge) => (
                  <TableRow key={charge.id}>
                    <TableCell className="text-center font-medium text-app-text-primary">
                      <div className="flex items-center justify-center gap-2">
                        <Building2 className="w-4 h-4 text-app-text-muted" />
                        {charge.nom}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className={cn(
                        "text-xs",
                        charge.type === 'ponctuelle' ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                      )}>
                        {charge.type === 'ponctuelle'
                          ? (charge.mois && charge.annee ? `${charge.mois} ${charge.annee}` : 'Ponctuelle')
                          : 'Mensuelle'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold text-red-400">
                      {formatCurrency(charge.montant_mensuel)}
                    </TableCell>
                    <TableCell className="text-center text-app-text-muted">
                      {formatCurrency(charge.montant_annuel)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-app-text-muted hover:text-app-text-primary hover:bg-app-border"
                          onClick={() => handleOpenSheet(charge)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/20"
                          onClick={() => handleDeleteCharge(charge.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                <TableRow className="bg-app-border/50">
                  <TableCell className="text-center font-bold text-app-text-primary">TOTAL</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-center font-bold text-red-400">
                    {formatCurrency(stats.totalChargesFixes)}
                  </TableCell>
                  <TableCell className="text-center font-bold text-app-text-primary">
                    {formatCurrency(stats.totalChargesFixesAnnuel)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Provisions Table */}
          <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
            <div className="px-6 py-4 border-b border-app-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-app-text-primary">Provisions Missions</h3>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                Total: {formatCurrency(stats.totalProvision)}
              </Badge>
            </div>
            {stats.provisions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Mission</TableHead>
                    <TableHead className="text-center">Client</TableHead>
                    <TableHead className="text-center">Période</TableHead>
                    <TableHead className="text-center">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.provisions.map((prov) => (
                    <TableRow key={prov.mission_id}>
                      <TableCell className="text-center font-medium text-app-text-primary">
                        {prov.mission_nom}
                      </TableCell>
                      <TableCell className="text-center text-app-text-muted">
                        {prov.client_nom}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-app-text-muted">
                          <Calendar className="w-4 h-4" />
                          {prov.mois} {prov.annee}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-orange-400">
                        {formatCurrency(prov.montant)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 text-app-text-muted mx-auto mb-4" />
                <p className="text-app-text-muted">Aucune provision de charge</p>
              </div>
            )}
          </div>

          {/* Monthly Summary Table */}
          <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-app-border">
              <h3 className="text-lg font-semibold text-app-text-primary">Récapitulatif Mensuel</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Mois</TableHead>
                    <TableHead className="text-center">Provision</TableHead>
                    <TableHead className="text-center">Charges Fixes</TableHead>
                    <TableHead className="text-center">Prov. Cumulée</TableHead>
                    <TableHead className="text-center">Charges Cumulées</TableHead>
                    <TableHead className="text-center">Reliquat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.byMonth.map((month) => (
                    <TableRow key={`${month.mois}-${month.annee}`}>
                      <TableCell className="text-center font-medium text-app-text-primary">
                        {month.mois} {month.annee}
                      </TableCell>
                      <TableCell className="text-center text-green-400">
                        {formatCurrency(month.provision)}
                      </TableCell>
                      <TableCell className="text-center text-red-400">
                        {formatCurrency(month.charges_fixes)}
                      </TableCell>
                      <TableCell className="text-center text-green-400/70">
                        {formatCurrency(month.provision_cumul)}
                      </TableCell>
                      <TableCell className="text-center text-red-400/70">
                        {formatCurrency(month.charges_cumul)}
                      </TableCell>
                      <TableCell className={cn(
                        "text-center font-semibold",
                        month.reliquat >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {formatCurrency(month.reliquat)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      {/* Edit/Create Charge Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingCharge ? 'Modifier la charge' : 'Nouvelle charge'}</SheetTitle>
            <SheetDescription>
              {editingCharge ? 'Modifiez les informations de cette charge fixe' : 'Ajoutez une nouvelle charge fixe mensuelle'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom de la charge</Label>
              <Input
                id="nom"
                placeholder="Ex: Assurance, Internet..."
                value={chargeForm.nom}
                onChange={(e) => setChargeForm({ ...chargeForm, nom: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de charge</Label>
              <Select
                value={chargeForm.type}
                onValueChange={(value: 'mensuelle' | 'ponctuelle') => setChargeForm({ ...chargeForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensuelle">Mensuelle (récurrente)</SelectItem>
                  <SelectItem value="ponctuelle">Ponctuelle (unique)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mois et Année pour charges ponctuelles */}
            {chargeForm.type === 'ponctuelle' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="mois">Mois</Label>
                  <Select
                    value={chargeForm.mois}
                    onValueChange={(value) => setChargeForm({ ...chargeForm, mois: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" align="start" sideOffset={4} className="max-h-60">
                      {moisList.map((mois) => (
                        <SelectItem key={mois} value={mois}>{mois}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annee">Année</Label>
                  <Select
                    value={chargeForm.annee}
                    onValueChange={(value) => setChargeForm({ ...chargeForm, annee: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" align="start" sideOffset={4}>
                      {anneeList.map((annee) => (
                        <SelectItem key={annee} value={annee.toString()}>{annee}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="montant">
                {chargeForm.type === 'ponctuelle' ? 'Montant (€)' : 'Montant mensuel (€)'}
              </Label>
              <Input
                id="montant"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={chargeForm.montant_mensuel}
                onChange={(e) => setChargeForm({ ...chargeForm, montant_mensuel: e.target.value })}
              />
              {chargeForm.montant_mensuel && !isNaN(parseFloat(chargeForm.montant_mensuel)) && chargeForm.type === 'mensuelle' && (
                <p className="text-sm text-app-text-muted">
                  Soit {formatCurrency(parseFloat(chargeForm.montant_mensuel) * 12)} / an
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSheetOpen(false)}
              >
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveCharge}
                disabled={
                  isSaving ||
                  !chargeForm.nom ||
                  !chargeForm.montant_mensuel ||
                  (chargeForm.type === 'ponctuelle' && (!chargeForm.mois || !chargeForm.annee))
                }
              >
                {isSaving ? 'Enregistrement...' : (editingCharge ? 'Modifier' : 'Créer')}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Charges;
