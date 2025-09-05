import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';


import './TablesPage.css'; // assuming you create this file

export default function TablesPage() {
    const [tables, setTables] = useState([]);
    const [count, setCount] = useState(1);
    const [capacity, setCapacity] = useState(4);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ capacity: 4, status: 'available' });

    const [statusFilter, setStatusFilter] = useState('all');
    const [capacityFilter, setCapacityFilter] = useState(''); // NEW state for capacity filter
    const [orders, setOrders] = useState([]);

    const { role } = useAuth(); // 🔑 check user role

    const fetchTables = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tables');
            setTables(res.data);
            setError(null);
        } catch (err) {
            setError('Failed to load tables');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTablesAndOrders();
    }, []);

    const handleCreateTables = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tables/bulk-create', {
                count: Number(count),
                capacity: Number(capacity),
            });
            fetchTables();
            setCount(1);
            setCapacity(4);
        } catch {
            alert('Failed to create tables');
        }
    };

    const startEditing = (table) => {
        setEditingId(table.id);
        setEditForm({ capacity: table.capacity, status: table.status });
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const saveEdit = async (id) => {
        try {
            await api.put(`/tables/${id}`, {
                capacity: Number(editForm.capacity),
                status: editForm.status,
            });
            setEditingId(null);
            fetchTables();
        } catch {
            alert('Failed to update table');
        }
    };

    const deleteTable = async (id) => {
        if (!window.confirm('Are you sure you want to delete this table?')) return;
        try {
            await api.delete(`/tables/${id}`);
            fetchTables();
        } catch {
            alert('Failed to delete table');
        }
    };
    const fetchTablesAndOrders = async () => {
        setLoading(true);
        try {
            const [tablesRes, ordersRes] = await Promise.all([
                api.get('/tables'),
                api.get('/orders'),
            ]);
            setTables(tablesRes.data);
            setOrders(ordersRes.data);
            setError(null);
        } catch (err) {
            setError('Failed to load tables or orders');
        }
        setLoading(false);
    };

    // Filter by status AND capacity
    const filteredTables = tables.filter((table) => {
        const statusMatch = statusFilter === 'all' || table.status === statusFilter;
        const capacityMatch = capacityFilter === '' || table.capacity >= Number(capacityFilter);
        return statusMatch && capacityMatch;
    });

    return (
        <div className="tables-page">
            <h2>Manage Tables</h2>

            {/* Admin: Bulk create form */}
            {role === 'admin' && (
                <form onSubmit={handleCreateTables} className="create-table-form">
                    <label>
                        Number of Tables:
                        <input
                            type="number"
                            value={count}
                            min="1"
                            onChange={(e) => setCount(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Capacity per Table:
                        <input
                            type="number"
                            value={capacity}
                            min="1"
                            onChange={(e) => setCapacity(e.target.value)}
                            required
                        />
                    </label>
                    <button type="submit">Add Tables</button>
                </form>
            )}

            {/* Status Filter and Capacity Filter */}
            <div className="table-filter">
                <label>Filter by Status:&nbsp;</label>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                </select>

                <label style={{ marginLeft: '1rem' }}>
                    Min Capacity:&nbsp;
                    <input
                        type="number"
                        min="1"
                        value={capacityFilter}
                        onChange={(e) => setCapacityFilter(e.target.value)}
                        placeholder="Any"
                        style={{ width: '60px' }}
                    />
                </label>
            </div>

            {/* Cards */}
            {loading ? (
                <p>Loading tables...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <div className="table-cards">
                    {filteredTables.map((table) => {
                        const isEditing = editingId === table.id;
                        return (
                            <div
                                key={table.id}
                                className={`table-card ${table.status}`}
                            >
                                <h4>Table {table.table_number}</h4>
                                {isEditing ? (
                                    <>
                                        <label>
                                            Capacity:
                                            <input
                                                type="number"
                                                min="1"
                                                value={editForm.capacity}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, capacity: e.target.value })
                                                }
                                            />
                                        </label>
                                        <label>
                                            Status:
                                            <select
                                                value={editForm.status}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, status: e.target.value })
                                                }
                                            >
                                                <option value="available">Available</option>
                                                <option value="occupied">Occupied</option>
                                                <option value="reserved">Reserved</option>
                                            </select>
                                        </label>
                                        <div className="card-actions">
                                            <button onClick={() => saveEdit(table.id)}>Save</button>
                                            <button onClick={cancelEditing}>Cancel</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Capacity:</strong> {table.capacity}</p>
                                        <p><strong>Status:</strong> {table.status}</p>
                                        {role === 'admin' && (
                                            <div className="card-actions">
                                                <button onClick={() => startEditing(table)}>Edit</button>
                                                <button onClick={() => deleteTable(table.id)}>Delete</button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
