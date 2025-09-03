import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './pages/Dashboard';
import MenuItems from './pages/MenuItems';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/Users'


import PrivateRoute from './components/PrivateRoute';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useLocation } from 'react-router-dom';

import './styles.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const hideSidebarPaths = ['/login', '/register'];
  const shouldShowSidebar = !hideSidebarPaths.includes(location.pathname);

  return (
    <AuthProvider>
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
              <Route path="/users" element={<Users />} />

              <Route path="*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            </Routes>
          </main>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        )}
      </div>
    </AuthProvider>
  );
}
