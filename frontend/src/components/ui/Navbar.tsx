// client/src/components/ui/Navbar.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';
import { PeriodSelector } from './PeriodSelector';
import { ClientSelector } from './ClientSelector';
import KdekomLogo from './KdekomLogo';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { sidebarWidth } = useSidebar();

  // Determine which filters to show based on current route
  const shouldHideAllFilters =
    ['/parametres', '/entreprises', '/invoices/new', '/quotes/new'].includes(location.pathname) ||
    (location.pathname.includes('/invoices/') && location.pathname.includes('/edit')) ||
    (location.pathname.includes('/quotes/') && location.pathname.includes('/edit')) ||
    (location.pathname.match(/^\/quotes\/[^/]+$/) !== null) ||
    (location.pathname.match(/^\/invoices\/[^/]+$/) !== null);

  const shouldHidePeriodFilter = ['/clients', '/vehicules'].includes(location.pathname) || shouldHideAllFilters;
  const shouldHideCustomersFilter = ['/charges', '/clients'].includes(location.pathname) || shouldHideAllFilters;

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-app-black border-b border-app-dark">
      <div className="h-16 flex items-center relative">
        {/* Logo Section */}
        <div style={{ width: `${sidebarWidth}px` }} className="px-6 flex items-center justify-center border-r border-app-dark">
          <KdekomLogo size="md" />
        </div>

        {/* Filters Section */}
        <div className="flex-1 px-6">
          {/* Filters */}
          <div className="flex items-center gap-2">
            {!shouldHidePeriodFilter && <PeriodSelector />}
            {!shouldHideCustomersFilter && <ClientSelector />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;