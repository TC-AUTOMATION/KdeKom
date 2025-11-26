// Category service for managing charge categories via API
const API_URL = '/api/categories';

export interface Category {
  id: string;
  name: string;
  type: 'charge' | 'prestation';
  displayOrder: number;
  isActive: boolean;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class CategoryService {
  /**
   * Get all active categories for charges
   */
  static async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading categories:', error);
      // Return default categories as fallback
      return [
        'Produits',
        'Équipement',
        'Loyer',
        'Électricité',
        'Eau',
        'Assurance',
        'Marketing',
        'Autres'
      ];
    }
  }

  /**
   * Get all categories with full details
   */
  static async getAllCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_URL}/all`);
      if (!response.ok) {
        throw new Error('Failed to fetch all categories');
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  /**
   * Add a new category
   */
  static async addCategory(category: string, companyId?: string): Promise<void> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: category,
          companyId: companyId || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  /**
   * Remove a category (soft delete by setting is_active to false)
   */
  static async removeCategory(categoryName: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(categoryName)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove category');
      }
    } catch (error) {
      console.error('Error removing category:', error);
      throw error;
    }
  }

  /**
   * Update a category name
   */
  static async updateCategory(oldCategory: string, newCategory: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(oldCategory)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newName: newCategory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Reorder categories
   */
  static async reorderCategories(categories: { name: string; displayOrder: number }[]): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder categories');
      }
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  }

  /**
   * Reset to default categories (re-activate all default ones)
   */
  static async resetToDefaults(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/reset`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset categories');
      }
    } catch (error) {
      console.error('Error resetting to defaults:', error);
      throw error;
    }
  }
}
