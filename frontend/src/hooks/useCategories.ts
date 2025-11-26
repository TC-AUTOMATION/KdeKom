import { useState, useEffect } from 'react';
import { CategoryService } from '../services/category.service';

export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const cats = await CategoryService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError(err instanceof Error ? err : new Error('Failed to load categories'));
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cats = await CategoryService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Error refreshing categories:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh categories'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories,
    isLoading,
    error,
    refresh
  };
};
