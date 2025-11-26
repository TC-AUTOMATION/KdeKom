import { useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { fetchDashboardStats, fetchMissions, fetchCharges, Charge } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useFilters } from '@/contexts/FilterContext';
import { Badge } from '@/components/ui/shadcn/badge';
import { Checkbox } from '@/components/ui/shadcn/checkbox';
import { Label } from '@/components/ui/shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shadcn/table';
import {
  Users,
  Briefcase,
  Euro,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
} from 'lucide-react';

interface DashboardStats {
  totals: {
    ca_total: number;
    total_subvention: number;
    total_client: number;
    total_encaisse: number;
    total_en_attente: number;
    total_commissions: number;
    total_reliquat: number;
    nb_missions: number;
    nb_missions_payees: number;
    nb_missions_impayees: number;
    nb_clients: number;
    nb_apporteurs: number;
    taux_paiement: number;
  };
  byMonth: Array<{
    mois: string;
    ca: number;
    subvention: number;
    client: number;
    encaisse: number;
    en_attente: number;
    commissions: number;
    commissions_apporteurs: number;
    commissions_collaborateurs: number;
    commissions_par_collaborateur: Record<string, number>;
    commissions_par_apporteur: Record<string, number>;
    missions: number;
  }>;
  topClients: Array<{ nom: string; ca: number }>;
  byCollaborateur: Array<{ nom: string; total: number }>;
}

interface TreasuryMonth {
  mois: string;
  label: string;
  subvention: number;
  client: number;
  encaissements: number;
  enAttente: number;
  totalRevenus: number;
  commissions: number;
  commissionsApporteurs: number;
  commissionsCollaborateurs: number;
  commissionsParCollaborateur: Record<string, number>;
  commissionsParApporteur: Record<string, number>;
  chargesFixes: number;
  totalDecaissements: number;
  solde: number;
  soldeCumule: number;
}

