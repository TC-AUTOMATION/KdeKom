export interface AppSettings {
  id?: string;
  invoice_number_format: 'YYYY-MM-NNN' | 'YYYY-NNNNN'; // Default is YYYY-MM-NNN
  last_invoice_number: number; // Last sequential number used (resets monthly for YYYY-MM-NNN)
  last_invoice_month?: string; // Track last month for reset (format: YYYY-MM)
  last_quote_number?: number; // Last quote number used
  last_quote_month?: string; // Track last month for quote reset (format: YYYY-MM)
  company_id: string;
  default_tva_rate?: number; // Default TVA rate (0-100), defaults to 20 if not set
}

export interface InvoiceNumberConfig {
  format: 'YYYY-MM-NNN' | 'YYYY-NNNNN';
  lastNumber: number;
  lastMonth?: string;
}
