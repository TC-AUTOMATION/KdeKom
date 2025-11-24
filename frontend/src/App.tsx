import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMissions from './pages/admin/Missions';
import AdminRecap from './pages/admin/Recap';
import AdminContacts from './pages/admin/Contacts';
import AdminPayouts from './pages/admin/Payouts';
import PersonDetails from './pages/admin/PersonDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="missions" element={<AdminMissions />} />
          <Route path="recap" element={<AdminRecap />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="persons/:id" element={<PersonDetails />} />
          <Route path="settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
        </Route>
        {/* Redirect root to admin */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;