import { Quote } from '../types/quote';

const API_URL = '/api/quotes';

export class QuoteService {
  /**
   * Get all quotes
   */
  static async getAllQuotes(): Promise<Quote[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      const data = await response.json();
      return data.map((quote: any) => this.transformQuote(quote)).filter((q: Quote | null) => q !== null);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
  }

  /**
   * Get quote by ID (quote_number)
   */
  static async getQuoteById(quoteNumber: string): Promise<Quote | undefined> {
    try {
      const response = await fetch(`${API_URL}/${quoteNumber}`);
      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error('Failed to fetch quote');
      }
      const data = await response.json();
      const transformed = this.transformQuote(data);
      return transformed || undefined;
    } catch (error) {
      console.error('Error fetching quote:', error);
      return undefined;
    }
  }

  /**
   * Create a new quote
   */
  static async createQuote(quote: Quote): Promise<Quote> {
    try {
      const payload = {
        quoteNumber: quote.id,
        date: quote.date,
        validUntil: quote.validUntil || null,
        status: quote.status,
        companyId: quote.company.id,
        notes: quote.notes || '',
        clientId: quote.client?.id,
        client: quote.client?.id ? undefined : {
          name: quote.client?.name || '',
          email: quote.client?.email || '',
          address: quote.client?.address || '',
          postalCode: quote.client?.postalCode || '',
          city: quote.client?.city || '',
          phone: quote.client?.phone || '',
          customerType: quote.client?.type || 'b2c',
          siret: quote.client?.siret || ''
        },
        items: quote.items.map(item => ({
          description: item.description,
          vehicleInfo: item.vehicle && (item.vehicle.brand || item.vehicle.model || item.vehicle.registration)
            ? {
                brand: item.vehicle.brand || '',
                model: item.vehicle.model || '',
                registration: item.vehicle.registration || ''
              }
            : item.vehicleInfo || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          discount: item.discount
        }))
      };

      console.log('[QuoteService] Creating quote with payload:', payload);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[QuoteService] Server error:', response.status, errorText);
        throw new Error(`Failed to create quote: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[QuoteService] Received quote data from server:', data);

      const transformed = this.transformQuote(data);
      if (!transformed) {
        throw new Error('Failed to transform quote data from server');
      }

      console.log('[QuoteService] Transformed quote:', transformed);
      return transformed;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  }

  /**
   * Update an existing quote
   */
  static async updateQuote(quote: Quote): Promise<void> {
    try {
      const payload = {
        date: quote.date,
        validUntil: quote.validUntil || null,
        status: quote.status,
        notes: quote.notes || '',
        client: quote.client ? {
          name: quote.client.name || '',
          email: quote.client.email || '',
          address: quote.client.address || '',
          postalCode: quote.client.postalCode || '',
          city: quote.client.city || '',
          phone: quote.client.phone || '',
          customerType: quote.client.type || 'b2c',
          siret: quote.client.siret || ''
        } : undefined,
        items: quote.items.map(item => ({
          description: item.description,
          vehicleInfo: item.vehicle && (item.vehicle.brand || item.vehicle.model || item.vehicle.registration)
            ? {
                brand: item.vehicle.brand || '',
                model: item.vehicle.model || '',
                registration: item.vehicle.registration || ''
              }
            : item.vehicleInfo || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          discount: item.discount
        }))
      };

      const response = await fetch(`${API_URL}/${quote.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update quote');
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  }

  /**
   * Delete a quote
   */
  static async deleteQuote(quoteNumber: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${quoteNumber}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete quote');
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  }

  /**
   * Convert a quote to an invoice
   */
  static async convertQuoteToInvoice(quoteNumber: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/${quoteNumber}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Empty body to satisfy Fastify
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[QuoteService] Server error:', response.status, errorText);
        throw new Error(`Failed to convert quote to invoice: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.invoiceNumber || data.invoice_number || data.id;
    } catch (error) {
      console.error('Error converting quote to invoice:', error);
      throw error;
    }
  }

  /**
   * Transform backend quote data to frontend format
   */
  private static transformQuote(data: any): Quote | null {
    if (!data) {
      console.error('[QuoteService] Cannot transform null or undefined quote data');
      return null;
    }

    const parseVehicleInfo = (vehicleInfoStr: string | object) => {
      // If it's already an object, return it with defaults
      if (typeof vehicleInfoStr === 'object' && vehicleInfoStr !== null) {
        const obj = vehicleInfoStr as any;
        return {
          registration: obj.registration || '',
          brand: obj.brand || '',
          model: obj.model || ''
        };
      }

      // If it's not a string or is empty, return defaults
      if (!vehicleInfoStr || typeof vehicleInfoStr !== 'string' || !vehicleInfoStr.trim()) {
        return { registration: '', brand: '', model: '' };
      }

      // Try to parse as JSON first (for data stored as JSON string)
      if (vehicleInfoStr.startsWith('{') || vehicleInfoStr.startsWith('[')) {
        try {
          const parsed = JSON.parse(vehicleInfoStr);
          if (parsed && typeof parsed === 'object') {
            return {
              registration: parsed.registration || '',
              brand: parsed.brand || '',
              model: parsed.model || ''
            };
          }
        } catch (e) {
          // Not valid JSON, continue with other parsing methods
        }
      }

      // Handle fleet vehicles
      if (vehicleInfoStr.toLowerCase().includes('flotte')) {
        return {
          brand: 'Flotte',
          model: vehicleInfoStr.replace(/flotte/i, '').trim(),
          registration: 'FLEET'
        };
      }

      // Parse "Brand Model - Registration" format
      const separatorIndex = vehicleInfoStr.indexOf(' - ');
      if (separatorIndex === -1) {
        return { registration: '', brand: '', model: '' };
      }

      const brandModel = vehicleInfoStr.substring(0, separatorIndex).trim();
      const registration = vehicleInfoStr.substring(separatorIndex + 3).trim();

      const brandModelParts = brandModel.split(' ');
      const brand = brandModelParts[0] || '';
      const model = brandModelParts.slice(1).join(' ') || '';

      return { brand, model, registration };
    };

    return {
      id: data.quoteNumber || data.quote_number || data._id || `DEV-${Date.now()}`,
      date: data.date,
      validUntil: data.valid_until || data.validUntil || '',
      status: data.status,
      client: data.client ? {
        id: data.client.id,
        name: data.client.name || '',
        address: data.client.address || '',
        postalCode: data.client.postalCode || '',
        city: data.client.city || '',
        email: data.client.email || '',
        phone: data.client.phone || '',
        type: data.client.type || data.client.customerType || data.client.customer_type || 'b2c',
        siret: data.client.siret || ''
      } : {
        id: undefined,
        name: '',
        address: '',
        postalCode: '',
        city: '',
        email: '',
        phone: '',
        type: 'b2c' as const,
        siret: ''
      },
      items: (data.items || data.quote_items || []).map((item: any) => {
        const vehicle = parseVehicleInfo(item.vehicleInfo || item.vehicle_info);
        return {
          id: item.id,
          description: item.description,
          vehicleInfo: item.vehicleInfo || item.vehicle_info || '',
          vehicle,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice || item.unit_price),
          taxRate: Number(item.taxRate || item.tax_rate),
          discount: Number(item.discount)
        };
      }),
      notes: data.notes || '',
      company: {
        id: data.company?.id || '',
        name: data.company?.name || '',
        companyName: data.company?.companyName || data.company?.name || '',
        owner: data.company?.owner || '',
        address: data.company?.address || '',
        postalCode: data.company?.postalCode || '',
        city: data.company?.city || '',
        phone: data.company?.phone || '',
        email: data.company?.email || '',
        siret: data.company?.siret || '',
        isSubjectToVat: data.company?.isSubjectToVat !== false
      },
      amountHt: data.amountHt ? Number(data.amountHt) : undefined,
      amountTva: data.amountTva ? Number(data.amountTva) : undefined,
      amountTtc: data.amountTtc ? Number(data.amountTtc) : undefined
    };
  }
}

// Export helper functions for backward compatibility
export const getQuotes = () => QuoteService.getAllQuotes();
export const getQuoteById = (id: string) => QuoteService.getQuoteById(id);
export const createQuote = (quote: Quote) => QuoteService.createQuote(quote);
export const updateQuote = (quote: Quote) => QuoteService.updateQuote(quote);
export const deleteQuote = (id: string) => QuoteService.deleteQuote(id);
