import React, { useMemo } from 'react';
import { Users, Euro, AlertCircle, Percent, Target } from 'lucide-react';
import KPICard from '../ui/KPICard';

interface ClientData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  customer_type?: 'b2b' | 'b2c';
  totalInvoices: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  lastInvoiceDate: string;
  companyName: string;
}

interface ClientsKPIsProps {
  clients: ClientData[];
}

const ClientsKPIs: React.FC<ClientsKPIsProps> = ({ clients }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const kpis = useMemo(() => {
    const totalClients = clients.length;
    const b2bClients = clients.filter(c => c.customer_type === 'b2b').length;
    const b2cClients = clients.filter(c => c.customer_type === 'b2c').length;
    const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0);
    const paidRevenue = clients.reduce((sum, c) => sum + c.paidRevenue, 0);
    const pendingRevenue = clients.reduce((sum, c) => sum + c.pendingRevenue, 0);

    // Active clients (with invoices in last 90 days)
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const activeClients = clients.filter(c =>
      c.lastInvoiceDate && new Date(c.lastInvoiceDate) > ninetyDaysAgo
    ).length;

    // Clients at risk (pending > 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const clientsAtRisk = clients.filter(c =>
      c.pendingRevenue > 0 && c.lastInvoiceDate && new Date(c.lastInvoiceDate) < thirtyDaysAgo
    ).length;

    // Collection rate
    const collectionRate = totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0;

    return {
      totalClients,
      b2bClients,
      b2cClients,
      activeClients,
      clientsAtRisk,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      collectionRate
    };
  }, [clients]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <KPICard
        title="Total Clients"
        value={kpis.totalClients}
        subtitle={`${kpis.activeClients} actifs | ${kpis.b2bClients} B2B | ${kpis.b2cClients} B2C`}
        icon={Users}
        delay={0}
      />

      <KPICard
        title="Chiffre d'affaires"
        value={formatCurrency(kpis.totalRevenue)}
        subtitle="Total période"
        icon={Euro}
        delay={0.05}
      />

      <KPICard
        title="Encours clients"
        value={formatCurrency(kpis.pendingRevenue)}
        subtitle="À recouvrer"
        icon={AlertCircle}
        iconColor={kpis.pendingRevenue > 0 ? 'text-status-warning' : 'text-app-text-secondary'}
        borderColor={kpis.pendingRevenue > 0 ? 'border-status-warning/50' : 'border-app-border'}
        valueColor={kpis.pendingRevenue > 0 ? 'text-status-warning' : 'text-app-text-primary'}
        delay={0.1}
      />

      <KPICard
        title="Taux d'encaissement"
        value={`${kpis.collectionRate.toFixed(1)}%`}
        subtitle={`${formatCurrency(kpis.paidRevenue)} encaissé`}
        icon={Percent}
        iconColor={kpis.collectionRate >= 80 ? 'text-status-success' : kpis.collectionRate >= 60 ? 'text-status-warning' : 'text-status-error'}
        iconBgColor={kpis.collectionRate >= 80 ? 'bg-status-success/20' : kpis.collectionRate >= 60 ? 'bg-status-warning/20' : 'bg-status-error/20'}
        borderColor={kpis.collectionRate >= 80 ? 'border-status-success/50' : kpis.collectionRate >= 60 ? 'border-status-warning/50' : 'border-status-error/50'}
        valueColor={kpis.collectionRate >= 80 ? 'text-status-success' : kpis.collectionRate >= 60 ? 'text-status-warning' : 'text-status-error'}
        delay={0.15}
      />

      <KPICard
        title="Clients à risque"
        value={kpis.clientsAtRisk}
        subtitle="Impayés > 30 jours"
        icon={Target}
        iconColor={kpis.clientsAtRisk > 0 ? 'text-status-error' : 'text-app-text-secondary'}
        iconBgColor={kpis.clientsAtRisk > 0 ? 'bg-status-error/20' : 'bg-app-dark'}
        borderColor={kpis.clientsAtRisk > 0 ? 'border-status-error/50' : 'border-app-border'}
        valueColor={kpis.clientsAtRisk > 0 ? 'text-status-error' : 'text-app-text-primary'}
        delay={0.2}
      />
    </div>
  );
};

export default ClientsKPIs;
