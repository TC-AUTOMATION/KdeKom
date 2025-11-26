/**
 * Service pour gérer les packages de tarification via l'API REST
 */

const API_URL = '/api/packages';

// ===== TYPES =====

export interface TarificationPackage {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackageItem {
  id: string;
  package_id: string;
  name: string;
  description?: string;
  default_price: number;
  tax_rate: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PackageWithItems extends TarificationPackage {
  items: PackageItem[];
}

// ===== PACKAGES =====

export class TarificationService {
  /**
   * Récupérer tous les packages d'une entreprise
   */
  static async getPackages(companyId: string, activeOnly?: boolean): Promise<TarificationPackage[]> {
    try {
      const params = new URLSearchParams({ company_id: companyId });
      if (activeOnly !== undefined) {
        params.append('is_active', String(activeOnly));
      }

      const response = await fetch(`${API_URL}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching packages:', error);
      return [];
    }
  }

  /**
   * Récupérer uniquement les packages actifs
   */
  static async getActivePackages(companyId: string): Promise<TarificationPackage[]> {
    return this.getPackages(companyId, true);
  }

  /**
   * Récupérer un package avec ses items
   */
  static async getPackageWithItems(packageId: string): Promise<PackageWithItems | null> {
    try {
      const response = await fetch(`${API_URL}/${packageId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch package with items');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching package with items:', error);
      return null;
    }
  }

  /**
   * Créer un nouveau package
   */
  static async createPackage(data: {
    company_id: string;
    name: string;
    description?: string;
    is_active?: boolean;
  }): Promise<TarificationPackage | null> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to create package');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un package
   */
  static async updatePackage(
    packageId: string,
    data: {
      name?: string;
      description?: string;
      is_active?: boolean;
    }
  ): Promise<TarificationPackage | null> {
    try {
      const response = await fetch(`${API_URL}/${packageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update package');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  }

  /**
   * Supprimer un package
   */
  static async deletePackage(packageId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${packageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete package');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  }

  /**
   * Activer/désactiver un package
   */
  static async togglePackageStatus(packageId: string, isActive: boolean): Promise<TarificationPackage | null> {
    try {
      const response = await fetch(`${API_URL}/${packageId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle package status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling package status:', error);
      throw error;
    }
  }

  // ===== PACKAGE ITEMS =====

  /**
   * Récupérer tous les items d'un package
   */
  static async getPackageItems(packageId: string): Promise<PackageItem[]> {
    try {
      const response = await fetch(`${API_URL}/${packageId}/items`);
      if (!response.ok) {
        throw new Error('Failed to fetch package items');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching package items:', error);
      return [];
    }
  }

  /**
   * Créer un nouvel item dans un package
   */
  static async createPackageItem(
    packageId: string,
    data: {
      name: string;
      description?: string;
      default_price: number;
      tax_rate: number;
      sort_order?: number;
    }
  ): Promise<PackageItem | null> {
    try {
      const response = await fetch(`${API_URL}/${packageId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to create package item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating package item:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un item d'un package
   */
  static async updatePackageItem(
    packageId: string,
    itemId: string,
    data: {
      name?: string;
      description?: string;
      default_price?: number;
      tax_rate?: number;
      sort_order?: number;
    }
  ): Promise<PackageItem | null> {
    try {
      const response = await fetch(`${API_URL}/${packageId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update package item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating package item:', error);
      throw error;
    }
  }

  /**
   * Supprimer un item d'un package
   */
  static async deletePackageItem(packageId: string, itemId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${packageId}/items/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete package item');
      }
    } catch (error) {
      console.error('Error deleting package item:', error);
      throw error;
    }
  }

  // ===== CUSTOMER IMPORT =====

  /**
   * Copier un package vers un client
   */
  static async copyPackageToCustomer(
    packageId: string,
    clientId: string
  ): Promise<{ success: boolean; count: number }> {
    try {
      const response = await fetch(`${API_URL}/${packageId}/copy-to-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId })
      });

      if (!response.ok) {
        throw new Error('Failed to copy package to customer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error copying package to customer:', error);
      throw error;
    }
  }

  /**
   * Copier tous les packages actifs vers un client
   */
  static async copyAllPackagesToCustomer(
    companyId: string,
    clientId: string
  ): Promise<{ success: boolean; successCount: number; totalPackages: number; errors?: any[] }> {
    try {
      const response = await fetch(`${API_URL}/copy-all-to-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, client_id: clientId })
      });

      if (!response.ok) {
        throw new Error('Failed to copy all packages to customer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error copying all packages to customer:', error);
      throw error;
    }
  }
}

// Export helper functions for backward compatibility
export const getPackages = (companyId: string, activeOnly?: boolean) =>
  TarificationService.getPackages(companyId, activeOnly);

export const getActivePackages = (companyId: string) =>
  TarificationService.getActivePackages(companyId);

export const getPackageWithItems = (packageId: string) =>
  TarificationService.getPackageWithItems(packageId);

export const createPackage = (data: Parameters<typeof TarificationService.createPackage>[0]) =>
  TarificationService.createPackage(data);

export const updatePackage = (packageId: string, data: Parameters<typeof TarificationService.updatePackage>[1]) =>
  TarificationService.updatePackage(packageId, data);

export const deletePackage = (packageId: string) =>
  TarificationService.deletePackage(packageId);

export const togglePackageStatus = (packageId: string, isActive: boolean) =>
  TarificationService.togglePackageStatus(packageId, isActive);

export const getPackageItems = (packageId: string) =>
  TarificationService.getPackageItems(packageId);

export const createPackageItem = (packageId: string, data: Parameters<typeof TarificationService.createPackageItem>[1]) =>
  TarificationService.createPackageItem(packageId, data);

export const updatePackageItem = (
  packageId: string,
  itemId: string,
  data: Parameters<typeof TarificationService.updatePackageItem>[2]
) => TarificationService.updatePackageItem(packageId, itemId, data);

export const deletePackageItem = (packageId: string, itemId: string) =>
  TarificationService.deletePackageItem(packageId, itemId);

export const copyPackageToCustomer = (packageId: string, clientId: string) =>
  TarificationService.copyPackageToCustomer(packageId, clientId);

export const copyAllPackagesToCustomer = (companyId: string, clientId: string) =>
  TarificationService.copyAllPackagesToCustomer(companyId, clientId);
