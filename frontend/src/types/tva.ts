export interface TVADeclaration {
  id: string;
  period: string; // Format: "2025-Q1" or "2025-01"
  periodType: 'monthly' | 'quarterly';
  startDate: string;
  endDate: string;
  tvaCollectee: number; // TVA collected from sales
  tvaDeductible: number; // TVA deductible from purchases
  tvaNetDue: number; // Net TVA to pay (or credit)
  status: 'draft' | 'submitted' | 'paid';
  submittedDate?: string;
  paidDate?: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TVACalculation {
  period: string;
  startDate: string;
  endDate: string;
  invoices: {
    count: number;
    totalHT: number;
    totalTVA: number;
  };
  charges: {
    count: number;
    totalHT: number;
    totalTVA: number;
  };
  tvaCollectee: number;
  tvaDeductible: number;
  tvaNetDue: number;
}

export interface TVARate {
  rate: number;
  label: string;
}

export const TVA_RATES: TVARate[] = [
  { rate: 0.20, label: '20%' },
  { rate: 0.10, label: '10%' },
  { rate: 0.055, label: '5.5%' },
  { rate: 0.021, label: '2.1%' },
  { rate: 0, label: '0%' }
];

export const DEFAULT_TVA_RATE = 0.20;
