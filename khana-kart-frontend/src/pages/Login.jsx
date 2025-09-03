import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { saveAuth } = useAuth()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await api.post('/login', form)
      const token = res?.data?.token
      const role = res?.data?.user?.role    // <-- fixed here
      const name = res?.data?.user?.name    // <-- fixed here

      if (token) {
        saveAuth(token, role, name)
        navigate('/dashboard')
      } else {
        setError('Login failed: No token returned')
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <header className="auth-header">
          <h2>Login</h2>
          <p>Welcome back! Please login to your account.</p>
        </header>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              className={error ? 'error' : ''}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              className={error ? 'error' : ''}
              autoComplete="current-password"
            />
          </div>

          <button className="auth-button" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>

        <footer className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
