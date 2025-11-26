import { Invoice } from '../types/invoice';
import { Quote } from '../types/quote';
import { InvoiceService } from './invoice.service';

const API_BASE_URL = '/api';

export class ApiService {
  /**
   * Récupérer toutes les factures
   */
  static async getAllInvoices(): Promise<Invoice[]> {
    try {
      return await InvoiceService.getAllInvoices();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  /**
   * Récupérer une facture par son ID
   */
  static async getInvoiceById(id: string): Promise<Invoice | null> {
    try {
      const invoice = await InvoiceService.getInvoiceById(id);
      return invoice || null;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  }

  /**
   * Récupérer les factures récentes
   */
  static async getRecentInvoices(): Promise<Invoice[]> {
    try {
      const invoices = await InvoiceService.getAllInvoices();
      return invoices
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching recent invoices:', error);
      return [];
    }
  }

  /**
   * Créer une nouvelle facture
   */
  static async createInvoice(invoice: Invoice): Promise<Invoice | null> {
    try {
      await InvoiceService.createInvoice(invoice);
      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'une facture
   */
  static async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice | null> {
    try {
      // Use the specific status update route
      const response = await fetch(`/api/invoices/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice status');
      }

      // Fetch the updated invoice
      const updated = await InvoiceService.getInvoiceById(id);
      return updated;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      return null;
    }
  }

  /**
   * Envoyer une facture (changer son statut à "sent")
   */
  static async sendInvoice(id: string): Promise<Invoice | null> {
    try {
      return await this.updateInvoiceStatus(id, 'sent');
    } catch (error) {
      console.error('Error sending invoice:', error);
      return null;
    }
  }

  /**
   * Dupliquer une facture
   */
  static async duplicateInvoice(id: string): Promise<Invoice | null> {
    try {
      const invoice = await InvoiceService.getInvoiceById(id);
      if (!invoice) throw new Error('Invoice not found');

      const newInvoice = {
        ...invoice,
        id: `${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`,
        date: new Date().toISOString().split('T')[0],
        status: 'draft' as const
      };

      await InvoiceService.createInvoice(newInvoice);
      return newInvoice;
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      return null;
    }
  }

  /**
   * Récupérer les statistiques du dashboard
   */
  static async getDashboardStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalInvoices: 0,
        totalAmount: 0,
        paidCount: 0,
        sentCount: 0,
        draftCount: 0,
        overdueCount: 0,
        monthlyRevenue: Array(12).fill(0),
      };
    }
  }

  /**
   * Générer le PDF d'une facture
   */
  static getInvoicePDFUrl(id: string): string {
    return `${API_BASE_URL}/invoices/${id}/pdf`;
  }

  /**
   * Générer le PDF d'une facture à partir des données
   */
  static async generateInvoicePDF(invoice: Invoice): Promise<Blob | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  }

  /**
   * Mettre à jour le statut d'un devis
   */
  static async updateQuoteStatus(id: string, status: Quote['status']): Promise<Quote | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quote status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating quote status:', error);
      return null;
    }
  }
}
