import React, { useState, useEffect } from 'react';
import { tableAPI } from '../services/api';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Tables = () => {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    capacity: '',
    status: 'available',
  });
  const [bulkData, setBulkData] = useState({
    count: '',
    capacity: '',
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await tableAPI.getAll();
      setTables(response.data);
    } catch (error) {
      toast.error('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingTable) return;

    const payload =
      user?.role === 'admin'
        ? {
            capacity: parseInt(formData.capacity),
            status: formData.status,
          }
        : {
            status: formData.status,
          };

    try {
      await tableAPI.update(editingTable.id, payload);
      toast.success('Table updated successfully');
      setShowModal(false);
      setEditingTable(null);
      setFormData({ capacity: '', status: 'available' });
      fetchTables();
    } catch (error) {
      toast.error('Failed to update table');
    }
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    try {
      await tableAPI.bulkCreate(parseInt(bulkData.count), parseInt(bulkData.capacity));
      toast.success('Tables created successfully');
      setShowBulkModal(false);
      setBulkData({ count: '', capacity: '' });
      fetchTables();
    } catch (error) {
      toast.error('Failed to create tables');
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      capacity: table.capacity.toString(),
      status: table.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await tableAPI.delete(id);
        toast.success('Table deleted successfully');
        fetchTables();
      } catch (error) {
        toast.error('Failed to delete table');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600 mt-1">Manage restaurant tables and their status</p>
        </div>
        {user?.role === 'admin' && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Bulk Create</span>
            </button>
          </div>
        )}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`bg-white rounded-lg shadow-sm border-2 p-4 transition-all hover:shadow-md ${
              table.status === 'available'
                ? 'border-green-200'
                : table.status === 'occupied'
                ? 'border-red-200'
                : 'border-yellow-200'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                Table {table.table_number}
              </div>
              <div className="flex items-center justify-center mb-3">
                <Users className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-600">{table.capacity} seats</span>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  table.status
                )}`}
              >
                {table.status}
              </span>

              <div className="flex justify-center space-x-2 mt-3">
                {(user?.role === 'admin' || user?.role === 'waiter') && (
                  <button
                    onClick={() => handleEdit(table)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(table.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showModal && editingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Table {editingTable.table_number}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {user?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                    min="1"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTable(null);
                    setFormData({ capacity: '', status: 'available' });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Multiple Tables</h2>
            <form onSubmit={handleBulkCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tables</label>
                <input
                  type="number"
                  value={bulkData.count}
                  onChange={(e) => setBulkData({ ...bulkData, count: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity per Table</label>
                <input
                  type="number"
                  value={bulkData.capacity}
                  onChange={(e) => setBulkData({ ...bulkData, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  min="1"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkData({ count: '', capacity: '' });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Tables
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
