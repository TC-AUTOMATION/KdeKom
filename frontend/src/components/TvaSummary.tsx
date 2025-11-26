// Composant pour afficher le résumé TVA (HT/TVA/TTC)

import React from 'react';
import { InvoiceItem, calculateAmountHT, calculateAmountTVA, calculateAmountTTC, formatCurrency } from '../types/invoice';

interface TvaSummaryProps {
  items: InvoiceItem[];
  className?: string;
}

/**
 * Composant qui affiche un résumé clair des montants HT, TVA et TTC
 */
export const TvaSummary: React.FC<TvaSummaryProps> = ({ items, className = '' }) => {
  const amountHT = calculateAmountHT(items);
  const amountTVA = calculateAmountTVA(items);
  const amountTTC = calculateAmountTTC(items);

  return (
    <div className={`bg-app-hover p-4 space-y-2 ${className}`}>
      <h3 className="text-lg font-semibold text-app-text-primary mb-3">Résumé TVA</h3>

      <div className="flex justify-between items-center py-2 border-b border-app-border">
        <span className="text-app-text-secondary">Total HT (Hors Taxe)</span>
        <span className="text-app-text-primary font-medium">{formatCurrency(amountHT)}</span>
      </div>

      <div className="flex justify-between items-center py-2 border-b border-app-border">
        <span className="text-app-text-secondary">TVA</span>
        <span className="text-app-text-primary font-medium">{formatCurrency(amountTVA)}</span>
      </div>

      <div className="flex justify-between items-center py-3 border-t-2 border-app-border">
        <span className="text-lg font-bold text-app-text-primary">Total TTC (Toutes Taxes Comprises)</span>
        <span className="text-lg font-bold text-app-text-primary">{formatCurrency(amountTTC)}</span>
      </div>
    </div>
  );
};

export default TvaSummary;
