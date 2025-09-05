import React, { useEffect, useState } from 'react';
import { useApi } from '../api/useApi';
import { useAuth } from '../context/AuthContext';

export default function RolesPage() {
  const { role } = useAuth();

  // Restrict access to admin only
  if (role !== 'admin') {
    return <p style={{ color: 'red' }}>Unauthorized. You do not have access to this page.</p>;
  }

  const { get, post, put, del } = useApi();

  // State
  const [roles, setRoles] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleName, setEditingRoleName] = useState('');

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchRoles() {
    setLoading(true);
    setError('');
    try {
      const data = await get('/roles');  // <-- changed here
      if (!data.message) {
        setRoles(data);
      } else {
        setError(data.message || 'Failed to load roles');
      }
    } catch (e) {
      setError('Failed to load roles');
    }
    setLoading(false);
  }

  // Create role
  async function createRole(e) {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setError('');
    try {
      const data = await post('/roles', { name: newRoleName.trim() });
      if (data && data.id) {  // Check for 'id' in the returned role object
        setRoles(prev => [...prev, data]);  // Add the new role to the list
        setNewRoleName('');  // Clear the input field
      } else {
        setError(data.message || 'Failed to create role');
      }
    } catch (err) {
      setError('Failed to create role');
      console.error(err);  // Log the error to see what went wrong
    }
  }

  // Start editing role
  function startEdit(role) {
    setEditingRoleId(role.id);
    setEditingRoleName(role.name);
    setError('');
  }

  // Cancel editing
  function cancelEdit() {
    setEditingRoleId(null);
    setEditingRoleName('');
    setError('');
  }

  // Save edited role
  async function saveEdit(roleId) {
    if (!editingRoleName.trim()) return;

    setError('');
    try {
      const data = await put(`/roles/${roleId}`, { name: editingRoleName.trim() });
      if (data && data.id) {  // Check for 'id' in the updated role
        setRoles(prev =>
          prev.map(r => (r.id === roleId ? { ...r, name: editingRoleName.trim() } : r))
        );
        cancelEdit();  // Reset editing state
      } else {
        setError(data.message || 'Failed to update role');
      }
    } catch (err) {
      setError('Failed to update role');
      console.error(err);  // Log the error to see what went wrong
    }
  }

  // Delete role
  async function deleteRole(roleId) {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    setError('');
    try {
      const data = await del(`/roles/${roleId}`);  // <-- changed here
      if (!data.message) {
        setRoles(prev => prev.filter(r => r.id !== roleId));
      } else {
        setError(data.message || 'Failed to delete role');
      }
    } catch {
      setError('Failed to delete role');
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: '1rem' }}>
      <h1>Roles Management</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Create new role */}
      <form onSubmit={createRole} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="New role name"
          value={newRoleName}
          onChange={e => setNewRoleName(e.target.value)}
          required
          style={{ padding: '0.5rem', marginRight: '0.5rem', width: '100%' }}
        />
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s', // Hover effect without fading
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
        >
          Add Role
        </button>
      </form>

      {/* Loading state */}
      {loading ? (
        <p>Loading roles...</p>
      ) : roles.length === 0 ? (
        <p>No roles found.</p>
      ) : (
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {roles.map(role => (
            <li
              key={role.id}
              style={{
                marginBottom: '0.5rem',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {editingRoleId === role.id ? (
                <>
                  <input
                    type="text"
                    value={editingRoleName}
                    onChange={e => setEditingRoleName(e.target.value)}
                    style={{
                      flex: 1,
                      marginRight: '0.5rem',
                      padding: '0.3rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  />
                  <button
                    onClick={() => saveEdit(role.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '0.5rem',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span>{role.name}</span>
                  <div>
                    <button
                      onClick={() => startEdit(role)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '0.5rem',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRole(role.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      title="Delete role"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
