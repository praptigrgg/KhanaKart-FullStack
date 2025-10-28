import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/api';
import { Plus, Edit, Trash2, Package, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [showQuickDecrease, setShowQuickDecrease] = useState(false);
  const [decreaseItem, setDecreaseItem] = useState(null);
  const [decreaseAmount, setDecreaseAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, suppliersRes, purchasesRes] = await Promise.all([
        inventoryAPI.getItems(),
        inventoryAPI.getSuppliers(),
        inventoryAPI.getPurchases()
      ]);
      setItems(itemsRes.data);
      setSuppliers(suppliersRes.data);
      setPurchases(purchasesRes.data);
    } catch (error) {
      toast.error('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
    
    if (type === 'item') {
      setFormData(item ? {
        name: item.name,
        quantity: item.quantity.toString(),
        unit: item.unit,
        price: item.price?.toString() || ''
      } : {
        name: '',
        quantity: '',
        unit: '',
        price: ''
      });
    } else if (type === 'supplier') {
      setFormData(item ? {
        name: item.name,
        contact: item.contact,
        email: item.email || '',
        address: item.address || ''
      } : {
        name: '',
        contact: '',
        email: '',
        address: ''
      });
    } else if (type === 'purchase') {
      setFormData({
        item_id: '',
        supplier_id: '',
        quantity: '',
        price: '',
        type: 'increase'
      });
    }
  };

  const openQuickDecrease = (item) => {
    setDecreaseItem(item);
    setDecreaseAmount('1');
    setShowQuickDecrease(true);
  };

  const handleQuickDecrease = async (e) => {
    e.preventDefault();
    
    const amount = parseInt(decreaseAmount);
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount > decreaseItem.quantity) {
      toast.error('Cannot decrease more than current stock');
      return;
    }

    try {
      // Record the decrease as a stock movement
      await inventoryAPI.createPurchase({
        item_id: decreaseItem.id,
        supplier_id: null,
        quantity: amount,
        price: null,
        type: 'decrease'
      });
      
      toast.success(`Decreased ${decreaseItem.name} by ${amount} ${decreaseItem.unit}`);
      setShowQuickDecrease(false);
      setDecreaseItem(null);
      setDecreaseAmount('');
      fetchData();
    } catch (error) {
      toast.error('Failed to decrease stock');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'item') {
        const data = {
          ...formData,
          quantity: parseInt(formData.quantity),
          price: formData.price ? parseFloat(formData.price) : null
        };
        
        if (editingItem) {
          await inventoryAPI.updateItem(editingItem.id, data);
          toast.success('Item updated successfully');
        } else {
          await inventoryAPI.createItem(data);
          toast.success('Item created successfully');
        }
      } else if (modalType === 'supplier') {
        if (editingItem) {
          await inventoryAPI.updateSupplier(editingItem.id, formData);
          toast.success('Supplier updated successfully');
        } else {
          await inventoryAPI.createSupplier(formData);
          toast.success('Supplier created successfully');
        }
      } else if (modalType === 'purchase') {
        const data = {
          ...formData,
          item_id: parseInt(formData.item_id),
          supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
          quantity: parseInt(formData.quantity),
          price: formData.price ? parseFloat(formData.price) : null
        };
        await inventoryAPI.createPurchase(data);
        toast.success('Purchase recorded successfully');
      }
      
      setShowModal(false);
      setEditingItem(null);
      setFormData({});
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (type === 'item') {
        await inventoryAPI.deleteItem(id);
        toast.success('Item deleted successfully');
      } else if (type === 'supplier') {
        await inventoryAPI.deleteSupplier(id);
        toast.success('Supplier deleted successfully');
      }
      fetchData();
    } catch (error) {
      toast.error('Failed to delete item');
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
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Manage items, suppliers, and stock movements</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'items', label: 'Items', icon: Package },
            { id: 'suppliers', label: 'Suppliers', icon: TrendingUp },
            { id: 'purchases', label: 'Stock Movements', icon: TrendingDown }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Inventory Items</h2>
            <button
              onClick={() => openModal('item')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.quantity < 10 ? 'bg-red-100 text-red-800' :
                          item.quantity < 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.price ? `Rs.${item.price}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openQuickDecrease(item)}
                          className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 p-1 rounded transition-colors"
                          title="Quick decrease quantity"
                          disabled={item.quantity === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('item', item)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit item"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('item', item.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Suppliers</h2>
            <button
              onClick={() => openModal('supplier')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Supplier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map(supplier => (
              <div key={supplier.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal('supplier', supplier)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete('supplier', supplier.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Contact:</strong> {supplier.contact_info}</p>
                  {supplier.email && <p><strong>Email:</strong> {supplier.email}</p>}
                  {supplier.address && <p><strong>Address:</strong> {supplier.address}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchases Tab */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Stock Movements</h2>
            <button
              onClick={() => openModal('purchase')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Record Movement</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchases.map(purchase => (
                    <tr key={purchase.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {purchase.item?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          purchase.type === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {purchase.type === 'increase' ? 'Stock In' : 'Stock Out'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {purchase.type === 'increase' ? '+' : '-'}{purchase.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {purchase.price ? `$${purchase.price}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {purchase.supplier?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quick Decrease Modal */}
      {showQuickDecrease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-orange-100 p-2 rounded-full">
                <Minus className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Use Item</h2>
                <p className="text-gray-600 text-sm">Decrease stock for: {decreaseItem?.name}</p>
              </div>
            </div>
            
            <form onSubmit={handleQuickDecrease} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="font-semibold">{decreaseItem?.quantity} {decreaseItem?.unit}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Use
                </label>
                <input
                  type="number"
                  value={decreaseAmount}
                  onChange={(e) => setDecreaseAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  min="1"
                  max={decreaseItem?.quantity}
                  placeholder="Enter amount"
                />
              </div>
              
              {parseInt(decreaseAmount) > decreaseItem?.quantity && (
                <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4" />
                  <span>Cannot use more than current stock</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickDecrease(false);
                    setDecreaseItem(null);
                    setDecreaseAmount('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                  disabled={!decreaseAmount || parseInt(decreaseAmount) > decreaseItem?.quantity || parseInt(decreaseAmount) <= 0}
                >
                  <Minus className="w-4 h-4" />
                  <span>Use Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Modal (existing code remains the same) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {modalType === 'item' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={formData.quantity || ''}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={formData.unit || ''}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </>
              )}

              {modalType === 'supplier' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                    <input
                      type="text"
                      value={formData.contact || ''}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {modalType === 'purchase' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                    <select
                      value={formData.item_id || ''}
                      onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Item</option>
                      {items.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.type || 'increase'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="increase">Stock In</option>
                      <option value="decrease">Stock Out</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={formData.quantity || ''}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <select
                      value={formData.supplier_id || ''}
                      onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select Supplier (Optional)</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    setFormData({});
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;