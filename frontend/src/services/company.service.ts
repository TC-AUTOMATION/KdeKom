const API_URL = '/api/companies';

export interface Company {
  id: string;
  name: string; // Nom commercial
  companyName: string; // Raison sociale
  owner: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  siret: string;
  isSubjectToVat?: boolean; // Whether the company is subject to VAT
  urssafRate?: number; // URSSAF contribution rate for micro-entrepreneurs
  isMicroEntrepreneur?: boolean; // Whether the company is under micro-entrepreneur regime
}

export class CompanyService {
  /**
   * Récupérer toutes les entreprises
   */
  static async getAllCompanies(): Promise<Company[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }

  /**
   * Récupérer une entreprise par son ID
   */
  static async getCompanyById(id: string): Promise<Company | null> {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch company');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  }

  /**
   * Créer une nouvelle entreprise
   */
  static async createCompany(companyData: Omit<Company, 'id'>): Promise<Company | null> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });

      if (!response.ok) {
        throw new Error('Failed to create company');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating company:', error);
      return null;
    }
  }

  /**
   * Mettre à jour une entreprise existante
   */
  static async updateCompany(id: string, companyData: Partial<Omit<Company, 'id'>>): Promise<Company | null> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });

      if (!response.ok) {
        throw new Error('Failed to update company');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating company:', error);
      return null;
    }
  }

  /**
   * Supprimer une entreprise
   */
  static async deleteCompany(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete company');
      }

      return true;
    } catch (error) {
      console.error('Error deleting company:', error);
      return false;
    }
  }
}
