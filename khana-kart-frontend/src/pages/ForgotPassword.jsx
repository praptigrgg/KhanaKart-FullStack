import React, { useState } from 'react'
import { api } from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null); setMessage(null)
    try {
      const res = await api.post('/forgot-password', { email })
      setMessage(res?.data?.message || 'Password reset link sent to your email.')
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{maxWidth:420, margin:'40px auto'}}>
      <h2>Forgot Password</h2>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <button className="btn" disabled={loading}>{loading ? 'Sending...' : 'Send Link'}</button>
        {message && <p style={{color:'#a7f3d0', marginTop:10}}>{message}</p>}
        {error && <p style={{color:'#fca5a5', marginTop:10}}>{error}</p>}
      </form>
    </div>
  )
}
