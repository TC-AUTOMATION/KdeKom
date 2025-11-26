import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company, CompanyService } from '../services/company.service';

interface CompanyContextType {
  companies: Company[];
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  reloadCompanies: () => Promise<void>;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const allCompanies = await CompanyService.getAllCompanies();
      setCompanies(allCompanies);

      // Ne pas sélectionner automatiquement une entreprise
      // L'utilisateur doit la sélectionner manuellement si nécessaire
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const reloadCompanies = async () => {
    await loadCompanies();
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        companies,
        selectedCompany,
        setSelectedCompany,
        reloadCompanies,
        isLoading,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};
