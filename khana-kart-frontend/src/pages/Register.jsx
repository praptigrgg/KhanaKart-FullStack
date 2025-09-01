import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'waiter',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { saveAuth } = useAuth()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/register', form)
      const token = res?.data?.token
      // Use role and name from API response if available; otherwise, fallback to form data
      const role = res?.data?.role || form.role
      const name = res?.data?.name || form.name

      if (token) {
        saveAuth(token, role, name)
        navigate('/dashboard')
      } else {
        navigate('/login')
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Name</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
        </div>
        <div className="field">
          <label>Confirm Password</label>
          <input
            type="password"
            value={form.password_confirmation}
            onChange={e =>
              setForm(f => ({ ...f, password_confirmation: e.target.value }))
            }
            required
          />
        </div>
        <div className="field">
          <label>Role</label>
          <select
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          >
            <option value="admin">Admin</option>
            <option value="waiter">Waiter</option>
            <option value="kitchen">Kitchen</option>
          </select>
        </div>
        <button className="btn" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && (
          <p style={{ color: '#fca5a5', marginTop: 10 }}>
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
