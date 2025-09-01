import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function MenuItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { role } = useAuth()

  const [form, setForm] = useState({ name:'', description:'', price:'', category:'', is_available:true })

  function canEdit() {
    return role === 'admin'
  }

  function canToggle() {
    return role === 'admin' || role === 'kitchen'
  }

  function fetchAll() {
    setLoading(true)
    api.get('/menu-items').then(res => setItems(res.data))
    .catch(err => setError(err?.response?.data?.message || err.message))
    .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  async function addItem(e) {
    e.preventDefault()
    try {
      await api.post('/menu-items', { 
        ...form, 
        price: parseFloat(form.price) 
      })
      setForm({ name:'', description:'', price:'', category:'', is_available:true })
      fetchAll()
    } catch (err) {
      alert(err?.response?.data?.message || err.message)
    }
  }

  async function updateItem(id, patch) {
    try {
      await api.put(`/menu-items/${id}`, patch)
      fetchAll()
    } catch (err) {
      alert(err?.response?.data?.message || err.message)
    }
  }

  async function deleteItem(id) {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`/menu-items/${id}`)
      fetchAll()
    } catch (err) {
      alert(err?.response?.data?.message || err.message)
    }
  }

  return (
    <div className="row">
      <div className="col">
        <div className="card">
          <h2>Menu Items</h2>
          {loading && <p>Loading...</p>}
          {error && <p style={{color:'#fca5a5'}}>{error}</p>}
          <table className="list">
            <thead>
              <tr>
                <th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id}>
                  <td>{it.name}</td>
                  <td>{it.category || '-'}</td>
                  <td>Rs. {Number(it.price).toFixed(2)}</td>
                  <td><span className="chip">{it.is_available ? 'yes' : 'no'}</span></td>
                  <td style={{display:'flex', gap:8}}>
                    {canToggle() && (
                      <button className="btn small" onClick={() => updateItem(it.id, { is_available: !it.is_available })}>
                        Toggle
                      </button>
                    )}
                    {canEdit() && (
                      <button className="btn small danger" onClick={() => deleteItem(it.id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {canEdit() && (
        <div className="col">
          <div className="card">
            <h3>Add Item</h3>
            <form onSubmit={addItem}>
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}></textarea>
              </div>
              <div className="field">
                <label>Category</label>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <div className="field">
                <label>Price (Rs.)</label>
                <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
              </div>
              <div className="field">
                <label>Available</label>
                <select value={form.is_available ? '1' : '0'} onChange={e => setForm(f => ({ ...f, is_available: e.target.value === '1' }))}>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
              <button className="btn">Create</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
