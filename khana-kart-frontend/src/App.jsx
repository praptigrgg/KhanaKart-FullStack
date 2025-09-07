import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

import Dashboard from './pages/Dashboard';
import MenuItems from './pages/MenuItems';
import Orders from './pages/Orders';
import TablesPage from './pages/TablesPage';
import Users from './pages/Users';
import ProfilePage from './pages/ProfilePage';
import AdminProfileManager from './pages/AdminProfileManager';
import Login from './pages/Login';
import Register from './pages/Register';
import KOT from './pages/KOT';
import RolesPage from './pages/RolesPage'; // <-- Import RolesPage
import InventoryPage from './pages/InventoryPage';

import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { InvoiceProvider } from './context/InvoiceContext';

import './styles.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const hideSidebarPaths = ['/login', '/register'];
  const shouldShowSidebar = !hideSidebarPaths.includes(location.pathname);

  return (
    <AuthProvider>
      <InvoiceProvider>
        <div className="app-container">
          {shouldShowSidebar && (
            <>
              <button
                className="hamburger-menu"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>

              <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </>
          )}

          {shouldShowSidebar ? (
            <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
              <Routes>
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/menu-items" element={<PrivateRoute><MenuItems /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                <Route path="/tables" element={<PrivateRoute><TablesPage /></PrivateRoute>} />
                <Route path="/inventory" element={<PrivateRoute><InventoryPage /></PrivateRoute>} />

                <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />

                {/* Roles page route, admin only */}
                <Route path="/roles" element={<PrivateRoute requiredRole="admin"><RolesPage /></PrivateRoute>} />

                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/profiles/:id" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/profiles" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

                <Route path="/kot" element={<PrivateRoute><KOT /></PrivateRoute>} />

               

                <Route
                  path="/admin/profiles"
                  element={
                    <PrivateRoute requiredRole="admin">
                      <AdminProfileManager />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
          ) : (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          )}
        </div>
      </InvoiceProvider>
    </AuthProvider>
  );
}
