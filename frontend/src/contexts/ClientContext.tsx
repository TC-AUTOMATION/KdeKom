import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientService, Client } from '../services/client.service';

interface ClientContextType {
  clients: Client[];
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};

interface ClientProviderProps {
  children: React.ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      const data = await ClientService.getAllClients();
      setClients(data);
    };

    loadClients();
  }, []);

  return (
    <ClientContext.Provider value={{ clients, selectedClient, setSelectedClient }}>
      {children}
    </ClientContext.Provider>
  );
};
