import React, { useMemo } from 'react';
import { Car, Euro, TrendingUp, AlertCircle } from 'lucide-react';
import KPICard from '../ui/KPICard';

interface VehicleData {
  id?: string;
  vehicleInfo: string;
  brand: string;
  model: string;
  registration: string;
  clientId?: string;
  clientName: string;
  totalServices: number;
  totalRevenue: number;
  lastServiceDate: string;
}

interface Client {
  id?: string;
  customer_type?: 'b2b' | 'b2c';
}

interface VehiclesKPIsProps {
  vehicles: VehicleData[];
  clients: Client[];
}

const VehiclesKPIs: React.FC<VehiclesKPIsProps> = ({ vehicles, clients }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const kpis = useMemo(() => {
    const totalVehicles = vehicles.length;
    const totalRevenue = vehicles.reduce((sum, v) => sum + v.totalRevenue, 0);
    const totalServices = vehicles.reduce((sum, v) => sum + v.totalServices, 0);

    // Active vehicles (serviced in last 90 days)
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const activeVehicles = vehicles.filter(v =>
      v.lastServiceDate && new Date(v.lastServiceDate) > ninetyDaysAgo
    ).length;

    // Average services per vehicle
    const avgServicesPerVehicle = totalVehicles > 0 ? totalServices / totalVehicles : 0;

    // Average revenue per vehicle
    const avgRevenuePerVehicle = totalVehicles > 0 ? totalRevenue / totalVehicles : 0;

    // Vehicles needing service (B2C > 180 days - ACTION ITEM)
    const oneEightyDaysAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const needsAttention = vehicles.filter(v => {
      // Only track B2C clients for service reminders
      const client = clients.find(c => c.id === v.clientId);
      const isB2C = client?.customer_type === 'b2c';
      return isB2C && v.lastServiceDate && new Date(v.lastServiceDate) < oneEightyDaysAgo;
    }).length;

    return {
      totalVehicles,
      activeVehicles,
      totalRevenue,
      totalServices,
      avgServicesPerVehicle,
      avgRevenuePerVehicle,
      needsAttention
    };
  }, [vehicles, clients]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total Véhicules"
        value={kpis.totalVehicles}
        subtitle={`${kpis.activeVehicles} actifs (90j)`}
        icon={Car}
        delay={0}
      />

      <KPICard
        title="Chiffre d'affaires"
        value={formatCurrency(kpis.totalRevenue)}
        subtitle={`${kpis.totalServices} prestations`}
        icon={Euro}
        delay={0.05}
      />

      <KPICard
        title="Moyenne / véhicule"
        value={formatCurrency(kpis.avgRevenuePerVehicle)}
        subtitle={`${kpis.avgServicesPerVehicle.toFixed(1)} prestations`}
        icon={TrendingUp}
        iconColor="text-app-text-muted"
        iconBgColor="bg-app-border"
        borderColor="border-app-border"
        delay={0.1}
      />

      <KPICard
        title="Relance nécessaire"
        value={kpis.needsAttention}
        subtitle="B2C sans service > 180j"
        icon={AlertCircle}
        iconColor={kpis.needsAttention > 0 ? 'text-status-warning' : 'text-app-text-secondary'}
        iconBgColor={kpis.needsAttention > 0 ? 'bg-status-warning/20' : 'bg-app-dark'}
        borderColor={kpis.needsAttention > 0 ? 'border-status-warning/50' : 'border-app-border'}
        valueColor={kpis.needsAttention > 0 ? 'text-status-warning' : 'text-app-text-primary'}
        delay={0.15}
      />
    </div>
  );
};

export default VehiclesKPIs;
