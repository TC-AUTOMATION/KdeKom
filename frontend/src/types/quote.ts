// Types pour le système de devis
import { Client, CompanyInfo, InvoiceItem } from './invoice';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface Quote {
  id: string;
  date: string;
  validUntil: string; // Date de validité du devis
  status: QuoteStatus;
  client: Client;
  items: InvoiceItem[];
  notes: string;
  company: CompanyInfo;
  // Montants TVA
  amountHt?: number; // Montant total Hors Taxe
  amountTva?: number; // Montant total de la TVA
  amountTtc?: number; // Montant total Toutes Taxes Comprises
  convertedToInvoiceId?: string; // ID de la facture si converti
}

// Fonctions utilitaires pour les calculs de devis (réutilisent les mêmes calculs que les factures)
export { calculateSubtotal, calculateTaxAmount, calculateTotal, formatCurrency, formatNumber } from './invoice';

export const generateQuoteNumber = (prefix: string = 'DEV-2025-'): string => {
  const randomNum = Math.floor(Math.random() * 90000) + 10000;
  return `${prefix}${randomNum.toString().padStart(5, '0')}`;
};
