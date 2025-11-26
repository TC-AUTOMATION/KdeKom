import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, Euro } from 'lucide-react';
import { Invoice } from '../../types/invoice';

interface URSSAFDashboardCardProps {
  invoices: Invoice[];
  urssafRate: number; // Taux URSSAF configuré par l'entreprise (ex: 21.2)
  year: number;
  selectedMonth?: number | null; // Mois sélectionné (0-11) ou null pour l'année complète
}

const URSSAFDashboardCard: React.FC<URSSAFDashboardCardProps> = ({
  invoices,
  urssafRate,
  year,
  selectedMonth = null,
}) => {
  const urssafData = useMemo(() => {
    // Filter paid invoices for the selected period (month or year)
    const yearInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.date);
      const yearMatch = invDate.getFullYear() === year;
      const monthMatch = selectedMonth !== null ? invDate.getMonth() === selectedMonth : true;
      return yearMatch && monthMatch && inv.status === 'paid';
    });

    // Calculate total revenue
    const totalRevenue = yearInvoices.reduce((sum, invoice) => {
      const invoiceTotal = invoice.items.reduce((total, item) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemDiscount = (itemSubtotal * item.discount) / 100;
        const itemTaxable = itemSubtotal - itemDiscount;
        const itemTax = (itemTaxable * item.taxRate) / 100;
        return total + itemTaxable + itemTax;
      }, 0);
      return sum + invoiceTotal;
    }, 0);

    // Calculate URSSAF contributions
    const cotisations = totalRevenue * (urssafRate / 100);

    return {
      totalRevenue,
      cotisations,
    };
  }, [invoices, urssafRate, year, selectedMonth]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-app-border/10 to-app-border/10 backdrop-blur-sm border border-app-border p-6 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-app-border rounded">
            <Briefcase className="h-5 w-5 text-app-text-muted" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-app-text-primary">
              URSSAF {selectedMonth !== null
                ? `${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][selectedMonth]} ${year}`
                : year}
            </h3>
            <p className="text-xs text-app-text-muted">Cotisations sociales</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-app-text-muted">Taux</p>
          <p className="text-sm font-semibold text-app-text-muted">{urssafRate}%</p>
        </div>
      </div>

      {/* Revenue & Contributions */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-app-dark/50 p- rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-status-success" />
            <span className="text-xs text-app-text-muted">Chiffre d'affaires</span>
          </div>
          <p className="text-lg font-bold text-app-text-primary">{formatCurrency(urssafData.totalRevenue)}</p>
        </div>

        <div className="bg-app-dark/50 p- rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <Euro className="h-4 w-4 text-status-warning" />
            <span className="text-xs text-app-text-muted">Cotisations</span>
          </div>
          <p className="text-lg font-bold text-status-warning">{formatCurrency(urssafData.cotisations)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default URSSAFDashboardCard;
