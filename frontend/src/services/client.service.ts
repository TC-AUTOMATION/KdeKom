const API_URL = '/api/clients';

export type CustomerType = 'b2b' | 'b2c';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  customer_type: CustomerType;
  siret?: string; // Obligatoire pour les clients B2B
  company_id?: string;
  company?: {
    id: string;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export class ClientService {
  // Map database fields to client interface (keeps customer_type from DB)
  private static mapDbToClient(dbClient: any): Client {
    return {
      ...dbClient,
      customer_type: dbClient.customer_type || dbClient.customerType || 'b2c',
      postalCode: dbClient.postalCode || dbClient.postalCode,
    };
  }

  // Map client to invoice client format (customer_type -> type, postal_code -> postalCode)
  static toInvoiceClient(client: any): any {
    // Handle both database format (postal_code, customer_type) and app format
    const postalCode = client.postalCode || client.postalCode || '';
    const type = client.type || client.customer_type || 'b2c';
    const siret = client.siret || '';

    return {
      id: client.id,
      name: client.name,
      address: client.address,
      postalCode: postalCode,
      city: client.city,
      email: client.email,
      phone: client.phone,
      type: type,
      siret: siret
    };
  }

  static async getAllClients(): Promise<Client[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      return data.map(this.mapDbToClient);
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  static async getClientsByCompany(companyId: string): Promise<Client[]> {
    try {
      const response = await fetch(`${API_URL}/company/${companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch clients by company');
      }
      const data = await response.json();
      return data.map(this.mapDbToClient);
    } catch (error) {
      console.error('Error fetching clients by company:', error);
      return [];
    }
  }

  static async getClientById(id: string): Promise<Client | null> {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch client');
      }
      const data = await response.json();
      return this.mapDbToClient(data);
    } catch (error) {
      console.error('Error fetching client:', error);
      return null;
    }
  }

  static async createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          postalCode: client.postalCode,
          city: client.city,
          customerType: client.customer_type,
          siret: client.siret,
          companyId: client.company_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create client');
      }

      const data = await response.json();
      return this.mapDbToClient(data);
    } catch (error) {
      console.error('Error creating client:', error);
      return null;
    }
  }

  static async updateClient(id: string, client: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<Client | null> {
    try {
      const updateData: any = {};
      if (client.name !== undefined) updateData.name = client.name;
      if (client.email !== undefined) updateData.email = client.email;
      if (client.phone !== undefined) updateData.phone = client.phone;
      if (client.address !== undefined) updateData.address = client.address;
      if (client.postalCode !== undefined) updateData.postalCode = client.postalCode;
      if (client.city !== undefined) updateData.city = client.city;
      if (client.customer_type !== undefined) updateData.customerType = client.customer_type;
      if (client.siret !== undefined) updateData.siret = client.siret;
      if (client.company_id !== undefined) updateData.companyId = client.company_id;

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update client');
      }

      const data = await response.json();
      return this.mapDbToClient(data);
    } catch (error) {
      console.error('Error updating client:', error);
      return null;
    }
  }

  static async deleteClient(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 400) {
          // Client has associated invoices or quotes
          const error = await response.json();
          console.error('Cannot delete client:', error);
          throw new Error(error.error || 'Cannot delete client with existing invoices or quotes');
        }
        throw new Error('Failed to delete client');
      }

      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error; // Re-throw to allow the UI to handle it
    }
  }
}
