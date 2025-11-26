// URSSAF types for micro-entrepreneurs (auto-entrepreneurs)
// Social security contributions for self-employed in France

export interface URSSAFDeclaration {
  id: string;
  period: string; // Format: "2025-01" for January 2025, "2025-Q1" for Q1 2025
  periodType: 'monthly' | 'quarterly';
  startDate: string;
  endDate: string;

  // Revenue breakdown
  chiffreAffairesTotal: number; // Total revenue (CA)
  chiffreAffairesServices: number; // Revenue from services
  chiffreAffairesMarchandises: number; // Revenue from goods

  // Contribution calculations
  cotisationsServices: number; // Contributions on services (usually 21.2%)
  cotisationsMarchandises: number; // Contributions on goods (usually 12.3%)
  cotisationsTotal: number; // Total URSSAF contributions

  // Declaration status
  status: 'draft' | 'submitted' | 'paid';
  submittedDate?: string;
  paidDate?: string;

  // References
  companyId: string;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface URSSAFCalculation {
  period: string;
  startDate: string;
  endDate: string;

  // Revenue analysis
  invoices: {
    count: number;
    totalServices: number; // Revenue from services
    totalMarchandises: number; // Revenue from goods
    totalRevenue: number; // Total revenue
  };

  // Contribution rates (can vary by year and activity type)
  rates: {
    services: number; // Usually 21.2% for services
    marchandises: number; // Usually 12.3% for goods/commercial activities
  };

  // Calculated contributions
  cotisationsServices: number;
  cotisationsMarchandises: number;
  cotisationsTotal: number;

  // Optional: breakdown by activity type if needed
  breakdown?: {
    artisanat?: number; // Craft activities
    commercial?: number; // Commercial activities
    liberal?: number; // Liberal professions
  };
}

// URSSAF contribution rates for micro-entrepreneurs (2025)
export const URSSAF_RATES = {
  // Services commerciaux et artisanaux (BIC)
  SERVICES_BIC: 0.212, // 21.2% - Services commerciaux/artisanaux

  // Vente de marchandises (BIC)
  MARCHANDISES_BIC: 0.123, // 12.3% - Achat/revente de marchandises

  // Professions libérales (BNC)
  LIBERAL_BNC_CIPAV: 0.218, // 21.8% - Liberal professions (CIPAV)
  LIBERAL_BNC_SSI: 0.212, // 21.2% - Liberal professions (SSI)

  // Note: Rates may change yearly, update as needed
} as const;

// Activity types for URSSAF categorization
export type URSSAFActivityType =
  | 'services_bic' // Services commerciaux/artisanaux
  | 'marchandises_bic' // Achat/revente de marchandises
  | 'liberal_bnc_cipav' // Professions libérales CIPAV
  | 'liberal_bnc_ssi'; // Professions libérales SSI

// Revenue thresholds for micro-entrepreneurs (2025)
export const URSSAF_THRESHOLDS = {
  SERVICES_BIC: 77700, // €77,700 for services
  MARCHANDISES_BIC: 188700, // €188,700 for goods
  LIBERAL_BNC: 77700, // €77,700 for liberal professions
} as const;

export interface URSSAFSummary {
  // Current year summary
  year: number;
  totalRevenue: number;
  totalCotisations: number;

  // Revenue breakdown
  revenueServices: number;
  revenueMarchandises: number;

  // Threshold tracking
  remainingBeforeThreshold: number;
  thresholdType: keyof typeof URSSAF_THRESHOLDS;
  thresholdReached: boolean;

  // Payment status
  declarations: {
    total: number;
    submitted: number;
    paid: number;
    pending: number;
  };
}
