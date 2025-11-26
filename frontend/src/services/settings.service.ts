import { AppSettings } from '../types/settings';

const API_URL = '/api/settings';

export class SettingsService {
  /**
   * Get settings for a company
   */
  static async getSettings(companyId: string): Promise<AppSettings | null> {
    try {
      const response = await fetch(`${API_URL}/${companyId}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Return default settings if not found
          return {
            company_id: companyId,
            invoice_number_format: 'YYYY-MM-NNN',
            last_invoice_number: 0,
            last_invoice_month: undefined,
            last_quote_number: 0,
            last_quote_month: undefined,
            default_tva_rate: 20
          };
        }
        throw new Error('Failed to fetch settings');
      }
      return await response.json();
    } catch (err) {
      console.error('Exception in getSettings:', err);
      return null;
    }
  }

  /**
   * Create or update settings
   */
  static async upsertSettings(settings: AppSettings): Promise<AppSettings | null> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyId: settings.company_id,
          invoiceNumberFormat: settings.invoice_number_format,
          lastInvoiceNumber: settings.last_invoice_number,
          lastInvoiceMonth: settings.last_invoice_month,
          lastQuoteNumber: settings.last_quote_number ?? 0,
          lastQuoteMonth: settings.last_quote_month,
          defaultTvaRate: settings.default_tva_rate ?? 20
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upsert settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error upserting settings:', error);
      return null;
    }
  }

  /**
   * Generate next invoice number based on settings
   * Format: YYYY-MM-NNNN with annual reset
   */
  static async generateInvoiceNumber(companyId: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/${companyId}/generate-invoice-number`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice number');
      }

      const data = await response.json();
      return data.invoiceNumber;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to random if generation fails
      return `2025-01-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;
    }
  }

  /**
   * Update invoice number format
   */
  static async updateInvoiceNumberFormat(
    companyId: string,
    format: 'YYYY-MM-NNN' | 'YYYY-NNNNN'
  ): Promise<boolean> {
    const settings = await this.getSettings(companyId);

    if (!settings) {
      return false;
    }

    const updated = await this.upsertSettings({
      ...settings,
      invoice_number_format: format
    });

    return updated !== null;
  }

  /**
   * Manually set the next invoice number (for migration/setup)
   */
  static async setNextInvoiceNumber(
    companyId: string,
    number: number
  ): Promise<boolean> {
    const settings = await this.getSettings(companyId);

    if (!settings) {
      return false;
    }

    // Validate number - max 4 digits (9999)
    if (number > 9999) {
      console.error('Invoice number cannot exceed 9999');
      return false;
    }

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const updated = await this.upsertSettings({
      ...settings,
      last_invoice_number: number - 1, // Subtract 1 because next generation will add 1
      last_invoice_month: month
    });

    return updated !== null;
  }

  /**
   * Update default TVA rate
   */
  static async setDefaultTvaRate(
    companyId: string,
    tvaRate: number
  ): Promise<boolean> {
    const settings = await this.getSettings(companyId);

    if (!settings) {
      return false;
    }

    // Validate rate - must be between 0 and 100
    if (tvaRate < 0 || tvaRate > 100) {
      console.error('TVA rate must be between 0 and 100');
      return false;
    }

    const updated = await this.upsertSettings({
      ...settings,
      default_tva_rate: tvaRate
    });

    return updated !== null;
  }

  /**
   * Generate next quote number based on settings
   * Format: DEV-YYYY-MM-NNNN with annual reset
   */
  static async generateQuoteNumber(companyId: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/${companyId}/generate-quote-number`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to generate quote number');
      }

      const data = await response.json();
      return data.quoteNumber;
    } catch (error) {
      console.error('Error generating quote number:', error);
      // Fallback to random if generation fails
      return `DEV-2025-01-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;
    }
  }

  /**
   * Preview the next quote number without incrementing
   */
  static async previewQuoteNumber(companyId: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/${companyId}/preview-quote-number`);

      if (!response.ok) {
        throw new Error('Failed to preview quote number');
      }

      const data = await response.json();
      return data.quoteNumber;
    } catch (error) {
      console.error('Error previewing quote number:', error);
      return 'DEV-LOADING...';
    }
  }
}
