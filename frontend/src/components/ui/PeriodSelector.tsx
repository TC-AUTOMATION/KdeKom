import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useFilters } from '../../contexts/FilterContext';
import { fetchMissions } from '@/lib/api';

interface MonthData {
  month: number;
  year: number;
  missionCount: number;
  total: number;
}

const moisNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export const PeriodSelector = () => {
  const { selectedYear, selectedMonth, selectedClient, setSelectedYear, setSelectedMonth } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [availableMonths, setAvailableMonths] = useState<MonthData[]>([]);
  const [currentViewYear, setCurrentViewYear] = useState(selectedYear);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load missions to determine available months
    const loadAvailableMonths = async () => {
      try {
        const allMissions = await fetchMissions();

        // Filter by client if selected
        const missions = selectedClient
          ? allMissions.filter((m: any) => m.client === selectedClient)
          : allMissions;

        // Determine which years have data
        const years = new Set<number>();
        missions.forEach((mission: any) => {
          years.add(mission.annee);
        });

        // If no data, use current year
        if (years.size === 0) {
          years.add(new Date().getFullYear());
        }

        // Initialize all 12 months for each year with data
        const monthMap = new Map<string, MonthData>();
        years.forEach(year => {
          for (let month = 0; month < 12; month++) {
            const key = `${year}-${month}`;
            monthMap.set(key, {
              month,
              year,
              missionCount: 0,
              total: 0
            });
          }
        });

        // Process missions
        missions.forEach((mission: any) => {
          const monthIndex = moisNames.indexOf(mission.mois);
          if (monthIndex === -1) return;
          const year = mission.annee;
          const key = `${year}-${monthIndex}`;

          const data = monthMap.get(key);
          if (data) {
            data.missionCount++;
            data.total += mission.ca_genere || 0;
          }
        });

        setAvailableMonths(Array.from(monthMap.values()));
      } catch (err) {
        console.error('Error loading available months:', err);
      }
    };

    loadAvailableMonths();
  }, [selectedClient]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const getMonthData = (month: number, year: number): MonthData | undefined => {
    return availableMonths.find(m => m.month === month && m.year === year);
  };

  const hasData = (month: number, year: number): boolean => {
    return availableMonths.some(m => m.month === month && m.year === year);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleMonthSelect = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsOpen(false);
  };

  const handlePrevYear = () => {
    setCurrentViewYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setCurrentViewYear(prev => prev + 1);
  };

  const selectedLabel = selectedMonth !== null
    ? `${months[selectedMonth]} ${selectedYear}`
    : `Année ${selectedYear}`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-app-dark rounded-md text-app-text-primary pl-10 pr-8 py-2.5 border border-app-border hover:bg-app-border focus:outline-none focus:ring-1 focus:ring-app-hover appearance-none text-sm min-w-[200px] transition-all duration-200 cursor-pointer font-normal flex items-center justify-between"
      >
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted" />
        <span>{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-app-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-[420px] bg-app-dark rounded-lg border border-app-border shadow-xl z-50 overflow-hidden transition-all duration-300"
        >
            {/* Year selector */}
            <div className="flex items-center justify-between p-4 border-b border-app-border">
              <button
                onClick={handlePrevYear}
                className="p-1.5 hover:bg-app-border rounded-md transition-all duration-200 group"
              >
                <ChevronLeft className="w-5 h-5 text-app-text-muted group-hover:text-app-text-primary transition-colors" />
              </button>
              <h3 className="text-lg font-semibold text-app-text-primary">{currentViewYear}</h3>
              <button
                onClick={handleNextYear}
                className="p-1.5 hover:bg-app-border rounded-md transition-all duration-200 group"
              >
                <ChevronRight className="w-5 h-5 text-app-text-muted group-hover:text-app-text-primary transition-colors" />
              </button>
            </div>

            {/* View all year option */}
            <button
              onClick={() => {
                setSelectedMonth(null);
                setSelectedYear(currentViewYear);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-app-border transition-all duration-200 border-b border-app-border"
            >
              <div className="flex items-center justify-between">
                <span className="text-app-text-primary font-medium">Toute l'année {currentViewYear}</span>
                <span className="text-xs text-app-text-muted">
                  12 mois
                </span>
              </div>
            </button>

            {/* Month grid */}
            <div className="grid grid-cols-3 gap-2 p-3 max-h-[400px] overflow-y-auto">
              {months.map((month, index) => {
                const monthData = getMonthData(index, currentViewYear) || {
                  month: index,
                  year: currentViewYear,
                  missionCount: 0,
                  total: 0
                };
                const isSelected = selectedMonth === index && selectedYear === currentViewYear;
                const hasMonthData = hasData(index, currentViewYear);

                return (
                  <button
                    key={index}
                    onClick={() => handleMonthSelect(index, currentViewYear)}
                    className={`
                      relative p-3 rounded-md text-left transition-all duration-200
                      ${isSelected
                        ? 'bg-app-border text-app-text-primary'
                        : hasMonthData
                          ? 'bg-app-dark text-app-text-primary hover:bg-app-border'
                          : 'bg-app-dark text-app-text-muted hover:bg-app-dark'
                      }
                    `}
                  >
                    <div className="text-xs font-medium mb-1">
                      {month.slice(0, 3)}
                    </div>
                    <div className="space-y-0.5">
                      <div className={`text-xs ${isSelected ? 'text-app-text-primary/80' : 'text-app-text-muted'}`}>
                        {monthData.missionCount} mission{monthData.missionCount > 1 ? 's' : ''}
                      </div>
                      <div className={`text-xs font-medium ${isSelected ? 'text-app-text-primary' : hasMonthData ? 'text-app-text-secondary' : 'text-app-text-muted'}`}>
                        {formatCurrency(monthData.total)}
                      </div>
                    </div>
                    {hasMonthData && monthData.total > 0 && (
                      <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                        isSelected ? 'bg-app-text-primary/60' : 'bg-status-success'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer info */}
            <div className="p-3 border-t border-app-border">
              <div className="flex items-center justify-between text-xs text-app-text-muted">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-status-success rounded-full" />
                  <span>Données disponibles</span>
                </div>
                <div className="font-medium">
                  Total: {formatCurrency(
                    availableMonths
                      .filter(m => m.year === currentViewYear)
                      .reduce((sum, m) => sum + m.total, 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
