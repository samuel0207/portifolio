import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastContainer } from './components/ui/ToastContainer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicPortfolioPage } from './pages/PublicPortfolioPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminPortfolioPage } from './pages/admin/AdminPortfolioPage';
import { AdminSchedulePage } from './pages/admin/AdminSchedulePage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Portfolio Routes */}
          <Route path="/" element={<PublicPortfolioPage />} />
          <Route path="/p/:slug" element={<PublicPortfolioPage />} />

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Panel */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="portfolio" element={<AdminPortfolioPage />} />
            <Route path="agenda" element={<AdminSchedulePage />} />
            <Route path="inventario" element={<AdminInventoryPage />} />
            <Route path="configuracoes" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </AppProvider>
  );
};

export default App;
