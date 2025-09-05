import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPlus, FaSearch, FaTimes, FaSave } from 'react-icons/fa'

export default function MenuItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const { role } = useAuth()
  const roleNormalized = role?.toLowerCase() || ''

  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    category: '', 
    is_available: true 
  })

  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  function canEdit() {
    return roleNormalized === 'admin'
  }

  function canToggle() {
    return ['admin', 'kitchen'].includes(roleNormalized)
  }

  function fetchAll() {
    setLoading(true)
    api.get('/menu-items')
      .then(res => setItems(res.data))
      .catch(err => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const validateForm = () => {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Name is required'
    if (!form.price || parseFloat(form.price) <= 0) errors.price = 'Valid price is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (editingItem) {
        await api.put(`/menu-items/${editingItem.id}`, { 
          ...form, 
          price: parseFloat(form.price) 
        })
      } else {
        await api.post('/menu-items', { 
          ...form, 
          price: parseFloat(form.price) 
        })
      }
      
      resetForm()
      fetchAll()
    } catch (err) {
      alert(err?.response?.data?.message || err.message)
    }
  }

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: '', is_available: true })
    setEditingItem(null)
    setFormErrors({})
    setShowForm(false)
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
    if (!confirm('Are you sure you want to delete this menu item?')) return
    try {
      await api.delete(`/menu-items/${id}`)
      fetchAll()
    } catch (err) {
      alert(err?.response?.data?.message || err.message)
    }
  }

  const startEdit = (item) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category || '',
      is_available: item.is_available
    })
    setShowForm(true)
  }

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const categories = ['all', ...new Set(items.map(item => item.category).filter(Boolean))]

  return (
    <div className="menu-items-container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Menu Items</h2>
          <div className="d-flex align-center gap-2">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="category-filter"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            {canEdit() && (
              <button 
                className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => {
                  if (showForm) {
                    resetForm()
                  } else {
                    setShowForm(true)
                    setEditingItem(null)
                  }
                }}
              >
                <FaPlus /> {showForm ? 'Cancel' : 'Add Item'}
              </button>
            )}
          </div>
        </div>

        {/* Add/Edit Item Form */}
        {showForm && canEdit() && (
          <div className="add-item-card">
            <div className="card-header">
              <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
              <button className="btn btn-icon" onClick={resetForm}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="item-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input 
                    className={`form-input ${formErrors.name ? 'error' : ''}`}
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    placeholder="Enter item name"
                  />
                  {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input 
                    className="form-input"
                    value={form.category} 
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))} 
                    placeholder="e.g., Appetizer, Main Course"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input"
                  rows="3"
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the menu item..."
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (Rs.) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    className={`form-input ${formErrors.price ? 'error' : ''}`}
                    value={form.price} 
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} 
                    placeholder="0.00"
                  />
                  {formErrors.price && <span className="error-text">{formErrors.price}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <div className="availability-toggle">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={form.is_available}
                        onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className="toggle-label">
                      {form.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaSave /> {editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading menu items...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p className="error-text">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  {(canEdit() || canToggle()) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={(canEdit() || canToggle()) ? 6 : 5} className="table-empty">
                      <div className="table-empty-icon">🍽️</div>
                      <h3>No menu items found</h3>
                      <p>{searchTerm || filterCategory !== 'all' ? 'Try adjusting your search or filters' : 'Start by adding your first menu item'}</p>
                      {canEdit() && !showForm && (
                        <button 
                          className="btn btn-primary mt-2"
                          onClick={() => setShowForm(true)}
                        >
                          <FaPlus /> Add Your First Item
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className={!item.is_available ? 'item-unavailable' : ''}>
                      <td>
                        <div className="item-name">{item.name}</div>
                      </td>
                      <td>
                        <div className="item-description">
                          {item.description || 'No description available'}
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{item.category || 'Uncategorized'}</span>
                      </td>
                      <td>
                        <span className="price-tag">Rs. {Number(item.price).toFixed(2)}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${item.is_available ? 'status-active' : 'status-cancelled'}`}>
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      {(canEdit() || canToggle()) && (
                        <td>
                          <div className="table-actions">
                            {canToggle() && (
                              <button 
                                className={`table-btn ${item.is_available ? 'table-btn-warning' : 'table-btn-success'}`}
                                onClick={() => updateItem(item.id, { is_available: !item.is_available })}
                                title={item.is_available ? 'Mark as unavailable' : 'Mark as available'}
                              >
                                {item.is_available ? <FaToggleOff /> : <FaToggleOn />}
                                {item.is_available ? 'Disable' : 'Enable'}
                              </button>
                            )}
                            {canEdit() && (
                              <>
                                <button 
                                  className="table-btn table-btn-edit"
                                  onClick={() => startEdit(item)}
                                  title="Edit item"
                                >
                                  <FaEdit />
                                  Edit
                                </button>
                                <button 
                                  className="table-btn table-btn-delete"
                                  onClick={() => deleteItem(item.id)}
                                  title="Delete item"
                                >
                                  <FaTrash />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredItems.length > 0 && (
          <div className="table-footer">
            <p>Showing {filteredItems.length} of {items.length} menu items</p>
          </div>
        )}
      </div>

      {/* Add CSS styles */}
      <style>{`
        /* your CSS styles remain unchanged */
        .menu-items-container {
          padding: 1rem;
        }
        .add-item-card {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-light);
        }
        .item-form {
          margin-top: 1rem;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }
        .table-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
        }
        .table-empty-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }
        .table-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .table-btn {
          border: none;
          background: transparent;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.9rem;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          transition: background-color 0.2s;
        }
        .table-btn-edit {
          color: var(--primary);
        }
        .table-btn-delete {
          color: var(--danger);
        }
        .table-btn-warning {
          color: var(--warning);
        }
        .table-btn-success {
          color: var(--success);
        }
        .item-unavailable {
          opacity: 0.6;
        }
        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .status-active {
          background-color: var(--success-light);
          color: var(--success);
        }
        .status-cancelled {
          background-color: var(--danger-light);
          color: var(--danger);
        }
        .category-badge {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  )
}
