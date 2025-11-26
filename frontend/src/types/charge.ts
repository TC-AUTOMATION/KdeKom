export interface Charge {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number; // Montant TTC
  amountHt?: number; // Montant HT
  tvaRate: number; // Taux de TVA en pourcentage (20, 10, 5.5, 2.1, 0)
  tvaAmount?: number; // Montant de TVA déductible
  isSubjectToTva: boolean; // Si la charge est assujettie à la TVA
  paymentMethod: PaymentMethod;
  supplier?: string;
  notes?: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ChargeCategory = string;

export type PaymentMethod =
  | 'especes'
  | 'cb'
  | 'virement'
  | 'prelevement'
  | 'cheque';

export interface ChargeCreateInput {
  date: string;
  category: ChargeCategory;
  description: string;
  amount: number; // Montant TTC
  amountHt?: number; // Montant HT
  tvaRate: number; // Taux de TVA
  tvaAmount?: number; // Montant de TVA
  isSubjectToTva: boolean; // Si la charge est assujettie à la TVA
  paymentMethod: PaymentMethod;
  supplier?: string;
  notes?: string;
  companyId: string;
}

export interface ChargeUpdateInput extends Partial<ChargeCreateInput> {
  id: string;
}
