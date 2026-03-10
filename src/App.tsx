import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { Bookings } from './pages/Bookings';
import { Fleet } from './pages/Fleet';
import { Customers } from './pages/Customers';
import { ConflictCenter } from './pages/ConflictCenter';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { PricingEngine } from './pages/PricingEngine';
import { Blacklist } from './pages/Blacklist';
import { PartnerPortal } from './pages/PartnerPortal';
import { Login } from './pages/Login';
import { ProtectedRoute } from './lib/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="fleet" element={<Fleet />} />
            <Route path="customers" element={<Customers />} />
            <Route path="conflicts" element={<ConflictCenter />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="pricing" element={<PricingEngine />} />
            <Route path="blacklist" element={<Blacklist />} />
            <Route path="partner" element={<PartnerPortal />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
