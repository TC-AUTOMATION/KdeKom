import {
  URSSAFDeclaration,
  URSSAFCalculation,
  URSSAF_RATES,
  URSSAF_THRESHOLDS,
  URSSAFSummary,
} from '../types/urssaf';
import { Invoice } from '../types/invoice';
import { URSSAFDataService } from './urssafData.service';

/**
 * URSSAF Service - Calcul des cotisations sociales pour micro-entrepreneurs
 *
 * Les micro-entrepreneurs doivent déclarer leur chiffre d'affaires et payer des cotisations sociales
 * Les taux varient selon le type d'activité:
 * - 21.2% pour les prestations de services commerciales/artisanales
 * - 12.3% pour la vente de marchandises
 * - 21.8% pour les professions libérales (CIPAV)
 */
export class URSSAFService {
  /**
   * Calculate URSSAF contributions for a given period
   * @param startDate Start of the period
   * @param endDate End of the period
   * @param invoices List of invoices in the period
   * @returns URSSAF calculation with contributions breakdown
   */
  static calculateURSSAF(
    startDate: Date,
    endDate: Date,
    invoices: Invoice[], urssafRate: number = 21.2
  ): URSSAFCalculation {
    // Filter invoices within the period and that are paid (contributions only on received revenue)
    const periodInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.date);
      return (
        invDate >= startDate &&
        invDate <= endDate &&
        inv.status === 'paid' // Only paid invoices count for URSSAF
      );
    });

    // Calculate total revenue from invoices
    // For this implementation, we assume all revenue is from services (BIC)
    // In a real scenario, you would categorize invoices by activity type
    let totalServices = 0;
    let totalMarchandises = 0;

    periodInvoices.forEach((invoice) => {
      // Calculate invoice total
      const invoiceTotal = invoice.items.reduce((total, item) => {
        // Skip items with invalid quantity or unitPrice
        if (!item.quantity || !item.unitPrice || isNaN(item.quantity) || isNaN(item.unitPrice)) {
          console.warn('URSSAF: Skipping invalid item:', {
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          });
          return total;
        }

        const itemSubtotal = item.quantity * item.unitPrice;
        const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100;
        const itemTaxable = itemSubtotal - itemDiscount;
        const itemTax = (itemTaxable * item.taxRate) / 100;
        return total + itemTaxable + itemTax;
      }, 0);

      // For now, categorize all as services
      // TODO: Add activity type field to invoices to distinguish services vs goods
      totalServices += invoiceTotal;
    });

    const totalRevenue = totalServices + totalMarchandises;

    // Calculate contributions based on rates
    const cotisationsServices = totalServices * (urssafRate / 100);
    const cotisationsMarchandises = totalMarchandises * URSSAF_RATES.MARCHANDISES_BIC;
    const cotisationsTotal = cotisationsServices + cotisationsMarchandises;

    // Format period string
    const period = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      invoices: {
        count: periodInvoices.length,
        totalServices,
        totalMarchandises,
        totalRevenue,
      },
      rates: {
        services: urssafRate / 100,
        marchandises: URSSAF_RATES.MARCHANDISES_BIC,
      },
      cotisationsServices,
      cotisationsMarchandises,
      cotisationsTotal,
    };
  }

  /**
   * Get all URSSAF declarations from the database
   * @returns List of URSSAF declarations sorted by period (most recent first)
   */
  static async getDeclarations(): Promise<URSSAFDeclaration[]> {
    return URSSAFDataService.getDeclarations();
  }

  /**
   * Get a single URSSAF declaration by ID
   * @param id Declaration ID
   * @returns URSSAF declaration or undefined if not found
   */
  static async getDeclarationById(id: string): Promise<URSSAFDeclaration | undefined> {
    return URSSAFDataService.getDeclarationById(id);
  }

  /**
   * Create a new URSSAF declaration
   * @param declaration Declaration data without id
   * @returns Created declaration
   */
  static async createDeclaration(
    declaration: Omit<URSSAFDeclaration, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<URSSAFDeclaration> {
    return URSSAFDataService.createDeclaration(declaration);
  }

  /**
   * Update an existing URSSAF declaration
   * @param id Declaration ID
   * @param updates Partial declaration data to update
   * @returns Updated declaration
   */
  static async updateDeclaration(
    id: string,
    updates: Partial<URSSAFDeclaration>
  ): Promise<URSSAFDeclaration> {
    return URSSAFDataService.updateDeclaration(id, updates);
  }

  /**
   * Delete an URSSAF declaration
   * @param id Declaration ID
   */
  static async deleteDeclaration(id: string): Promise<void> {
    return URSSAFDataService.deleteDeclaration(id);
  }

  /**
   * Get period bounds for monthly or quarterly declarations
   * @param year Year
   * @param month Month (1-12) or quarter (1-4) depending on type
   * @param type Period type (monthly or quarterly)
   * @returns Start and end dates with formatted period string
   */
  static getPeriodBounds(
    year: number,
    month: number,
    type: 'monthly' | 'quarterly'
  ): { start: Date; end: Date; period: string } {
    if (type === 'monthly') {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month
      const period = `${year}-${String(month).padStart(2, '0')}`;
      return { start, end, period };
    } else {
      // Quarterly
      const startMonth = (month - 1) * 3; // Q1=0, Q2=3, Q3=6, Q4=9
      const endMonth = startMonth + 3;
      const start = new Date(year, startMonth, 1);
      const end = new Date(year, endMonth, 0, 23, 59, 59, 999);
      const period = `${year}-Q${month}`;
      return { start, end, period };
    }
  }

  /**
   * Calculate URSSAF summary for a given year
   * @param year Year to calculate summary for
   * @param invoices All invoices
   * @param declarations All URSSAF declarations
   * @returns URSSAF summary with totals and threshold tracking
   */
  static calculateYearSummary(
    year: number,
    invoices: Invoice[],
    declarations: URSSAFDeclaration[]
  ): URSSAFSummary {
    // Filter paid invoices for the year
    const yearInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.date);
      return invDate.getFullYear() === year && inv.status === 'paid';
    });

    // Calculate total revenue
    let totalRevenue = 0;
    let revenueServices = 0;
    let revenueMarchandises = 0;

    yearInvoices.forEach((invoice) => {
      const invoiceTotal = invoice.items.reduce((total, item) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemDiscount = (itemSubtotal * item.discount) / 100;
        const itemTaxable = itemSubtotal - itemDiscount;
        const itemTax = (itemTaxable * item.taxRate) / 100;
        return total + itemTaxable + itemTax;
      }, 0);

      totalRevenue += invoiceTotal;
      // For now, categorize all as services
      revenueServices += invoiceTotal;
    });

    // Filter declarations for the year
    const yearDeclarations = declarations.filter((decl) => {
      const declDate = new Date(decl.startDate);
      return declDate.getFullYear() === year;
    });

    // Calculate total contributions from declarations
    const totalCotisations = yearDeclarations.reduce(
      (sum, decl) => sum + decl.cotisationsTotal,
      0
    );

    // Count declaration statuses
    const declarationStats = {
      total: yearDeclarations.length,
      submitted: yearDeclarations.filter((d) => d.status === 'submitted' || d.status === 'paid')
        .length,
      paid: yearDeclarations.filter((d) => d.status === 'paid').length,
      pending: yearDeclarations.filter((d) => d.status === 'draft').length,
    };

    // Determine threshold type based on activity (for now, assume services)
    const thresholdType = 'SERVICES_BIC';
    const threshold = URSSAF_THRESHOLDS[thresholdType];
    const remainingBeforeThreshold = Math.max(0, threshold - totalRevenue);
    const thresholdReached = totalRevenue >= threshold;

    return {
      year,
      totalRevenue,
      totalCotisations,
      revenueServices,
      revenueMarchandises,
      remainingBeforeThreshold,
      thresholdType,
      thresholdReached,
      declarations: declarationStats,
    };
  }
}
