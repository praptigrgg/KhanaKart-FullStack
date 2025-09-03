import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);  // Use null for a clearer "not set" state
  const [role, setRole] = useState(localStorage.getItem('role') || null);      // Use null for role as well
  const [name, setName] = useState(localStorage.getItem('name') || '');        // Empty string is fine for name

  // Function to save token, role, and name to localStorage and context state
  function saveAuth(token, role, name) {
    localStorage.setItem('token', token ?? '');
    localStorage.setItem('role', role ?? '');
    localStorage.setItem('name', name ?? '');
    setToken(token ?? null);  // If no token, set null
    setRole(role ?? null);    // If no role, set null
    setName(name ?? '');      // If no name, set empty string
  }

  // Function to log out user and clear stored data
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setToken(null);
    setRole(null);
    setName('');
  }

  return (
    <AuthContext.Provider value={{ token, role, name, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
