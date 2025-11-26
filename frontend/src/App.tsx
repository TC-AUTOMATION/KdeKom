import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import MissionDetail from './pages/MissionDetail';
import Clients from './pages/Clients';
import Consultants from './pages/Consultants';
import ApporteursDaffaires from './pages/ApporteursDaffaires';
import Charges from './pages/Charges';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { SidebarProvider } from './contexts/SidebarContext';
import { FilterProvider } from './contexts/FilterContext';
import { CompanyProvider } from './contexts/CompanyContext';
import { ClientProvider } from './contexts/ClientContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <CompanyProvider>
        <ClientProvider>
          <FilterProvider>
            <SidebarProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="missions" element={<Missions />} />
                <Route path="missions/:id" element={<MissionDetail />} />
                <Route path="clients" element={<Clients />} />
                <Route path="consultants" element={<Consultants />} />
                <Route path="apporteurs" element={<ApporteursDaffaires />} />
                <Route path="charges" element={<Charges />} />
                <Route path="parametres" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </SidebarProvider>
        </FilterProvider>
        </ClientProvider>
      </CompanyProvider>
    </ThemeProvider>
  );
}

export default App;
