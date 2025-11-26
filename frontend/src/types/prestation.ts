export interface CustomerPrestation {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  unitPrice: number;
  taxRate: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerPrestationInput {
  clientId: string;
  name: string;
  description?: string;
  unitPrice: number;
  taxRate: number;
  isActive: boolean;
}

// Global prestations (not client-specific)
export interface Prestation {
  id: string;
  name: string;
  description?: string;
  price_b2b: number;
  price_b2c: number;
  tax_rate: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PrestationInput {
  name: string;
  description?: string;
  price_b2b: number;
  price_b2c: number;
  tax_rate: number;
  is_active: boolean;
}
