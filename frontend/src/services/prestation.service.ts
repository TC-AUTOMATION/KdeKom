import { CustomerPrestation, CustomerPrestationInput, Prestation, PrestationInput } from '../types/prestation';

const API_URL = '/api/prestations';
const CUSTOMER_API_URL = '/api/customer-prestations';

export class PrestationService {
  // ========== GLOBAL PRESTATIONS ==========

  static async getAllPrestations(): Promise<Prestation[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch prestations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching prestations:', error);
      throw error;
    }
  }

  static async createPrestation(prestation: PrestationInput): Promise<Prestation> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prestation)
      });

      if (!response.ok) {
        throw new Error('Failed to create prestation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating prestation:', error);
      throw error;
    }
  }

  static async updatePrestation(id: string, prestation: Partial<PrestationInput>): Promise<Prestation> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prestation)
      });

      if (!response.ok) {
        throw new Error('Failed to update prestation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating prestation:', error);
      throw error;
    }
  }

  static async deletePrestation(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete prestation');
      }
    } catch (error) {
      console.error('Error deleting prestation:', error);
      throw error;
    }
  }

  static async togglePrestationStatus(id: string, isActive: boolean): Promise<Prestation> {
    try {
      const response = await fetch(`${API_URL}/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle prestation status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling prestation status:', error);
      throw error;
    }
  }

  // ========== CUSTOMER PRESTATIONS ==========

  static async getCustomerPrestations(clientId: string): Promise<CustomerPrestation[]> {
    try {
      const response = await fetch(`${CUSTOMER_API_URL}/${clientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer prestations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching customer prestations:', error);
      throw error;
    }
  }

  static async getActiveCustomerPrestations(clientId: string): Promise<CustomerPrestation[]> {
    try {
      const response = await fetch(`${CUSTOMER_API_URL}/${clientId}?activeOnly=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch active customer prestations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching active customer prestations:', error);
      throw error;
    }
  }

  static async createCustomerPrestation(prestation: CustomerPrestationInput): Promise<CustomerPrestation> {
    try {
      const response = await fetch(CUSTOMER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prestation)
      });

      if (!response.ok) {
        throw new Error('Failed to create customer prestation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating customer prestation:', error);
      throw error;
    }
  }

  static async updateCustomerPrestation(id: string, prestation: Partial<CustomerPrestationInput>): Promise<CustomerPrestation> {
    try {
      const response = await fetch(`${CUSTOMER_API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prestation)
      });

      if (!response.ok) {
        throw new Error('Failed to update customer prestation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating customer prestation:', error);
      throw error;
    }
  }

  static async deleteCustomerPrestation(id: string): Promise<void> {
    try {
      const response = await fetch(`${CUSTOMER_API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer prestation');
      }
    } catch (error) {
      console.error('Error deleting customer prestation:', error);
      throw error;
    }
  }

  static async toggleCustomerPrestationStatus(id: string, isActive: boolean): Promise<CustomerPrestation> {
    try {
      const response = await fetch(`${CUSTOMER_API_URL}/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle customer prestation status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling customer prestation status:', error);
      throw error;
    }
  }
}
