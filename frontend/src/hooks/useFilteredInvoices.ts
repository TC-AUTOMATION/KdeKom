import { useState, useEffect, useMemo } from 'react';
import { Invoice } from '../types/invoice';
import { useFilters } from '../contexts/FilterContext';
import { ApiService } from '../services/api';

export const useFilteredInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { filterInvoices } = useFilters();

  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allInvoices = await ApiService.getAllInvoices();
        setInvoices(allInvoices);
      } catch (err) {
        console.error('Error loading invoices:', err);
        setError(err instanceof Error ? err : new Error('Failed to load invoices'));
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return filterInvoices(invoices);
  }, [invoices, filterInvoices]);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allInvoices = await ApiService.getAllInvoices();
      setInvoices(allInvoices);
    } catch (err) {
      console.error('Error refreshing invoices:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh invoices'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    invoices: filteredInvoices,
    allInvoices: invoices,
    isLoading,
    error,
    refresh
  };
};
