import { Invoice } from '../types/invoice';

const API_URL = '/api/invoices';

export class InvoiceService {
  /**
   * Get all invoices
   */
  static async getAllInvoices(): Promise<Invoice[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      const data = await response.json();

      // Transform backend data to frontend format
      return data.map((invoice: any) => this.transformInvoice(invoice));
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  /**
   * Get invoice by ID (invoice_number)
   */
  static async getInvoiceById(invoiceNumber: string): Promise<Invoice | undefined> {
    try {
      const response = await fetch(`${API_URL}/${invoiceNumber}`);
      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error('Failed to fetch invoice');
      }
      const data = await response.json();
      return this.transformInvoice(data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return undefined;
    }
  }

  /**
   * Create a new invoice
   */
  static async createInvoice(invoice: Invoice): Promise<Invoice> {
    try {
      const payload: any = {
        date: invoice.date,
        dueDate: invoice.dueDate || null,
        paymentMethod: invoice.paymentMethod || 'Virement',
        status: invoice.status,
        companyId: invoice.company.id,
        notes: invoice.notes || '',
        clientId: invoice.client?.id,
        client: invoice.client?.id ? undefined : {
          name: invoice.client?.name || '',
          email: invoice.client?.email || '',
          address: invoice.client?.address || '',
          postalCode: invoice.client?.postalCode || '',
          city: invoice.client?.city || '',
          phone: invoice.client?.phone || '',
          customerType: invoice.client?.type || 'b2c',
          siret: invoice.client?.siret || ''
        },
        items: invoice.items.map(item => ({
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

      // Only include invoiceNumber if it's explicitly provided (for updates, not creation)
      if (invoice.id || invoice.invoiceNumber) {
        payload.invoiceNumber = invoice.id || invoice.invoiceNumber;
      }

      console.log('[InvoiceService] Creating invoice with payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        console.error('Status:', response.status, response.statusText);
        throw new Error(`Failed to create invoice: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return this.transformInvoice(data);
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Update an existing invoice
   */
  static async updateInvoice(invoice: Invoice): Promise<void> {
    try {
      const payload = {
        date: invoice.date,
        dueDate: invoice.dueDate || null,
        paymentMethod: invoice.paymentMethod || 'Virement',
        status: invoice.status,
        notes: invoice.notes || '',
        client: invoice.client ? {
          name: invoice.client.name || '',
          email: invoice.client.email || '',
          address: invoice.client.address || '',
          postalCode: invoice.client.postalCode || '',
          city: invoice.client.city || '',
          phone: invoice.client.phone || '',
          customerType: invoice.client.type || 'b2c',
          siret: invoice.client.siret || ''
        } : undefined,
        items: invoice.items.map(item => ({
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

      const response = await fetch(`${API_URL}/${invoice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  /**
   * Delete an invoice
   */
  static async deleteInvoice(invoiceNumber: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${invoiceNumber}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  /**
   * Transform backend invoice data to frontend format
   */
  private static transformInvoice(data: any): Invoice {
    if (!data) {
      throw new Error('Cannot transform null or undefined invoice data');
    }

    // Parse vehicle info from string format "Brand Model - Registration", JSON string, or object
    const parseVehicleInfo = (vehicleInfoStr: string | object | null | undefined) => {
      // If it's already an object, return it as-is or with defaults
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
      id: data.invoiceNumber || data.invoice_number || data._id || `INV-${Date.now()}`,
      invoiceNumber: data.invoiceNumber || data.invoice_number,
      date: data.date,
      dueDate: data.dueDate || data.due_date || '',
      paymentMethod: data.paymentMethod || data.payment_method || 'Virement',
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
      items: (data.items || data.invoice_items || []).map((item: any) => {
        const vehicle = parseVehicleInfo(item.vehicleInfo || item.vehicle_info || '');
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
      company: data.company || data.company_info ? {
        id: (data.company || data.company_info)?.id || '',
        name: (data.company || data.company_info)?.name || '',
        companyName: (data.company || data.company_info)?.companyName || (data.company || data.company_info)?.name || '',
        owner: (data.company || data.company_info)?.owner || '',
        address: (data.company || data.company_info)?.address || '',
        postalCode: (data.company || data.company_info)?.postalCode || '',
        city: (data.company || data.company_info)?.city || '',
        phone: (data.company || data.company_info)?.phone || '',
        email: (data.company || data.company_info)?.email || '',
        siret: (data.company || data.company_info)?.siret || '',
        isSubjectToVat: (data.company || data.company_info)?.isSubjectToVat !== false
      } : {
        id: '',
        name: '',
        companyName: '',
        owner: '',
        address: '',
        postalCode: '',
        city: '',
        phone: '',
        email: '',
        siret: '',
        isSubjectToVat: true
      },
      amountHt: data.amountHt ? Number(data.amountHt) : undefined,
      amountTva: data.amountTva ? Number(data.amountTva) : undefined,
      amountTtc: data.amountTtc ? Number(data.amountTtc) : undefined
    };
  }
}

// Export helper functions for backward compatibility
export const getInvoices = () => InvoiceService.getAllInvoices();
export const getInvoiceById = (id: string) => InvoiceService.getInvoiceById(id);
export const createInvoice = (invoice: Invoice) => InvoiceService.createInvoice(invoice);
export const updateInvoice = (invoice: Invoice) => InvoiceService.updateInvoice(invoice);
export const deleteInvoice = (id: string) => InvoiceService.deleteInvoice(id);
