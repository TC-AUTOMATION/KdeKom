import { TVADeclaration, TVACalculation, DEFAULT_TVA_RATE } from '../types/tva';
import { Invoice } from '../types/invoice';
import { Charge } from '../types/charge';

const API_URL = '/api';

export class TVAService {
  // Calculate TVA for a given period
  static calculateTVA(
    startDate: Date,
    endDate: Date,
    invoices: Invoice[],
    charges: Charge[]
  ): TVACalculation {
    console.log('TVA Calculation:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalInvoices: invoices.length
    });

    console.log('All invoices received:', invoices.map(inv => ({
      id: inv.id,
      date: inv.date,
      status: inv.status,
      amountTtc: inv.amountTtc
    })));

    // Filter invoices in the period (all statuses except cancelled and draft)
    // TVA is due when invoice is issued, not when it's paid
    const periodInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      const inPeriod = invDate >= startDate && invDate <= endDate;
      const validStatus = inv.status !== 'cancelled' && inv.status !== 'draft';

      console.log('Checking invoice:', {
        id: inv.id,
        date: inv.date,
        invDate: invDate.toISOString(),
        status: inv.status,
        inPeriod,
        validStatus,
        included: inPeriod && validStatus
      });

      return inPeriod && validStatus;
    });

    console.log('Period invoices found:', periodInvoices.length, periodInvoices.map(i => ({
      id: i.id,
      date: i.date,
      status: i.status,
      items: i.items.length
    })));

    // Calculate TVA collectée (collected from invoices)
    // Each invoice item has its own tax rate
    let invoiceTotalHT = 0;
    let invoiceTotalTVA = 0;

    periodInvoices.forEach(inv => {
      inv.items.forEach(item => {
        // Skip items with invalid quantity or unitPrice
        if (!item.quantity || !item.unitPrice || isNaN(item.quantity) || isNaN(item.unitPrice)) {
          console.warn('Skipping invalid item:', {
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          });
          return;
        }

        const itemTotal = item.quantity * item.unitPrice;
        const discountAmount = (itemTotal * (item.discount || 0)) / 100;
        const itemHT = itemTotal - discountAmount;
        const itemTVA = (itemHT * item.taxRate) / 100;

        console.log('Item TVA:', {
          description: item.description,
          itemHT,
          taxRate: item.taxRate,
          itemTVA
        });

        invoiceTotalHT += itemHT;
        invoiceTotalTVA += itemTVA;
      });
    });

    console.log('Total TVA collectée:', { invoiceTotalHT, invoiceTotalTVA });

    // Filtrer les charges dans la période et assujettis à la TVA
    const periodCharges = charges.filter(charge => {
      const chargeDate = new Date(charge.date);
      const inPeriod = chargeDate >= startDate && chargeDate <= endDate;
      return inPeriod && charge.isSubjectToTva;
    });

    console.log('Period charges found:', periodCharges.length);

    // Calculer la TVA déductible (TVA sur les achats/charges)
    let chargesTotalHT = 0;
    let chargesTotalTVA = 0;

    periodCharges.forEach(charge => {
      // Si amountHt et tvaAmount sont définis, les utiliser
      // Sinon, calculer à partir du montant TTC et du taux
      let chargeHT = charge.amountHt || 0;
      let chargeTVA = charge.tvaAmount || 0;

      if (!charge.amountHt && charge.tvaRate > 0) {
        // Calculer HT et TVA à partir du TTC
        chargeHT = charge.amount / (1 + charge.tvaRate / 100);
        chargeTVA = charge.amount - chargeHT;
      } else if (!charge.amountHt) {
        chargeHT = charge.amount;
        chargeTVA = 0;
      }

      console.log('Charge TVA:', {
        description: charge.description,
        chargeHT,
        tvaRate: charge.tvaRate,
        chargeTVA
      });

      chargesTotalHT += chargeHT;
      chargesTotalTVA += chargeTVA;
    });

    console.log('Total TVA déductible:', { chargesTotalHT, chargesTotalTVA });

    // TVA calculation based on invoiced amounts (not paid)
    // In France, TVA is due when the invoice is issued (fait générateur)
    // TVA deductible is from charges (expenses with recoverable VAT)
    const tvaCollectee = invoiceTotalTVA;
    const tvaDeductible = chargesTotalTVA;
    const tvaNetDue = tvaCollectee - tvaDeductible;

    return {
      period: `${startDate.toISOString().substring(0, 7)} - ${endDate.toISOString().substring(0, 7)}`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      invoices: {
        count: periodInvoices.length,
        totalHT: invoiceTotalHT,
        totalTVA: invoiceTotalTVA
      },
      charges: {
        count: periodCharges.length,
        totalHT: chargesTotalHT,
        totalTVA: chargesTotalTVA
      },
      tvaCollectee,
      tvaDeductible,
      tvaNetDue
    };
  }

  // Get all declarations
  static async getDeclarations(): Promise<TVADeclaration[]> {
    try {
      const response = await fetch(`${API_URL}/tva/declarations`);
      if (!response.ok) throw new Error('Failed to fetch TVA declarations');
      const data = await response.json();

      // Convert snake_case to camelCase
      return data.map((d: any) => ({
        id: d.id,
        period: d.period,
        periodType: d.period_type,
        startDate: d.start_date,
        endDate: d.end_date,
        tvaCollectee: parseFloat(d.tva_collectee),
        tvaDeductible: parseFloat(d.tva_deductible),
        tvaNetDue: parseFloat(d.tva_net_due),
        status: d.status,
        submittedDate: d.submitted_date,
        paidDate: d.paid_date,
        companyId: d.company_id,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }));
    } catch (error) {
      console.error('Error loading TVA declarations:', error);
      return [];
    }
  }

  // Get declaration by ID
  static async getDeclaration(id: string): Promise<TVADeclaration | undefined> {
    try {
      const response = await fetch(`${API_URL}/tva/declarations/${id}`);
      if (!response.ok) return undefined;
      const d = await response.json();

      return {
        id: d.id,
        period: d.period,
        periodType: d.period_type,
        startDate: d.start_date,
        endDate: d.end_date,
        tvaCollectee: parseFloat(d.tva_collectee),
        tvaDeductible: parseFloat(d.tva_deductible),
        tvaNetDue: parseFloat(d.tva_net_due),
        status: d.status,
        submittedDate: d.submitted_date,
        paidDate: d.paid_date,
        companyId: d.company_id,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      };
    } catch (error) {
      console.error('Error loading TVA declaration:', error);
      return undefined;
    }
  }

  // Create declaration
  static async createDeclaration(declaration: Omit<TVADeclaration, 'id' | 'createdAt' | 'updatedAt'>): Promise<TVADeclaration> {
    try {
      const response = await fetch(`${API_URL}/tva/declarations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(declaration)
      });

      if (!response.ok) throw new Error('Failed to create TVA declaration');
      const d = await response.json();

      return {
        id: d.id,
        period: d.period,
        periodType: d.period_type,
        startDate: d.start_date,
        endDate: d.end_date,
        tvaCollectee: parseFloat(d.tva_collectee),
        tvaDeductible: parseFloat(d.tva_deductible),
        tvaNetDue: parseFloat(d.tva_net_due),
        status: d.status,
        submittedDate: d.submitted_date,
        paidDate: d.paid_date,
        companyId: d.company_id,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      };
    } catch (error) {
      console.error('Error creating TVA declaration:', error);
      throw error;
    }
  }

  // Update declaration
  static async updateDeclaration(id: string, updates: Partial<TVADeclaration>): Promise<TVADeclaration> {
    try {
      const response = await fetch(`${API_URL}/tva/declarations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update TVA declaration');
      const d = await response.json();

      return {
        id: d.id,
        period: d.period,
        periodType: d.period_type,
        startDate: d.start_date,
        endDate: d.end_date,
        tvaCollectee: parseFloat(d.tva_collectee),
        tvaDeductible: parseFloat(d.tva_deductible),
        tvaNetDue: parseFloat(d.tva_net_due),
        status: d.status,
        submittedDate: d.submitted_date,
        paidDate: d.paid_date,
        companyId: d.company_id,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      };
    } catch (error) {
      console.error('Error updating TVA declaration:', error);
      throw error;
    }
  }

  // Delete declaration
  static async deleteDeclaration(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/tva/declarations/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete TVA declaration');
    } catch (error) {
      console.error('Error deleting TVA declaration:', error);
      throw error;
    }
  }

  // Get period bounds for monthly/quarterly
  static getPeriodBounds(year: number, month: number, type: 'monthly' | 'quarterly'): { start: Date; end: Date; period: string } {
    if (type === 'monthly') {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);
      const period = `${year}-${String(month + 1).padStart(2, '0')}`;
      return { start, end, period };
    } else {
      // Quarterly
      const quarter = Math.floor(month / 3);
      const startMonth = quarter * 3;
      const start = new Date(year, startMonth, 1);
      const end = new Date(year, startMonth + 3, 0, 23, 59, 59);
      const period = `${year}-Q${quarter + 1}`;
      return { start, end, period };
    }
  }

  // Check if declaration exists for period
  static async declarationExistsForPeriod(period: string, companyId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/tva/declarations/exists?period=${period}&companyId=${companyId}`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking TVA declaration:', error);
      return false;
    }
  }
}
