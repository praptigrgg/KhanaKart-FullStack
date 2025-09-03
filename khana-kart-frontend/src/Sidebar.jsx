import React, { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import {
  FaHome,
  FaFileAlt,
  FaChartBar,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaTimes,
  FaUsers,
} from 'react-icons/fa'

export default function Sidebar({ isOpen, onClose }) {
  const { token, user, logout, loading } = useAuth()
  const [showUserBox, setShowUserBox] = useState(false)
  const dropdownRef = useRef()

  const name = user?.name || 'User'
  const role = user?.role || 'Role'

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserBox(false)
      }
    }
    document.addEventListener('mousedown', clickOutside)
    return () => document.removeEventListener('mousedown', clickOutside)
  }, [])

  if (loading) return null

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { to: '/menu-items', label: 'Menu Items', icon: <FaFileAlt /> },
    { to: '/orders', label: 'Orders', icon: <FaChartBar /> },
  ]

  if (role === 'admin') {
    navItems.push({ to: '/profiles', label: 'User Profiles', icon: <FaUserCircle /> })
    navItems.push({ to: '/users', label: 'Users', icon: <FaUsers /> })
  } else {
    navItems.push({ to: '/profile', label: 'My Profile', icon: <FaUserCircle /> })
  }

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="sidebar-profile">
          <FaUserCircle className="profile-icon" />
          <h3 className="profile-name">{name}</h3>
          <p className="profile-role">{role}</p>
        </div>

        <nav className="sidebar-nav">
          {token &&
            navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
        </nav>

        {token && (
          <div className="sidebar-bottom">
            <div className="user-chip" onClick={() => setShowUserBox((open) => !open)}>
              <span className="chip-text">{name}</span>
              <FaChevronDown className={`chip-icon ${showUserBox ? 'rotated' : ''}`} />
            </div>

            {showUserBox && (
              <div ref={dropdownRef} className="user-dropdown">
                <div className="dropdown-item">
                  <strong>Name:</strong> {name}
                </div>
                <div className="dropdown-item">
                  <strong>Role:</strong> {role}
                </div>
                <button className="logout-btn" onClick={logout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
