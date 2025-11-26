import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useCompany } from './CompanyContext';
import { Invoice } from '../types/invoice';

export interface FilterContextType {
  selectedPeriod: string;
  selectedClient: string | null;
  selectedEntreprise: string;
  selectedYear: number;
  selectedMonth: number | null;
  setSelectedPeriod: (period: string) => void;
  setSelectedClient: (client: string | null) => void;
  setSelectedEntreprise: (entreprise: string) => void;
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number | null) => void;
  getDateRange: () => { start: Date; end: Date };
  filterInvoices: (invoices: Invoice[]) => Invoice[];
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider = ({ children }: FilterProviderProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedEntreprise, setSelectedEntreprise] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Sync with Company context
  const companyContext = useCompany();

  // Sync selectedEntreprise with CompanyContext
  useEffect(() => {
    if (companyContext?.selectedCompany) {
      setSelectedEntreprise(companyContext.selectedCompany.id);
    } else {
      setSelectedEntreprise('all');
    }
  }, [companyContext?.selectedCompany]);

  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    let start: Date;
    let end: Date;

    // If month is selected, use month range
    if (selectedMonth !== null) {
      start = new Date(selectedYear, selectedMonth, 1);
      end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
    } else {
      // Otherwise use year range
      start = new Date(selectedYear, 0, 1);
      end = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
    }

    return { start, end };
  };

  const filterInvoices = (invoices: Invoice[]): Invoice[] => {
    let filtered = invoices;

    // Filter by date range
    const { start, end } = getDateRange();
    filtered = filtered.filter(inv => {
      const invDate = new Date(inv.date);
      return invDate >= start && invDate <= end;
    });

    // Filter by client (if selected)
    if (selectedClient) {
      filtered = filtered.filter(inv => inv.client?.id === selectedClient);
    }

    // Filter by company (if not 'all')
    if (selectedEntreprise && selectedEntreprise !== 'all') {
      filtered = filtered.filter(inv => inv.company?.id === selectedEntreprise);
    }

    return filtered;
  };

  const value: FilterContextType = {
    selectedPeriod,
    selectedClient,
    selectedEntreprise,
    selectedYear,
    selectedMonth,
    setSelectedPeriod,
    setSelectedClient,
    setSelectedEntreprise,
    setSelectedYear,
    setSelectedMonth,
    getDateRange,
    filterInvoices,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};
