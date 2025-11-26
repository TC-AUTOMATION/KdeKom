/**
 * Service pour gérer les déclarations URSSAF via l'API REST backend
 * Contient uniquement les opérations de lecture/écriture en base de données
 */

import { URSSAFDeclaration } from '../types/urssaf';

const API_URL = '/api/urssaf/declarations';

export class URSSAFDataService {
  /**
   * Transform database row to URSSAFDeclaration type
   */
  private static transformDeclaration(data: any): URSSAFDeclaration {
    return {
      id: data.id,
      period: data.period,
      periodType: data.period_type,
      startDate: data.start_date,
      endDate: data.end_date,
      chiffreAffairesTotal: Number(data.chiffre_affaires_total),
      chiffreAffairesServices: Number(data.chiffre_affaires_services),
      chiffreAffairesMarchandises: Number(data.chiffre_affaires_marchandises),
      cotisationsServices: Number(data.cotisations_services),
      cotisationsMarchandises: Number(data.cotisations_marchandises),
      cotisationsTotal: Number(data.cotisations_total),
      status: data.status,
      submittedDate: data.submitted_date,
      paidDate: data.paid_date,
      companyId: data.company_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Transform URSSAFDeclaration to database format
   */
  private static toDatabase(declaration: Partial<URSSAFDeclaration>): any {
    const result: any = {};

    if (declaration.period !== undefined) result.period = declaration.period;
    if (declaration.periodType !== undefined) result.period_type = declaration.periodType;
    if (declaration.startDate !== undefined) result.start_date = declaration.startDate;
    if (declaration.endDate !== undefined) result.end_date = declaration.endDate;
    if (declaration.chiffreAffairesTotal !== undefined)
      result.chiffre_affaires_total = declaration.chiffreAffairesTotal;
    if (declaration.chiffreAffairesServices !== undefined)
      result.chiffre_affaires_services = declaration.chiffreAffairesServices;
    if (declaration.chiffreAffairesMarchandises !== undefined)
      result.chiffre_affaires_marchandises = declaration.chiffreAffairesMarchandises;
    if (declaration.cotisationsServices !== undefined)
      result.cotisations_services = declaration.cotisationsServices;
    if (declaration.cotisationsMarchandises !== undefined)
      result.cotisations_marchandises = declaration.cotisationsMarchandises;
    if (declaration.cotisationsTotal !== undefined)
      result.cotisations_total = declaration.cotisationsTotal;
    if (declaration.status !== undefined) result.status = declaration.status;
    if (declaration.submittedDate !== undefined) result.submitted_date = declaration.submittedDate;
    if (declaration.paidDate !== undefined) result.paid_date = declaration.paidDate;
    if (declaration.companyId !== undefined) result.company_id = declaration.companyId;

    return result;
  }

  /**
   * Get all URSSAF declarations from the database
   * @param companyId Optional company ID filter
   * @returns List of URSSAF declarations sorted by period (most recent first)
   */
  static async getDeclarations(companyId?: string): Promise<URSSAFDeclaration[]> {
    try {
      const params = companyId ? `?company_id=${companyId}` : '';
      const response = await fetch(`${API_URL}${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch URSSAF declarations');
      }

      const data = await response.json();
      return data.map((row: any) => this.transformDeclaration(row));
    } catch (error) {
      console.error('Error fetching URSSAF declarations:', error);
      return [];
    }
  }

  /**
   * Get a single URSSAF declaration by ID
   * @param id Declaration ID
   * @returns URSSAF declaration or undefined if not found
   */
  static async getDeclarationById(id: string): Promise<URSSAFDeclaration | undefined> {
    try {
      const response = await fetch(`${API_URL}/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error('Failed to fetch URSSAF declaration');
      }

      const data = await response.json();
      return this.transformDeclaration(data);
    } catch (error) {
      console.error('Error fetching URSSAF declaration:', error);
      return undefined;
    }
  }

  /**
   * Create a new URSSAF declaration
   * @param declaration Declaration data without id
   * @returns Created declaration
   */
  static async createDeclaration(
    declaration: Omit<URSSAFDeclaration, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<URSSAFDeclaration> {
    try {
      const payload = this.toDatabase(declaration);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create URSSAF declaration');
      }

      const data = await response.json();
      return this.transformDeclaration(data);
    } catch (error) {
      console.error('Error creating URSSAF declaration:', error);
      throw new Error('Failed to create URSSAF declaration');
    }
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
    try {
      const payload = this.toDatabase(updates);

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update URSSAF declaration');
      }

      const data = await response.json();
      return this.transformDeclaration(data);
    } catch (error) {
      console.error('Error updating URSSAF declaration:', error);
      throw new Error('Failed to update URSSAF declaration');
    }
  }

  /**
   * Delete an URSSAF declaration
   * @param id Declaration ID
   */
  static async deleteDeclaration(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete URSSAF declaration');
      }
    } catch (error) {
      console.error('Error deleting URSSAF declaration:', error);
      throw new Error('Failed to delete URSSAF declaration');
    }
  }
}
