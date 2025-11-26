import React from 'react';
import { TrendingUp, Euro, Percent } from 'lucide-react';

interface URSSAFSummaryProps {
  chiffreAffaires: number;
  cotisations: number;
  tauxMoyen: number;
  periodLabel?: string;
}

/**
 * Composant d'affichage complet de l'URSSAF avec CA, cotisations et taux moyen
 */
const URSSAFSummary: React.FC<URSSAFSummaryProps> = ({
  chiffreAffaires,
  cotisations,
  tauxMoyen,
  periodLabel = 'Mois en cours',
}) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div
      className="bg-gradient-to-br from-app-dark/90 to-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 bg-app-dark/80 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-app-border rounded">
            <Euro className="h-5 w-5 text-app-text-muted" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-app-text-primary">Résumé URSSAF</h3>
            <p className="text-xs text-app-text-muted">{periodLabel}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Chiffre d'Affaires */}
        <div className="flex items-center justify-between p-3 bg-status-success/5 border border-status-success/20 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-status-success" />
            <span className="text-sm font-medium text-app-text-secondary">Chiffre d'Affaires</span>
          </div>
          <span className="text-lg font-bold text-status-success">
            {formatCurrency(chiffreAffaires)}
          </span>
        </div>

        {/* Taux Moyen */}
        <div className="flex items-center justify-between p-3 bg-status-info/5 border border-status-info/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-app-text-muted" />
            <span className="text-sm font-medium text-app-text-secondary">Taux Moyen</span>
          </div>
          <span className="text-lg font-bold text-app-text-muted">{formatPercent(tauxMoyen)}</span>
        </div>

        {/* Separator */}
        <div className="border-t border-app-border my-2"></div>

        {/* Cotisations à Payer */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-status-warning/10 to-status-warning/5 border-2 border-status-warning/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-status-warning" />
            <span className="text-base font-bold text-app-text-primary">Cotisations à Payer</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-status-warning">
              {formatCurrency(cotisations)}
            </span>
            <p className="text-xs text-app-text-muted mt-1">
              {chiffreAffaires > 0
                ? `${formatPercent((cotisations / chiffreAffaires) * 100)} du CA`
                : 'Aucun CA'}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-app-border border border-app-border rounded-lg">
          <p className="text-xs text-app-text-muted">
            💡 <span className="font-medium text-app-text-secondary">Micro-entrepreneur :</span> Les cotisations
            sont calculées à 21,2% du CA pour les prestations de services. Les déclarations sont à
            effectuer mensuellement ou trimestriellement sur autoentrepreneur.urssaf.fr
          </p>
        </div>
      </div>
    </div>
  );
};

export default URSSAFSummary;
