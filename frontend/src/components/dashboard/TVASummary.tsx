import React from 'react';
import { TrendingUp, TrendingDown, Euro } from 'lucide-react';

interface TVASummaryProps {
  tvaCollectee: number;
  tvaDeductible: number;
  tvaAPayer: number;
  periodLabel?: string;
}

/**
 * Composant d'affichage complet de la TVA avec collectée, déductible et à payer
 */
const TVASummary: React.FC<TVASummaryProps> = ({
  tvaCollectee,
  tvaDeductible,
  tvaAPayer,
  periodLabel = "Mois en cours"
}) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div
      className="bg-gradient-to-br from-app-dark/90 to-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 bg-app-dark/80 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-status-warning/20 rounded">
            <Euro className="h-5 w-5 text-status-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-app-text-primary">Résumé TVA</h3>
            <p className="text-xs text-app-text-muted">{periodLabel}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* TVA Collectée */}
        <div className="flex items-center justify-between p-3 bg-status-success/5 border border-status-success/20 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-status-success" />
            <span className="text-sm font-medium text-app-text-secondary">TVA Collectée</span>
          </div>
          <span className="text-lg font-bold text-status-success">{formatCurrency(tvaCollectee)}</span>
        </div>

        {/* TVA Déductible */}
        <div className="flex items-center justify-between p-3 bg-app-border border border-app-border rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-app-text-muted" />
            <span className="text-sm font-medium text-app-text-secondary">TVA Déductible</span>
          </div>
          <span className="text-lg font-bold text-app-text-muted">{formatCurrency(tvaDeductible)}</span>
        </div>

        {/* Separator */}
        <div className="border-t border-app-border my-2"></div>

        {/* TVA à Payer */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-status-warning/10 to-status-warning/5 border-2 border-status-warning/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-status-warning" />
            <span className="text-base font-bold text-app-text-primary">TVA à Payer</span>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${tvaAPayer >= 0 ? 'text-status-warning' : 'text-status-success'}`}>
              {formatCurrency(tvaAPayer)}
            </span>
            {tvaAPayer < 0 && (
              <p className="text-xs text-status-success mt-1">Crédit de TVA</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVASummary;
