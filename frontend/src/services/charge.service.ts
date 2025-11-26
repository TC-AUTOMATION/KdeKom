import { Charge, ChargeCreateInput, ChargeUpdateInput } from '../types/charge';

const API_URL = '/api/charges';

export const ChargeService = {
  async getAllCharges(): Promise<Charge[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch charges');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching charges:', error);
      throw error;
    }
  },

  async getChargeById(id: string): Promise<Charge> {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch charge');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching charge:', error);
      throw error;
    }
  },

  async createCharge(charge: ChargeCreateInput): Promise<Charge> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(charge),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.detail || errorData.error || 'Failed to create charge';
        throw new Error(errorMessage);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating charge:', error);
      throw error;
    }
  },

  async updateCharge(charge: ChargeUpdateInput): Promise<Charge> {
    try {
      const response = await fetch(`${API_URL}/${charge.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(charge),
      });
      if (!response.ok) {
        throw new Error('Failed to update charge');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating charge:', error);
      throw error;
    }
  },

  async deleteCharge(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete charge');
      }
    } catch (error) {
      console.error('Error deleting charge:', error);
      throw error;
    }
  },

  async getChargesByDateRange(startDate: string, endDate: string): Promise<Charge[]> {
    try {
      const response = await fetch(`${API_URL}?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch charges by date range');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching charges by date range:', error);
      throw error;
    }
  },

  async getChargesByCategory(category: string): Promise<Charge[]> {
    try {
      const response = await fetch(`${API_URL}?category=${category}`);
      if (!response.ok) {
        throw new Error('Failed to fetch charges by category');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching charges by category:', error);
      throw error;
    }
  },
};
