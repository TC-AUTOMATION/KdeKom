import React, { useMemo } from 'react';
import { Euro, TrendingDown, TrendingUp, PieChart, BarChart2 } from 'lucide-react';
import KPICard from '../ui/KPICard';

interface Charge {
  id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  supplier?: string;
}

interface ChargesKPIsProps {
  charges: Charge[];
}

const ChargesKPIs: React.FC<ChargesKPIsProps> = ({ charges }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const kpis = useMemo(() => {
    const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0);
    const chargeCount = charges.length;

    // Average charge amount
    const avgChargeAmount = chargeCount > 0 ? totalCharges / chargeCount : 0;

    // Current month expenses
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentMonthCharges = charges.filter(c => {
      const chargeDate = new Date(c.date);
      return chargeDate.getMonth() === currentMonth && chargeDate.getFullYear() === currentYear;
    }).reduce((sum, c) => sum + c.amount, 0);

    // Last month expenses for comparison
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthCharges = charges.filter(c => {
      const chargeDate = new Date(c.date);
      return chargeDate.getMonth() === lastMonth && chargeDate.getFullYear() === lastMonthYear;
    }).reduce((sum, c) => sum + c.amount, 0);

    const monthTrend = lastMonthCharges > 0
      ? ((currentMonthCharges - lastMonthCharges) / lastMonthCharges) * 100
      : 0;

    // Charges by category
    const chargesByCategory = charges.reduce((acc, c) => {
      const cat = c.category;
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += c.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(chargesByCategory).sort((a, b) => b[1] - a[1])[0];

    return {
      totalCharges,
      chargeCount,
      avgChargeAmount,
      currentMonthCharges,
      lastMonthCharges,
      monthlyTrend: monthTrend,
      topCategory: topCategory ? topCategory[0] : 'N/A',
      topCategoryAmount: topCategory ? topCategory[1] : 0,
      topCategoryPercentage: totalCharges > 0 && topCategory ? (topCategory[1] / totalCharges) * 100 : 0
    };
  }, [charges]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total Charges"
        value={formatCurrency(kpis.totalCharges)}
        subtitle={`${kpis.chargeCount} dépenses`}
        icon={Euro}
        iconColor="text-status-error"
        iconBgColor="bg-status-error/20"
        borderColor="border-status-error/50"
        delay={0}
      />

      <KPICard
        title="Mois en cours"
        value={formatCurrency(kpis.currentMonthCharges)}
        subtitle={
          kpis.monthlyTrend !== 0
            ? `${kpis.monthlyTrend > 0 ? '+' : ''}${kpis.monthlyTrend.toFixed(1)}% vs mois dernier`
            : 'Aucune variation'
        }
        icon={kpis.monthlyTrend > 0 ? TrendingUp : TrendingDown}
        iconColor={kpis.monthlyTrend > 0 ? 'text-status-error' : 'text-status-success'}
        iconBgColor={kpis.monthlyTrend > 0 ? 'bg-status-error/20' : 'bg-status-success/20'}
        borderColor={kpis.monthlyTrend > 0 ? 'border-status-error/50' : 'border-status-success/50'}
        delay={0.05}
      />

      <KPICard
        title="Moyenne"
        value={formatCurrency(kpis.avgChargeAmount)}
        subtitle="Par charge"
        icon={BarChart2}
        iconColor="text-app-text-muted"
        iconBgColor="bg-app-border"
        borderColor="border-app-border"
        delay={0.1}
      />

      <KPICard
        title="Catégorie principale"
        value={formatCurrency(kpis.topCategoryAmount)}
        subtitle={`${kpis.topCategory} (${kpis.topCategoryPercentage.toFixed(0)}%)`}
        icon={PieChart}
        iconColor="text-status-info"
        iconBgColor="bg-status-info/20"
        borderColor="border-status-info/50"
        delay={0.15}
      />
    </div>
  );
};

export default ChargesKPIs;