// Format month: "2024-01" -> "Jan. 24"
const formatMonthLabel = (moisKey: string) => {
  const [year, month] = moisKey.split('-');
  const moisCourt = ['Jan.', 'Fév.', 'Mar.', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sep.', 'Oct.', 'Nov.', 'Déc.'];
  return `${moisCourt[parseInt(month) - 1]} ${year.slice(2)}`;
};

// Mois names for filtering
const moisNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function Dashboard() {
  const { selectedYear, selectedMonth, selectedClient } = useFilters();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [unpaidMissions, setUnpaidMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [treasuryData, setTreasuryData] = useState<TreasuryMonth[]>([]);
  const [chargesFixes, setChargesFixes] = useState<Charge[]>([]);
  const [totalChargesFixes, setTotalChargesFixes] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Display toggles
  const [showEncaissements, setShowEncaissements] = useState(true);
  const [showCommissions, setShowCommissions] = useState(true);
  const [showSolde, setShowSolde] = useState(true);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isRevenusExpanded, setIsRevenusExpanded] = useState(false);
  const [isChargesExpanded, setIsChargesExpanded] = useState(false);
  const [isCollabExpanded, setIsCollabExpanded] = useState(false);
  const [isApporteursExpanded, setIsApporteursExpanded] = useState(false);
  const [clientChartMode, setClientChartMode] = useState<'ca' | 'missions'>('ca');
  const [clientsData, setClientsData] = useState<Array<{ nom: string; ca: number; missions: number }>>([]);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardStats, allMissions, charges] = await Promise.all([
          fetchDashboardStats(),
          fetchMissions(),
          fetchCharges()
        ]);

        const chargesFixesTotal = charges.reduce((sum, c) => sum + c.montant_mensuel, 0);
        setChargesFixes(charges);
        setTotalChargesFixes(chargesFixesTotal);

        // Filter missions by selected year, month, and client
        const filteredMissions = allMissions.filter((m: any) => {
          if (m.annee !== selectedYear) return false;
          if (selectedMonth !== null) {
            if (m.mois !== moisNames[selectedMonth]) return false;
          }
          if (selectedClient) {
            if (m.client !== selectedClient) return false;
          }
          return true;
        });
        setMissions(filteredMissions);

        // Get the proper client name from filtered missions
        if (selectedClient && filteredMissions.length > 0) {
          setSelectedClientName(filteredMissions[0].client_nom || selectedClient);
        } else {
          setSelectedClientName(null);
        }

        // Get unpaid missions (filtered)
        const unpaid = filteredMissions
          .filter((m: any) => !m.is_paid)
          .sort((a: any, b: any) => (b.ca_genere || 0) - (a.ca_genere || 0))
          .slice(0, 10);
        setUnpaidMissions(unpaid);

        // Recalculate totals based on filtered data
        const filteredTotals = {
          ...dashboardStats.totals,
          ca_total: filteredMissions.reduce((sum: number, m: any) => sum + (m.ca_genere || 0), 0),
          total_subvention: filteredMissions.reduce((sum: number, m: any) => sum + (m.montant_sub || 0), 0),
          total_client: filteredMissions.reduce((sum: number, m: any) => sum + (m.montant_client || 0), 0),
          total_encaisse: filteredMissions.reduce((sum: number, m: any) => sum + (m.montant_sub || 0) + (m.montant_client || 0), 0),
          total_en_attente: filteredMissions
            .filter((m: any) => (m.montant_client || 0) === 0)
            .reduce((sum: number, m: any) => sum + ((m.ca_genere || 0) * (m.pct_client || 0) / 100), 0),
          nb_missions: filteredMissions.length,
          nb_missions_payees: filteredMissions.filter((m: any) => (m.montant_client || 0) > 0).length,
          nb_missions_impayees: filteredMissions.filter((m: any) => (m.montant_client || 0) === 0).length,
        };

        // Recalculate byMonth from filtered missions
        const moisOrder: Record<string, number> = {
          'Janvier': 1, 'Février': 2, 'Mars': 3, 'Avril': 4, 'Mai': 5, 'Juin': 6,
          'Juillet': 7, 'Août': 8, 'Septembre': 9, 'Octobre': 10, 'Novembre': 11, 'Décembre': 12
        };

        // Initialize all 12 months for the selected year
        const byMonthMap: Record<string, any> = {};
        for (let i = 1; i <= 12; i++) {
          const key = `${selectedYear}-${String(i).padStart(2, '0')}`;
          byMonthMap[key] = {
            mois: key,
            ca: 0,
            subvention: 0,
            client: 0,
            encaisse: 0,
            en_attente: 0,
            commissions: 0,
            commissions_apporteurs: 0,
            commissions_collaborateurs: 0,
            commissions_par_collaborateur: {} as Record<string, number>,
            commissions_par_apporteur: {} as Record<string, number>,
            missions: 0
          };
        }

        filteredMissions.forEach((m: any) => {
          const key = `${m.annee}-${String(moisOrder[m.mois] || 0).padStart(2, '0')}`;
          if (!byMonthMap[key]) {
            byMonthMap[key] = {
              mois: key,
              ca: 0,
              subvention: 0,
              client: 0,
              encaisse: 0,
              en_attente: 0,
              commissions: 0,
              commissions_apporteurs: 0,
              commissions_collaborateurs: 0,
              commissions_par_collaborateur: {} as Record<string, number>,
              commissions_par_apporteur: {} as Record<string, number>,
              missions: 0
            };
          }
          const data = byMonthMap[key];
          data.ca += m.ca_genere || 0;
          data.subvention += m.montant_sub || 0;
          data.client += m.montant_client || 0;
          data.encaisse += (m.montant_sub || 0) + (m.montant_client || 0);
          if ((m.montant_client || 0) === 0) {
            data.en_attente += (m.ca_genere || 0) * (m.pct_client || 0) / 100;
          }
          // Commissions collaborateurs
          let partCollab = 0;
          (m.parts_collaborateurs || []).forEach((p: any) => {
            const montant = p.montant || 0;
            partCollab += montant;
            // Get collaborateur name from the original data
            const collabName = p.collaborateur;
            data.commissions_par_collaborateur[collabName] = (data.commissions_par_collaborateur[collabName] || 0) + montant;
          });
          data.commissions_collaborateurs += partCollab;
          // Commission apporteur
          const partApporteur = m.commission_apporteur || 0;
          if (partApporteur > 0 && m.apporteur) {
            data.commissions_par_apporteur[m.apporteur_nom || m.apporteur] = (data.commissions_par_apporteur[m.apporteur_nom || m.apporteur] || 0) + partApporteur;
          }
          data.commissions_apporteurs += partApporteur;
          data.commissions += partCollab + partApporteur;
          data.missions += 1;
        });

        const recalculatedByMonth = Object.values(byMonthMap).sort((a: any, b: any) => a.mois.localeCompare(b.mois));

        setStats({
          ...dashboardStats,
          totals: filteredTotals,
          byMonth: recalculatedByMonth
        });

        // Build treasury data from recalculated byMonth
        let cumul = 0;
        const treasury: TreasuryMonth[] = recalculatedByMonth.map((m: any) => {
          const subvention = m.subvention || 0;
          const client = m.client || 0;
          const encaissements = m.encaisse || (subvention + client);
          const enAttente = m.en_attente || 0;
          const totalRevenus = subvention + client + enAttente;
          const commissions = m.commissions || 0;
          const commissionsApporteurs = m.commissions_apporteurs || 0;
          const commissionsCollaborateurs = m.commissions_collaborateurs || 0;
          const totalDecaissements = commissions + chargesFixesTotal;

          const solde = encaissements - totalDecaissements;
          cumul += solde;

          return {
            mois: m.mois,
            label: formatMonthLabel(m.mois),
            subvention,
            client,
            encaissements,
            enAttente,
            totalRevenus,
            commissions,
            commissionsApporteurs,
            commissionsCollaborateurs,
            commissionsParCollaborateur: m.commissions_par_collaborateur || {},
            commissionsParApporteur: m.commissions_par_apporteur || {},
            chargesFixes: chargesFixesTotal,
            totalDecaissements,
            solde,
            soldeCumule: cumul,
          };
        });
        setTreasuryData(treasury);

        // Calculate client data (CA + missions count) from filtered missions
        const clientMap: Record<string, { nom: string; ca: number; missions: number }> = {};
        filteredMissions.forEach((m: any) => {
          const clientNom = m.client_nom || m.client;
          if (!clientMap[clientNom]) {
            clientMap[clientNom] = { nom: clientNom, ca: 0, missions: 0 };
          }
          clientMap[clientNom].ca += m.ca_genere || 0;
          clientMap[clientNom].missions += 1;
        });
        const sortedClientsData = Object.values(clientMap)
          .sort((a, b) => b.ca - a.ca);
        setClientsData(sortedClientsData);

      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedYear, selectedMonth, selectedClient]);

  // Drag scroll for treasury table
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-app-border border-t-app-text-muted rounded-full mb-4 mx-auto"></div>
          <p className="text-lg font-medium text-app-text-secondary">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  const { totals, byMonth, topClients, byCollaborateur } = stats;

  // Treasury chart with Subvention + Client breakdown
  const treasuryChartOption = {
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: 'rgba(10, 10, 10, 0.95)',
      borderColor: '#2c2c2c',
      borderWidth: 1,
      textStyle: { color: '#ffffff' },
      formatter: (params: any) => {
        let result = `<div style="font-weight:600;margin-bottom:8px">${params[0].axisValue}</div>`;
        params.forEach((p: any) => {
          const color = p.color;
          result += `<div style="display:flex;justify-content:space-between;gap:20px;padding:2px 0">
            <span style="color:${color}">${p.seriesName}</span>
            <span style="font-weight:600">${formatCurrency(p.value)}</span>
          </div>`;
        });
        return result;
      }
    },
    legend: {
      show: false
    },
    grid: {
      left: '0%',
      right: '0%',
      bottom: '0%',
      top: '10%',
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: treasuryData.map(d => d.label),
      show: false
    },
    yAxis: [
      { type: 'value', show: false },
      { type: 'value', show: false }
    ],
    series: [
      ...(showEncaissements ? [
        {
          name: 'Subvention',
          type: 'bar',
          stack: 'revenue',
          data: treasuryData.map(d => ({
            value: d.subvention,
            itemStyle: {
              borderRadius: d.client === 0 && d.enAttente === 0 ? [4, 4, 0, 0] : [0, 0, 0, 0]
            }
          })),
          itemStyle: { color: '#60a5fa' },
          barWidth: '25%'
        },
        {
          name: 'Client',
          type: 'bar',
          stack: 'revenue',
          data: treasuryData.map(d => ({
            value: d.client,
            itemStyle: {
              borderRadius: d.enAttente === 0 ? [4, 4, 0, 0] : [0, 0, 0, 0]
            }
          })),
          itemStyle: { color: '#10b981' },
          barWidth: '25%'
        },
        {
          name: 'En attente',
          type: 'bar',
          stack: 'revenue',
          data: treasuryData.map(d => d.enAttente),
          itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] },
          barWidth: '25%'
        }
      ] : []),
      ...(showCommissions ? [{
        name: 'Décaissements',
        type: 'bar',
        data: treasuryData.map(d => d.totalDecaissements),
        itemStyle: { color: '#f87171', borderRadius: [4, 4, 0, 0] },
        barWidth: '25%'
      }] : []),
      ...(showSolde ? [{
        name: 'Solde cumulé',
        type: 'line',
        yAxisIndex: 1,
        data: treasuryData.map(d => d.soldeCumule),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#a855f7', width: 3 },
        itemStyle: {
          color: (params: any) => treasuryData[params.dataIndex]?.soldeCumule >= 0 ? '#10b981' : '#ef4444'
        }
      }] : [])
    ]
  };

  // Prepare chart data based on whether a client is selected or not
  const chartColors = ['#60a5fa', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#8b5cf6'];

  const missionChartData = selectedClient
    ? missions
        .sort((a, b) => (b.ca_genere || 0) - (a.ca_genere || 0))
        .map((m, idx) => ({
          name: m.nom_mission || `Mission ${m.id}`,
          value: m.ca_genere || 0,
          mois: m.mois,
          annee: m.annee,
          itemStyle: { color: chartColors[idx % chartColors.length] }
        }))
    : clientsData.map((item, idx) => ({
        name: item.nom,
        value: clientChartMode === 'ca' ? item.ca : item.missions,
        missions: item.missions,
        ca: item.ca,
        itemStyle: { color: chartColors[idx % chartColors.length] }
      }));

  const clientPieChartOption = {
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: 'rgba(10, 10, 10, 0.95)',
      borderColor: '#2c2c2c',
      borderWidth: 1,
      textStyle: { color: '#ffffff' },
      formatter: (params: any) => {
        if (selectedClient) {
          const mission = missions.find(m => (m.nom_mission || `Mission ${m.id}`) === params.name);
          return `${params.name}<br/>${formatCurrency(params.value)} (${params.percent}%)<br/>${mission?.mois} ${mission?.annee}`;
        }
        const client = clientsData.find(c => c.nom === params.name);
        if (clientChartMode === 'ca') {
          return `${params.name}: ${formatCurrency(params.value)} (${params.percent}%)<br/>${client?.missions || 0} mission${(client?.missions || 0) > 1 ? 's' : ''}`;
        }
        return `${params.name}: ${params.value} mission${params.value > 1 ? 's' : ''} (${params.percent}%)<br/>${formatCurrency(client?.ca || 0)}`;
      }
    },
    legend: { show: false },
    series: [{
      name: selectedClient ? 'CA par Mission' : (clientChartMode === 'ca' ? 'CA par Client' : 'Missions par Client'),
      type: 'pie',
      radius: ['20%', '70%'],
      center: ['50%', '50%'],
      roseType: 'area',
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#0a0a0a', borderWidth: 2 },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}',
        color: '#909095',
        fontSize: 11,
        distanceToLabelLine: 5
      },
      labelLine: {
        show: true,
        length: 10,
        length2: 15,
        lineStyle: { color: '#404040' }
      },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 'bold', color: '#ffffff' },
        itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0, 0, 0, 0.5)' }
      },
      data: missionChartData
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-app-text-primary">Tableau de bord</h1>
        <p className="text-app-text-muted mt-1">Vue d'ensemble des missions et performances KDECOM</p>
      </div>

      {/* Treasury Plan */}
      <div className="rounded-lg bg-app-dark/50 backdrop-blur-sm shadow-lg border border-app-border overflow-hidden">
        <div className="px-6 py-4 bg-app-dark/80 border-b border-app-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-app-text-primary">
            Suivi de trésorerie
            {selectedMonth !== null && treasuryData[0] && (
              <span className="ml-2 text-app-text-muted font-normal">— {moisNames[selectedMonth]} {selectedYear}</span>
            )}
          </h3>
          {selectedMonth === null && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Checkbox id="showEnc" checked={showEncaissements} onCheckedChange={(v) => setShowEncaissements(!!v)} />
                <Label htmlFor="showEnc" className="text-status-success cursor-pointer">Encaissements</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="showComm" checked={showCommissions} onCheckedChange={(v) => setShowCommissions(!!v)} />
                <Label htmlFor="showComm" className="text-status-error cursor-pointer">Décaissements</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="showSolde" checked={showSolde} onCheckedChange={(v) => setShowSolde(!!v)} />
                <Label htmlFor="showSolde" className="text-purple-400 cursor-pointer">Solde cumulé</Label>
              </div>
            </div>
          )}
        </div>

        {/* Vue mensuelle (un seul mois sélectionné) */}
        {selectedMonth !== null && treasuryData.length > 0 ? (
          <div className="p-6">
            {/* KPIs en grille */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg bg-gradient-to-br from-app-border/10 to-app-border/5 p-4 border border-app-border">
                <div className="flex items-center gap-3">
                  <Euro className="h-5 w-5 text-app-text-muted" />
                  <div>
                    <p className="text-xs text-app-text-muted uppercase">CA Généré</p>
                    <p className="text-xl font-bold text-app-text-primary">{formatCurrency(totals.ca_total)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-app-text-muted uppercase">Subventions</p>
                    <p className="text-xl font-bold text-blue-400">{formatCurrency(totals.total_subvention)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-status-success/10 to-status-success/5 p-4 border border-status-success/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-status-success" />
                  <div>
                    <p className="text-xs text-app-text-muted uppercase">CA Payé (Client)</p>
                    <p className="text-xl font-bold text-status-success">{formatCurrency(totals.total_client)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-status-warning/10 to-status-warning/5 p-4 border border-status-warning/20">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-status-warning" />
                  <div>
                    <p className="text-xs text-app-text-muted uppercase">En attente</p>
                    <p className="text-xl font-bold text-status-warning">{formatCurrency(totals.total_en_attente)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails Encaissements & Décaissements côte à côte */}
            <div className="grid grid-cols-2 gap-6">
              {/* Encaissements */}
              <div className="rounded-lg border border-status-success/30 overflow-hidden">
                <div className="bg-status-success/10 px-4 py-3 border-b border-status-success/30">
                  <h4 className="font-semibold text-status-success">Encaissements</h4>
                  <p className="text-2xl font-bold text-status-success">{formatCurrency(treasuryData[0].totalRevenus)}</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-400">Subventions</span>
                    <span className="text-sm font-medium text-blue-400">{formatCurrency(treasuryData[0].subvention)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-status-success">Part Client</span>
                    <span className="text-sm font-medium text-status-success">{formatCurrency(treasuryData[0].client)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-status-warning">En attente</span>
                    <span className="text-sm font-medium text-status-warning">{formatCurrency(treasuryData[0].enAttente)}</span>
                  </div>
                </div>
              </div>

              {/* Décaissements */}
              <div className="rounded-lg border border-status-error/30 overflow-hidden">
                <div className="bg-status-error/10 px-4 py-3 border-b border-status-error/30">
                  <h4 className="font-semibold text-status-error">Décaissements</h4>
                  <p className="text-2xl font-bold text-status-error">{formatCurrency(treasuryData[0].totalDecaissements)}</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-app-text-secondary">Collaborateurs</span>
                    <span className="text-sm font-medium text-app-text-secondary">{formatCurrency(treasuryData[0].commissionsCollaborateurs)}</span>
                  </div>
                  {Object.entries(treasuryData[0].commissionsParCollaborateur).map(([nom, montant]) => (
                    <div key={nom} className="flex justify-between items-center pl-4 border-l-2 border-status-error/20">
                      <span className="text-xs text-app-text-muted">{nom}</span>
                      <span className="text-xs text-app-text-muted">{formatCurrency(montant as number)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-app-text-secondary">Apporteurs d'affaires</span>
                    <span className="text-sm font-medium text-app-text-secondary">{formatCurrency(treasuryData[0].commissionsApporteurs)}</span>
                  </div>
                  {Object.entries(treasuryData[0].commissionsParApporteur).map(([nom, montant]) => (
                    <div key={nom} className="flex justify-between items-center pl-4 border-l-2 border-status-error/20">
                      <span className="text-xs text-app-text-muted">{nom}</span>
                      <span className="text-xs text-app-text-muted">{formatCurrency(montant as number)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-app-text-secondary">Charges fixes</span>
                    <span className="text-sm font-medium text-app-text-secondary">{formatCurrency(treasuryData[0].chargesFixes)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Solde du mois */}
            <div className="mt-6 rounded-lg border border-app-border p-4 flex justify-between items-center">
              <span className="text-lg font-semibold text-app-text-primary">Solde du mois</span>
              <span className={`text-2xl font-bold ${treasuryData[0].solde >= 0 ? 'text-status-success' : 'text-status-error'}`}>
                {formatCurrency(treasuryData[0].solde)}
              </span>
            </div>
          </div>
        ) : (
          /* Vue annuelle (tableau) */
          <div
            ref={scrollRef}
            className="overflow-x-auto cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onDragStart={(e) => e.preventDefault()}
            draggable={false}
          >
            <div style={{ minWidth: `${200 + treasuryData.length * 100}px` }}>
              {/* Chart + KPIs */}
              <div className="flex">
                {/* KPIs */}
                <div style={{ width: '200px', flexShrink: 0 }} className="px-4 py-4 space-y-2">
                  <div className="rounded-md bg-gradient-to-br from-status-success/10 to-status-success/5 p-2 border border-status-success/20">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-status-success" />
                      <div>
                        <p className="text-[10px] text-app-text-muted uppercase">Encaissements</p>
                        <p className="text-sm font-bold text-status-success">{formatCurrency(totals.total_subvention + totals.total_client)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md bg-gradient-to-br from-status-error/10 to-status-error/5 p-2 border border-status-error/20">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-status-error" />
                      <div>
                        <p className="text-[10px] text-app-text-muted uppercase">Décaissements</p>
                        <p className="text-sm font-bold text-status-error">{formatCurrency(treasuryData.reduce((sum, d) => sum + d.totalDecaissements, 0))}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div style={{ flex: 1 }}>
                  <ReactECharts option={treasuryChartOption} style={{ height: '200px' }} notMerge={true} />
                </div>
              </div>

            {/* Table */}
            <table className="w-full text-sm select-none" style={{ tableLayout: 'fixed' }} draggable={false} onDragStart={(e) => e.preventDefault()}>
              <thead className="bg-app-dark border-b border-app-border">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-app-text-muted uppercase sticky left-0 bg-app-dark z-10" style={{ width: '200px' }}>
                    Catégories
                  </th>
                  {treasuryData.map((d, i) => (
                    <th key={i} className="py-3 text-center text-xs font-semibold text-app-text-secondary" style={{ width: '100px' }}>
                      <div className="font-bold">{d.label.split(' ')[0]}</div>
                      <div className="text-[10px] text-app-text-muted font-normal">{d.label.split(' ')[1]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Encaissements (expandable) - ligne parent d'abord */}
                <tr
                  className="bg-status-success/10 border-b border-app-border cursor-pointer hover:bg-status-success/15 transition-colors"
                  onClick={() => setIsRevenusExpanded(!isRevenusExpanded)}
                >
                  <td className="py-2.5 px-4 sticky left-0 bg-app-dark z-10">
                    <div className="flex items-center gap-2">
                      <ChevronDown className={`w-4 h-4 text-status-success transition-transform ${isRevenusExpanded ? 'rotate-180' : 'rotate-0'}`} />
                      <span className="text-sm font-semibold text-status-success">Encaissements</span>
                    </div>
                  </td>
                  {treasuryData.map((d, i) => (
                    <td key={i} className="py-2.5 text-center text-sm font-medium text-status-success">
                      {formatCurrency(d.totalRevenus)}
                    </td>
                  ))}
                </tr>

                {/* Détails Revenus (en-dessous du parent) */}
                {isRevenusExpanded && (
                  <>
                    {/* Subventions */}
                    <tr className="border-b border-app-border bg-status-success/5">
                      <td className="py-2 px-4 sticky left-0 bg-app-dark z-10">
                        <div className="flex items-center ml-6 pl-3 border-l-2 border-status-success/40">
                          <span className="text-sm text-blue-400">Subventions</span>
                        </div>
                      </td>
                      {treasuryData.map((d, i) => (
                        <td key={i} className="py-2 text-center text-sm text-blue-400">
                          {formatCurrency(d.subvention)}
                        </td>
                      ))}
                    </tr>

                    {/* Part Client */}
                    <tr className="border-b border-app-border bg-status-success/5">
                      <td className="py-2 px-4 sticky left-0 bg-app-dark z-10">
                        <div className="flex items-center ml-6 pl-3 border-l-2 border-status-success/40">
                          <span className="text-sm text-status-success">Part Client</span>
                        </div>
                      </td>
                      {treasuryData.map((d, i) => (
                        <td key={i} className="py-2 text-center text-sm text-status-success">
                          {formatCurrency(d.client)}
                        </td>
                      ))}
                    </tr>

                    {/* En attente */}
                    <tr className="border-b border-app-border bg-status-success/5">
                      <td className="py-2 px-4 sticky left-0 bg-app-dark z-10">
                        <div className="flex items-center ml-6 pl-3 border-l-2 border-status-success/40">
                          <span className="text-sm text-status-warning">En attente</span>
                        </div>
                      </td>
                      {treasuryData.map((d, i) => (
                        <td key={i} className="py-2 text-center text-sm text-status-warning">
                          {formatCurrency(d.enAttente)}
                        </td>
                      ))}
                    </tr>
                  </>
                )}

                {/* Décaissements (expandable) - ligne parent d'abord */}
                <tr
                  className="bg-status-error/5 border-b border-app-border cursor-pointer hover:bg-status-error/10 transition-colors"
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                >
                  <td className="py-2.5 px-4 sticky left-0 bg-app-dark z-10">
                    <div className="flex items-center gap-2">
                      <ChevronDown className={`w-4 h-4 text-status-error transition-transform ${isDetailsExpanded ? 'rotate-180' : 'rotate-0'}`} />
                      <span className="text-sm font-semibold text-status-error">Décaissements</span>
                    </div>
                  </td>
                  {treasuryData.map((d, i) => (
                    <td key={i} className="py-2.5 text-center text-sm font-medium text-status-error">
                      {formatCurrency(d.totalDecaissements)}
                    </td>
                  ))}
                </tr>

                {/* Détails Décaissements (en-dessous du parent) */}
                {isDetailsExpanded && (
                  <>
                    {/* Collaborateurs (déroulant) */}
                    <tr
                      className="border-b border-app-border cursor-pointer hover:bg-status-error/5 transition-colors bg-status-error/[0.02]"
                      onClick={(e) => { e.stopPropagation(); setIsCollabExpanded(!isCollabExpanded); }}
                    >
                      <td className="py-2 px-4 sticky left-0 bg-app-dark z-10">
                        <div className="flex items-center ml-6 pl-3 border-l-2 border-status-error/40">
                          <ChevronDown className={`w-3 h-3 text-app-text-secondary mr-2 transition-transform ${isCollabExpanded ? 'rotate-180' : 'rotate-0'}`} />
                          <span className="text-sm text-app-text-secondary">Collaborateurs</span>
                        </div>
                      </td>
                      {treasuryData.map((d, i) => (
                        <td key={i} className="py-2 text-center text-sm text-app-text-secondary">
                          {formatCurrency(d.commissionsCollaborateurs)}
                        </td>
                      ))}
                    </tr>

                    {/* Détails Collaborateurs (en-dessous) */}
                    {isCollabExpanded && Object.keys(treasuryData[0]?.commissionsParCollaborateur || {}).map((collabNom) => (
                      <tr key={collabNom} className="border-b border-app-border bg-status-error/[0.02]">
                        <td className="py-1.5 px-4 sticky left-0 bg-app-dark z-10">
                          <div className="flex items-center ml-10 pl-3 border-l-2 border-status-error/30">
                            <span className="text-xs text-app-text-muted">{collabNom}</span>
                          </div>
                        </td>
                        {treasuryData.map((d, i) => (
                          <td key={i} className="py-1.5 text-center text-xs text-app-text-muted">
                            {formatCurrency(d.commissionsParCollaborateur[collabNom] || 0)}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Apporteurs d'affaires (déroulant) */}
                    <tr
                      className="border-b border-app-border cursor-pointer hover:bg-status-error/5 transition-colors bg-status-error/[0.02]"
                      onClick={(e) => { e.stopPropagation(); setIsApporteursExpanded(!isApporteursExpanded); }}
                    >
                      <td className="py-2 px-4 sticky left-0 bg-app-dark z-10">
                        <div className="flex items-center ml-6 pl-3 border-l-2 border-status-error/40">
                          <ChevronDown className={`w-3 h-3 text-app-text-secondary mr-2 transition-transform ${isApporteursExpanded ? 'rotate-180' : 'rotate-0'}`} />
                          <span className="text-sm text-app-text-secondary">Apporteurs d'affaires</span>
                        </div>
                      </td>
                      {treasuryData.map((d, i) => (
                        <td key={i} className="py-2 text-center text-sm text-app-text-secondary">
                          {formatCurrency(d.commissionsApporteurs)}
                        </td>
                      ))}
                    </tr>

                    {/* Détails Apporteurs (en-dessous) */}
                    {isApporteursExpanded && Object.keys(treasuryData[0]?.commissionsParApporteur || {}).map((apporteurNom) => (
                      <tr key={apporteurNom} className="border-b border-app-border bg-status-error/[0.02]">
                        <td className="py-1.5 px-4 sticky left-0 bg-app-dark z-10">
                          <div className="flex items-center ml-10 pl-3 border-l-2 border-status-error/30">
                            <span className="text-xs text-app-text-muted">{apporteurNom}</span>
                          </div>
                        </td>
                        {treasuryData.map((d, i) => (
                          <td key={i} className="py-1.5 text-center text-xs text-app-text-muted">
                            {formatCurrency(d.commissionsParApporteur[apporteurNom] || 0)}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Charges fixes (déroulant) */}
                    <tr
                      className="border-b border-app-border cursor-pointer hover:bg-status-error/5 transition-colors bg-status-error/[0.02]"
                      onClick={(e) => { e.stopPropagation(); setIsChargesExpanded(!isChargesExpanded); }}
                    >
                      <td className="py-2 px-4 sticky left-0 bg-app-dark z-10">
                        <div className="flex items-center ml-6 pl-3 border-l-2 border-status-error/40">
                          <ChevronDown className={`w-3 h-3 text-app-text-secondary mr-2 transition-transform ${isChargesExpanded ? 'rotate-180' : 'rotate-0'}`} />
                          <span className="text-sm text-app-text-secondary">Charges fixes</span>
                        </div>
                      </td>
                      {treasuryData.map((d, i) => (
                        <td key={i} className="py-2 text-center text-sm text-app-text-secondary">
                          {formatCurrency(d.chargesFixes)}
                        </td>
                      ))}
                    </tr>

                    {/* Détails Charges fixes (en-dessous) */}
                    {isChargesExpanded && chargesFixes.map((charge) => (
                      <tr key={charge.id} className="border-b border-app-border bg-status-error/[0.02]">
                        <td className="py-1.5 px-4 sticky left-0 bg-app-dark z-10">
                          <div className="flex items-center ml-10 pl-3 border-l-2 border-status-error/30">
                            <span className="text-xs text-app-text-muted">{charge.nom}</span>
                          </div>
                        </td>
                        {treasuryData.map((d, i) => (
                          <td key={i} className="py-1.5 text-center text-xs text-app-text-muted">
                            {formatCurrency(charge.montant_mensuel)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                )}

                {/* Variation */}
                <tr className="bg-app-border/30 border-b border-app-border">
                  <td className="py-3 px-4 text-sm font-bold text-app-text-muted sticky left-0 bg-app-dark z-10">
                    VARIATION
                  </td>
                  {treasuryData.map((d, i) => (
                    <td key={i} className="py-3 text-center">
                      <span className={`text-sm font-bold ${d.solde >= 0 ? 'text-status-success' : 'text-status-error'}`}>
                        {formatCurrency(d.solde)}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Solde cumulé */}
                <tr className="bg-app-dark border-b-2 border-app-border">
                  <td className="py-4 px-4 text-base font-bold text-app-text-primary sticky left-0 bg-app-dark z-10">
                    SOLDE CUMULÉ
                  </td>
                  {treasuryData.map((d, i) => (
                    <td key={i} className="py-4 text-center">
                      <span className={`text-base font-bold ${d.soldeCumule >= 0 ? 'text-status-success' : 'text-status-error'}`}>
                        {formatCurrency(d.soldeCumule)}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Client/Mission Distribution Chart - Full Width */}
      <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
        <div className="px-6 py-4 border-b border-app-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-app-text-primary">
              {selectedClient ? `Missions effectuées pour ${selectedClientName || selectedClient}` : 'Répartition par Client'}
            </h3>
            <p className="text-sm text-app-text-muted">
              {selectedClient
                ? `${missions.length} mission${missions.length > 1 ? 's' : ''} triée${missions.length > 1 ? 's' : ''} par CA`
                : `${clientsData.length} client${clientsData.length > 1 ? 's' : ''} par ${clientChartMode === 'ca' ? 'chiffre d\'affaires' : 'nombre de missions'}`
              }
            </p>
          </div>
          {!selectedClient && (
            <Select value={clientChartMode} onValueChange={(v) => setClientChartMode(v as 'ca' | 'missions')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ca">Chiffre d'affaires</SelectItem>
                <SelectItem value="missions">Nombre de missions</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="p-4">
          <ReactECharts option={clientPieChartOption} style={{ height: '400px' }} />
        </div>
      </div>

      {/* Missions Impayées */}
      <div className="bg-app-dark/50 backdrop-blur-sm rounded-lg shadow-lg border border-app-border overflow-hidden">
        <div className="px-6 py-4 border-b border-app-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-app-text-primary">Missions Impayées</h3>
            <p className="text-sm text-app-text-muted mt-1">Missions en attente de paiement client</p>
          </div>
          <Badge className="bg-status-warning/20 text-status-warning">
            {unpaidMissions.length} impayées
          </Badge>
        </div>
        <div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-app-border bg-app-black/50">
                  <TableHead className="text-left text-xs font-semibold text-app-text-secondary uppercase tracking-wide">ID</TableHead>
                  <TableHead className="text-left text-xs font-semibold text-app-text-secondary uppercase tracking-wide">Mission</TableHead>
                  <TableHead className="text-left text-xs font-semibold text-app-text-secondary uppercase tracking-wide">Client</TableHead>
                  <TableHead className="text-left text-xs font-semibold text-app-text-secondary uppercase tracking-wide">Période</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-app-text-secondary uppercase tracking-wide">CA Généré</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-app-text-secondary uppercase tracking-wide">Montant SUB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidMissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <CheckCircle2 className="h-12 w-12 text-status-success mx-auto mb-3" />
                      <p className="text-sm text-app-text-muted font-medium">Toutes les missions sont payées !</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  unpaidMissions.map((mission) => (
                    <TableRow key={mission.id} className="border-b border-app-border hover:bg-app-hover transition-colors">
                      <TableCell className="text-sm font-mono text-app-text-muted">{mission.id}</TableCell>
                      <TableCell className="text-sm font-semibold text-app-text-primary">{mission.nom_mission}</TableCell>
                      <TableCell className="text-sm text-app-text-primary">{mission.client_nom}</TableCell>
                      <TableCell className="text-sm text-app-text-muted">{mission.mois} {mission.annee}</TableCell>
                      <TableCell className="text-right text-sm font-bold text-app-text-primary">{formatCurrency(mission.ca_genere || 0)}</TableCell>
                      <TableCell className="text-right text-sm text-status-warning">{formatCurrency(mission.montant_sub || 0)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
