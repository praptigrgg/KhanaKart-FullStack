import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link, NavLink } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MenuItems from './pages/MenuItems'
import Orders from './pages/Orders'
import PaymentQr from './pages/PaymentQr'
import NotFound from './pages/NotFound'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function Nav() {
  const { token, logout, name, role } = useAuth()
  const [showUserBox, setShowUserBox] = useState(false)
  const dropdownRef = useRef()

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserBox(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav>
      <div className="brand"><Link to="/">KhanaKart</Link></div>
      <div className="links">
        {token && <NavLink to="/dashboard">Dashboard</NavLink>}
        {token && <NavLink to="/menu-items">Menu</NavLink>}
        {token && <NavLink to="/orders">Orders</NavLink>}

        {!token && <NavLink to="/login">Login</NavLink>}
        {!token && <NavLink to="/register">Register</NavLink>}
        {!token && <NavLink to="/forgot-password">Forgot Password?</NavLink>}

        {token && (
          <span
            className="chip"
            onClick={() => setShowUserBox(!showUserBox)}
            style={{
              cursor: 'pointer',
              position: 'relative',
              padding: '0.3rem 0.8rem',  // moderate padding
              fontSize: '1rem',          // slightly larger font size
              minWidth: '90px',          // reasonable min width
              display: 'inline-block',
              borderRadius: '16px',      // subtle rounded corners
              backgroundColor: '#d1d1d1ff',// light background
              color: '#000000ff',             // black text
              userSelect: 'none',
            }}
          >
      
            {name || 'User'}
        {showUserBox && (
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: '2.5rem',
              right: 0,
              background: 'white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              borderRadius: '6px',
              padding: '1rem 1.5rem',
              zIndex: 1000,
              minWidth: '220px',
              color: '#333',
              fontSize: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div><strong>Name:</strong> {name}</div>
            <div><strong>Role:</strong> {role || 'N/A'}</div>
            <button
              className="btn small secondary"
              onClick={() => {
                logout()
                setShowUserBox(false)
              }}
              style={{ alignSelf: 'flex-start' }}
            >
              Logout
            </button>
          </div>
        )}

      </span>
        )}

    </div>
    </nav >
  )
}

function Home() {
  return (
    <div className="card">
      <h2>Welcome to KhanaKart</h2>
      <p>Login to start using the app.</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Nav />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/menu-items" element={<ProtectedRoute><MenuItems /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/payment/qr/:id" element={<PaymentQr />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
