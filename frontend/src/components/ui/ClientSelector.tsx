import { useState, useEffect, useRef } from 'react';
import { Users, ChevronDown, Check } from 'lucide-react';
import { useFilters } from '../../contexts/FilterContext';
import { fetchMissions, fetchClients } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ClientOption {
  id: string;
  nom: string;
  missionCount: number;
}

// Mois names for filtering
const moisNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export const ClientSelector = () => {
  const { selectedYear, selectedMonth, selectedClient, setSelectedClient } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [activeClients, setActiveClients] = useState<ClientOption[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [missions, clients] = await Promise.all([
          fetchMissions(),
          fetchClients()
        ]);

        // Filter missions by selected period
        const filteredMissions = missions.filter((m: any) => {
          if (m.annee !== selectedYear) return false;
          if (selectedMonth !== null) {
            return m.mois === moisNames[selectedMonth];
          }
          return true;
        });

        // Count missions per client
        const clientMissionCount: Record<string, number> = {};
        filteredMissions.forEach((m: any) => {
          clientMissionCount[m.client] = (clientMissionCount[m.client] || 0) + 1;
        });

        // Build active clients list with mission count
        const activeClientsList: ClientOption[] = [];
        Object.entries(clientMissionCount).forEach(([clientId, count]) => {
          const client = clients.find((c: any) => c.id === clientId);
          if (client) {
            activeClientsList.push({
              id: client.id,
              nom: client.nom,
              missionCount: count
            });
          }
        });

        // Sort by mission count (descending)
        activeClientsList.sort((a, b) => b.missionCount - a.missionCount);

        setActiveClients(activeClientsList);
        setAllClients(clients);
      } catch (err) {
        console.error('Error loading clients:', err);
      }
    };

    loadData();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClientSelect = (clientId: string | null) => {
    setSelectedClient(clientId);
    setIsOpen(false);
  };

  const selectedClientData = selectedClient
    ? allClients.find(c => c.id === selectedClient)
    : null;

  const selectedLabel = selectedClientData
    ? selectedClientData.nom
    : 'Tous les clients';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-app-dark rounded-md text-app-text-primary pl-10 pr-8 py-2.5 border border-app-border hover:bg-app-border focus:outline-none focus:ring-1 focus:ring-app-hover appearance-none text-sm min-w-[180px] transition-all duration-200 cursor-pointer font-normal flex items-center justify-between"
      >
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted" />
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={cn(
          "w-4 h-4 text-app-text-muted transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[280px] bg-app-dark rounded-lg border border-app-border shadow-xl z-50 overflow-hidden">
          {/* All clients option */}
          <button
            onClick={() => handleClientSelect(null)}
            className={cn(
              "w-full px-4 py-3 text-left transition-all duration-200 border-b border-app-border flex items-center justify-between",
              !selectedClient
                ? "bg-app-border text-app-text-primary"
                : "hover:bg-app-border text-app-text-secondary hover:text-app-text-primary"
            )}
          >
            <div>
              <span className="font-medium">Tous les clients</span>
              <span className="ml-2 text-xs text-app-text-muted">
                ({activeClients.length} actifs)
              </span>
            </div>
            {!selectedClient && <Check className="w-4 h-4" />}
          </button>

          {/* Active clients list */}
          <div className="max-h-[300px] overflow-y-auto">
            {activeClients.length === 0 ? (
              <div className="px-4 py-6 text-center text-app-text-muted text-sm">
                Aucun client actif sur cette période
              </div>
            ) : (
              activeClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleClientSelect(client.id)}
                  className={cn(
                    "w-full px-4 py-2.5 text-left transition-all duration-200 flex items-center justify-between",
                    selectedClient === client.id
                      ? "bg-app-border text-app-text-primary"
                      : "hover:bg-app-border text-app-text-secondary hover:text-app-text-primary"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <span className="truncate block">{client.nom}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-app-text-muted">
                      {client.missionCount} mission{client.missionCount > 1 ? 's' : ''}
                    </span>
                    {selectedClient === client.id && <Check className="w-4 h-4 flex-shrink-0" />}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-app-border bg-app-dark/50">
            <p className="text-xs text-app-text-muted">
              Clients avec missions en {selectedMonth !== null ? moisNames[selectedMonth] : ''} {selectedYear}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
