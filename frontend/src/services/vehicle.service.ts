const API_URL = '/api/vehicles';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration: string;
  client_id: string;
  company_id: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export class VehicleService {
  static async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }
  }

  static async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch vehicle');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      return null;
    }
  }

  static async getVehiclesByClientId(clientId: string): Promise<Vehicle[]> {
    try {
      const response = await fetch(`${API_URL}/client/${clientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client vehicles');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching client vehicles:', error);
      return [];
    }
  }

  static async getVehiclesByCompany(companyId: string): Promise<Vehicle[]> {
    try {
      const response = await fetch(`${API_URL}/company/${companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch company vehicles');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching company vehicles:', error);
      return [];
    }
  }

  static async getVehiclesByClientAndCompany(clientId: string, companyId: string): Promise<Vehicle[]> {
    try {
      const response = await fetch(`${API_URL}/client/${clientId}/company/${companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client vehicles by company');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching client vehicles by company:', error);
      return [];
    }
  }

  static async createVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle | null> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicle)
      });

      if (!response.ok) {
        throw new Error('Failed to create vehicle');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating vehicle:', error);
      return null;
    }
  }

  static async updateVehicle(id: string, vehicle: Partial<Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>>): Promise<Vehicle | null> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicle)
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to update vehicle');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return null;
    }
  }

  static async deleteVehicle(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }

      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return false;
    }
  }
}
