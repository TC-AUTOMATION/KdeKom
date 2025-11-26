// Types pour le système de facturation
export type ClientType = 'b2c' | 'b2b';

export interface Client {
  id?: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  email: string;
  phone: string;
  type: ClientType;
  siret?: string; // Obligatoire pour les clients B2B
}

export interface CompanyInfo {
  id?: string;
  name: string; // Nom commercial (displayed as logo in Designer font)
  companyName: string; // Raison sociale (legal company name)
  owner: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  siret: string;
  isSubjectToVat?: boolean; // Whether the company is subject to VAT (default: true)
}

export interface VehicleInfo {
  registration: string;
  brand: string;
  model: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  vehicleInfo: string; // Legacy field for backward compatibility
  vehicle?: VehicleInfo; // New structured vehicle data
  quantity: number;
  unitPrice: number; // Prix unitaire HORS TAXE (HT)
  taxRate: number; // Taux de TVA en pourcentage (ex: 20 pour 20%)
  discount: number; // Remise en pourcentage
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue';

export interface Invoice {
  id?: string;
  invoiceNumber?: string;
  date: string;
  dueDate: string;
  paymentMethod: string;
  status: InvoiceStatus;
  client: Client;
  items: InvoiceItem[];
  notes: string;
  company: CompanyInfo;
  // Montants TVA
  amountHt?: number; // Montant total Hors Taxe
  amountTva?: number; // Montant total de la TVA
  amountTtc?: number; // Montant total Toutes Taxes Comprises
}

// Fonctions utilitaires pour les calculs de facture

/**
 * Calcule le montant total HORS TAXE (HT) après application des remises
 * @param items - Liste des articles de la facture
 * @returns Montant total HT
 */
export const calculateAmountHT = (items: InvoiceItem[]): number => {
  return items.reduce((total, item) => {
    const itemTotalHT = item.quantity * item.unitPrice;
    const discountAmount = (itemTotalHT * item.discount) / 100;
    return total + (itemTotalHT - discountAmount);
  }, 0);
};

/**
 * Calcule le montant total de la TVA
 * @param items - Liste des articles de la facture
 * @returns Montant total de TVA
 */
export const calculateAmountTVA = (items: InvoiceItem[]): number => {
  return items.reduce((total, item) => {
    const itemTotalHT = item.quantity * item.unitPrice;
    const discountAmount = (itemTotalHT * item.discount) / 100;
    const amountHTAfterDiscount = itemTotalHT - discountAmount;
    return total + (amountHTAfterDiscount * item.taxRate) / 100;
  }, 0);
};

/**
 * Calcule le montant total TOUTES TAXES COMPRISES (TTC)
 * @param items - Liste des articles de la facture
 * @returns Montant total TTC
 */
export const calculateAmountTTC = (items: InvoiceItem[]): number => {
  const amountHT = calculateAmountHT(items);
  const amountTVA = calculateAmountTVA(items);
  return amountHT + amountTVA;
};

// Fonctions legacy pour compatibilité ascendante
export const calculateSubtotal = calculateAmountHT;
export const calculateTaxAmount = calculateAmountTVA;
export const calculateTotal = calculateAmountTTC;

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const generateInvoiceNumber = (prefix: string = '2025-'): string => {
  const randomNum = Math.floor(Math.random() * 90000) + 10000;
  return `${prefix}${randomNum.toString().padStart(5, '0')}`;
};