import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPlus, FaSearch, FaTimes, FaSave } from 'react-icons/fa'
import LoadingAndErrorStates from './LoadingAndErrorStates'

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

  // --- Pagination State ---
  const ITEMS_PER_PAGE = 6
  const [currentPage, setCurrentPage] = useState(1)

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

  // Reset page to 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategory])

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

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // --- Pagination Logic: slice filtered items to current page ---
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

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
          <LoadingAndErrorStates/>
        )}

        {error && (
          <div className="error-state">
            <p className="error-text">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="menu-cards-grid">
              {paginatedItems.length === 0 ? (
                <div className="table-empty">
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
                </div>
              ) : (
                paginatedItems.map(item => (
                  <div key={item.id} className={`menu-card ${!item.is_available ? 'item-unavailable' : ''}`}>
                    <div className="menu-card-header">
                      <h3 className="menu-card-title">{item.name}</h3>
                      <span className={`status-badge ${item.is_available ? 'status-active' : 'status-cancelled'}`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <p className="menu-card-description">{item.description || 'No description available'}</p>
                    <div className="menu-card-meta">
                      <span className="category-badge">{item.category || 'Uncategorized'}</span>
                      <span className="price-tag">Rs. {Number(item.price).toFixed(2)}</span>
                    </div>
                    {(canEdit() || canToggle()) && (
                      <div className="card-actions">
                        {canToggle() && (
                          <button
                            className={`table-btn ${item.is_available ? 'table-btn-warning' : 'table-btn-success'}`}
                            onClick={() => updateItem(item.id, { is_available: !item.is_available })}
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
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              className="table-btn table-btn-delete"
                              onClick={() => deleteItem(item.id)}
                            >
                              <FaTrash /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* --- Pagination Controls --- */}
            {filteredItems.length > ITEMS_PER_PAGE && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span className="pagination-page">
                  Page {currentPage} of {Math.ceil(filteredItems.length / ITEMS_PER_PAGE)}
                </span>
                <button
                  disabled={currentPage >= Math.ceil(filteredItems.length / ITEMS_PER_PAGE)}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
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
        .menu-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        .menu-card {
          background-color: #4a3060;
          border: 1px solid var(--border-light);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.2s ease;
        }
        .menu-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .menu-card-header {
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .menu-card-title {
          font-size: 1.2rem;
          font-weight: 600;
        }
        .menu-card-description {
          color: white;
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }
        .menu-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.95rem;
          margin-bottom: 0.75rem;
        }
        .card-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
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
        }
        .table-btn-edit { color: var(--primary); }
        .table-btn-delete { color: var(--danger); }
        .table-btn-warning { color: var(--warning); }
        .table-btn-success { color: var(--success); }
        .item-unavailable {
          opacity: 0.6;
        }
        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          user-select: none;
        }
        .status-active {
          background-color: #2d6a4f;
          color: white;
        }
        .status-cancelled {
          background-color: #9d0208;
          color: white;
        }
        .category-badge {
          background: var(--border-light);
          border-radius: 12px;
          padding: 0.2rem 0.6rem;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          user-select: none;
        }
        .price-tag {
          font-weight: 600;
          color: white;
        }
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .search-input {
          padding-left: 30px;
          border-radius: 4px;
          border: 1px solid var(--border-light);
          height: 2rem;
          width: 200px;
          font-size: 0.9rem;
        }
        .category-filter {
          border-radius: 4px;
          border: 1px solid var(--border-light);
          height: 2rem;
          padding: 0 0.5rem;
          font-size: 0.9rem;
        }
        .availability-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .toggle-switch {
          position: relative;
          width: 40px;
          height: 20px;
          display: inline-block;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #ccc;
          border-radius: 20px;
          transition: 0.4s;
        }
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          border-radius: 50%;
          transition: 0.4s;
        }
        .toggle-switch input:checked + .toggle-slider {
          background-color: #2196F3;
        }
        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }
        .toggle-label {
          font-size: 0.9rem;
          color: var(--text-primary);
          user-select: none;
        }
        .error-text {
          color: var(--danger);
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }
        .form-input.error {
          border-color: var(--danger);
        }

        /* Pagination Styles */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 1.5rem;
          gap: 1rem;
        }
        .pagination-page {
          font-weight: 600;
          color: var(--text-primary);
          user-select: none;
        }
          
      `}</style>
    </div>
  )
}
