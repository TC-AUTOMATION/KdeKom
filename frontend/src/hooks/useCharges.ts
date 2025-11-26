import { useState, useEffect, useMemo } from 'react';
import { Charge } from '../types/charge';
import { ChargeService } from '../services/charge.service';
import { useCompany } from '../contexts/CompanyContext';
import { useFilters } from '../contexts/FilterContext';

export const useCharges = () => {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { selectedCompany } = useCompany();
  const { selectedYear, selectedMonth } = useFilters();

  useEffect(() => {
    const loadCharges = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allCharges = await ChargeService.getAllCharges();
        setCharges(allCharges);
      } catch (err) {
        console.error('Error loading charges:', err);
        setError(err instanceof Error ? err : new Error('Failed to load charges'));
      } finally {
        setIsLoading(false);
      }
    };

    loadCharges();
  }, []);

  // Filter charges by company, year, and month
  const filteredCharges = useMemo(() => {
    let filtered = charges;

    // Filter by company
    if (selectedCompany) {
      filtered = filtered.filter(charge => charge.companyId === selectedCompany.id);
    }

    // Filter by year
    filtered = filtered.filter(charge => {
      const chargeDate = new Date(charge.date);
      return chargeDate.getFullYear() === selectedYear;
    });

    // Filter by month if specified
    if (selectedMonth !== null) {
      filtered = filtered.filter(charge => {
        const chargeDate = new Date(charge.date);
        return chargeDate.getMonth() === selectedMonth;
      });
    }

    return filtered;
  }, [charges, selectedCompany, selectedYear, selectedMonth]);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allCharges = await ChargeService.getAllCharges();
      setCharges(allCharges);
    } catch (err) {
      console.error('Error refreshing charges:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh charges'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    charges: filteredCharges,
    allCharges: charges,
    isLoading,
    error,
    refresh
  };
};
