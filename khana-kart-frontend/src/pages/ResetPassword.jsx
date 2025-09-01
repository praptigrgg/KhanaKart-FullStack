import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const email = params.get('email') || ''
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [password_confirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null); setMessage(null)
    try {
      await api.post('/reset-password', { email, token, password, password_confirmation })
      setMessage('Password reset successful. Redirecting to login...')
      setTimeout(()=>navigate('/login'), 2000)
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{maxWidth:420, margin:'40px auto'}}>
      <h2>Reset Password</h2>
      <form onSubmit={onSubmit}>
        <input type="hidden" value={email} readOnly />
        <input type="hidden" value={token} readOnly />
        <div className="field">
          <label>New Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <div className="field">
          <label>Confirm Password</label>
          <input type="password" value={password_confirmation} onChange={e=>setPasswordConfirmation(e.target.value)} required />
        </div>
        <button className="btn" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        {message && <p style={{color:'#a7f3d0', marginTop:10}}>{message}</p>}
        {error && <p style={{color:'#fca5a5', marginTop:10}}>{error}</p>}
      </form>
    </div>
  )
}
