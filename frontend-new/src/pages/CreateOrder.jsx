import React, { useState, useEffect } from 'react';
import { menuAPI, tableAPI, orderAPI } from '../services/api';
import { Plus, Minus, ShoppingCart, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [step, setStep] = useState(1); // 1: Select table, 2: Create order

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuResponse, tablesResponse] = await Promise.all([
        menuAPI.getAll(),
        tableAPI.getAll()
      ]);
      setMenuItems(menuResponse.data.filter(item => item.is_available));
      setTables(tablesResponse.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const selectTable = (table) => {
    if (table.status !== 'available') {
      toast.error('This table is not available');
      return;
    }
    setSelectedTable(table);
    setStep(2);
  };

  const goBackToTableSelection = () => {
    setSelectedTable(null);
    setStep(1);
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.menu_item_id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.menu_item_id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        menu_item_id: item.id,
        quantity: 1,
        menuItem: item
      }]);
    }
  };

  const updateQuantity = (menuItemId, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.menu_item_id !== menuItemId));
    } else {
      setCart(cart.map(item =>
        item.menu_item_id === menuItemId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (menuItemId) => {
    setCart(cart.filter(item => item.menu_item_id !== menuItemId));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((total, item) => 
      total + (item.menuItem.price * item.quantity), 0
    );
    const discountAmount = (subtotal * discount) / 100;
    return subtotal - discountAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error('Please add items to cart');
      return;
    }

    try {
      const orderData = {
        table_id: parseInt(selectedTable.id),
        items: cart.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity
        })),
        discount: discount
      };

      await orderAPI.create(orderData);
      toast.success('Order created successfully');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  const categories = [...new Set(menuItems.map(item => item.category).filter(Boolean))];
  
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Step 1: Table Selection
  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Select a Table</h1>
          <p className="text-gray-600 mt-2">Choose an available table to start creating an order</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <div
              key={table.id}
              onClick={() => selectTable(table)}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                table.status === 'available'
                  ? 'border-green-500 hover:border-green-600 bg-green-50 hover:bg-green-100'
                  : 'border-gray-300 bg-gray-100 opacity-75 cursor-not-allowed'
              }`}
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold ${
                  table.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {table.table_number}
                </div>
                <h3 className="mt-4 font-semibold text-lg">Table {table.table_number}</h3>
                <p className="text-gray-600">Capacity: {table.capacity} seats</p>
                <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  table.status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {table.status === 'available' ? 'Available' : 'Occupied'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Order Creation
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={goBackToTableSelection}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Order</h1>
            <p className="text-gray-600 mt-1">
              Table {selectedTable.table_number} · {selectedTable.capacity} seats
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          selectedTable.status === 'available' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {selectedTable.status === 'available' ? 'Available' : 'Occupied'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-orange-600">Rs.{item.price}</span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                )}
                <button
                  onClick={() => addToCart(item)}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Order Summary
            </h2>

            {/* Table Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Table</p>
              <p className="font-medium">Table {selectedTable.table_number} · {selectedTable.capacity} seats</p>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 mb-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items in cart</p>
              ) : (
                cart.map((item) => (
                  <div key={item.menu_item_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.menuItem.name}</h4>
                      <p className="text-sm text-gray-600">Rs.{item.menuItem.price} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.menu_item_id)}
                        className="p-1 text-red-600 hover:text-red-800 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-orange-600">Rs.{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={cart.length === 0}
              className="w-full mt-4 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;