import React, { useState, useEffect } from 'react';
import { orderAPI, orderItemAPI } from '../services/api';
import { Eye, X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const Orders = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentDiscount, setPaymentDiscount] = useState(0);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll(selectedStatus);
      const data = response.data.data || response.data;
      const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sorted);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const updateItemStatus = async (itemId, status) => {
    try {
      await orderItemAPI.updateStatus(itemId, status);
      toast.success('Item status updated');
      fetchOrders();
      if (selectedOrder) {
        const response = await orderAPI.getById(selectedOrder.id);
        setSelectedOrder(response.data);
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    }
  };

  const markPaid = async (orderId, paymentMethod) => {
    try {
      const finalDiscount = paymentDiscount || 0;
      await orderAPI.markPaid(orderId, paymentMethod, finalDiscount);
      toast.success('Payment successful');
      fetchOrders();

      // Show invoice
      const response = await orderAPI.getById(orderId);
      setInvoiceOrder(response.data);
      setShowInvoice(true);

      // Reset payment modal
      setShowPaymentModal(false);
      setShowQRCode(false);
      setPaymentDiscount(0);
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast.error('Payment failed');
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canUpdateStatus = (currentStatus, newStatus) => {
    const statusFlow = {
      pending: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['served', 'cancelled'],
      served: ['completed'],
      completed: [],
      cancelled: [],
    };
    return statusFlow[currentStatus]?.includes(newStatus);
  };

  const viewOrder = async (orderId) => {
    try {
      const response = await orderAPI.getById(orderId);
      console.log('Order details response:', response.data);
      setSelectedOrder(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    }
  };

  // Helper function to safely get menu item data
  const getMenuItemData = (item) => {
    // Try multiple possible structures
    const menuItem = item.menu_item || item.menuItem || item.MenuItem;

    return {
      name: menuItem?.name || 'Unknown Item',
      price: parseFloat(menuItem?.price) || 0,
      description: menuItem?.description || '',
      category: menuItem?.category || ''
    };
  };

  // Helper function to calculate item subtotal
  const calculateItemSubtotal = (item) => {
    const menuData = getMenuItemData(item);
    return menuData.price * (item.quantity || 0);
  };

  // Helper function to calculate discounted total
  const calculateDiscountedTotal = (originalAmount, discount) => {
    const discountAmount = (originalAmount * discount) / 100;
    return originalAmount - discountAmount;
  };
  // Reference for invoice content
  const invoiceRef = useRef();

  const handlePrint = useReactToPrint({
 contentRef: invoiceRef,
     documentTitle: `Invoice-${invoiceOrder?.id}`,
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all restaurant orders</p>
        </div>
        <Link to="/create-order" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          Create Order
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-4 py-2 rounded-lg transition-colors ${selectedStatus === '' ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            All Orders
          </button>
          {['pending', 'preparing', 'ready', 'served', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${selectedStatus === status ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.N.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Table {order.table?.table_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rs.{(order.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {order.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewOrder(order.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user?.role !== 'kitchen' && !order.is_paid && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowPaymentModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Proceed Payment"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Order #{selectedOrder.id}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Table</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedOrder.table?.table_number || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {format(new Date(selectedOrder.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Payment</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedOrder.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedOrder.is_paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>

              <hr className="my-6" />

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map(item => {
                      const menuData = getMenuItemData(item);
                      const subtotal = calculateItemSubtotal(item);

                      return (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-lg">{menuData.name}</h4>
                              {menuData.description && (
                                <p className="text-sm text-gray-600 mt-1">{menuData.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <span>Quantity: <span className="font-medium">{item.quantity}</span></span>
                                <span>Price: <span className="font-medium">Rs.{menuData.price.toFixed(2)}</span></span>
                                <span>Subtotal: <span className="font-medium text-orange-600">Rs.{subtotal.toFixed(2)}</span></span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2 ml-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                              {user?.role === 'kitchen' && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {canUpdateStatus(item.status, 'preparing') && (
                                    <button
                                      onClick={() => updateItemStatus(item.id, 'preparing')}
                                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                    >
                                      Start Preparing
                                    </button>
                                  )}
                                  {canUpdateStatus(item.status, 'ready') && (
                                    <button
                                      onClick={() => updateItemStatus(item.id, 'ready')}
                                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                    >
                                      Mark Ready
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No items found in this order</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-xl font-bold text-orange-600">
                    Rs.{(selectedOrder.total_amount || 0).toFixed(2)}
                  </span>
                </div>

                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                    <span>Discount ({selectedOrder.discount}%):</span>
                    <span className="text-red-600">
                      -Rs.{(((selectedOrder.total_amount || 0) * (selectedOrder.discount || 0)) / 100).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Update Actions */}
              {user?.role === 'kitchen' && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Update Order Status:</h4>
                  <div className="flex flex-wrap gap-2">
                    {canUpdateStatus(selectedOrder.status, 'preparing') && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors"
                      >
                        Start Preparing
                      </button>
                    )}
                    {canUpdateStatus(selectedOrder.status, 'ready') && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                        className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors"
                      >
                        Mark as Ready
                      </button>
                    )}
                    {canUpdateStatus(selectedOrder.status, 'served') && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'served')}
                        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-medium transition-colors"
                      >
                        Mark as Served
                      </button>
                    )}
                    {canUpdateStatus(selectedOrder.status, 'completed') && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                      >
                        Mark as Completed
                      </button>
                    )}
                    {canUpdateStatus(selectedOrder.status, 'cancelled') && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && !showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Process Payment</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentDiscount(0);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Details */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">Order #{selectedOrder.id}</span>
                <span className="text-sm text-gray-500">
                  Table {selectedOrder.table?.table_number || 'N/A'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {selectedOrder.items?.length || 0} items • {format(new Date(selectedOrder.created_at), 'MMM dd, HH:mm')}
              </div>

              {/* Items Summary */}
              <div className="space-y-2 mb-4">
                {selectedOrder.items?.map(item => {
                  const menuData = getMenuItemData(item);
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{menuData.name} x{item.quantity}</span>
                      <span>Rs.{(menuData.price * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Original Total */}
              <div className="flex justify-between items-center font-medium text-gray-900 mb-2">
                <span>Subtotal:</span>
                <span>Rs.{(selectedOrder.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Discount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={paymentDiscount}
                onChange={(e) => setPaymentDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter discount percentage"
              />
            </div>

            {/* Final Total */}
            <div className="mb-6 p-4 bg-orange-50 rounded-lg">
              {paymentDiscount > 0 && (
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Discount ({paymentDiscount}%):</span>
                  <span>-Rs.{(((selectedOrder.total_amount || 0) * paymentDiscount) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Final Total:</span>
                <span className="text-2xl font-bold text-orange-600">
                  Rs.{calculateDiscountedTotal(selectedOrder.total_amount || 0, paymentDiscount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => markPaid(selectedOrder.id, 'cash')}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Pay with Cash
              </button>
              <button
                onClick={() => setShowQRCode(true)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Pay with QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">QR Payment</h2>
              <button
                onClick={() => {
                  setShowQRCode(false);
                  setShowPaymentModal(false);
                  setPaymentDiscount(0);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">Order #{selectedOrder.id}</p>
              <p className="text-2xl font-bold text-orange-600 mb-4">
                Rs.{calculateDiscountedTotal(selectedOrder.total_amount || 0, paymentDiscount).toFixed(2)}
              </p>
            </div>

            {/* QR Code Placeholder */}
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
              <div className="w-48 h-48 mx-auto bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-black mx-auto mb-2 rounded" style={{
                    background: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='10' height='10' fill='black'/%3E%3Crect x='20' y='0' width='10' height='10' fill='black'/%3E%3Crect x='40' y='0' width='10' height='10' fill='black'/%3E%3Crect x='0' y='20' width='10' height='10' fill='black'/%3E%3Crect x='20' y='20' width='10' height='10' fill='white'/%3E%3Crect x='40' y='20' width='10' height='10' fill='black'/%3E%3C/svg%3E")`,
                    backgroundSize: 'cover'
                  }}></div>
                  <p className="text-xs text-gray-500">QR Code</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code with your payment app
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  markPaid(selectedOrder.id, 'qr');
                  setShowQRCode(false);
                }}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Payment Completed
              </button>
              <button
                onClick={() => setShowQRCode(false)}
                className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back to Payment Options
              </button>
            </div>
          </div>
        </div>
      )}
      {showInvoice && invoiceOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Invoice</h2>
              <button
                onClick={() => setShowInvoice(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Content */}
            <div ref={invoiceRef} className="p-6 border rounded-lg bg-white">
              {/* Header */}
              <div className="text-center mb-6">
                {/* If you have a logo, place it here */}
                {/* <img src="/logo.png" alt="Logo" className="h-16 mx-auto mb-2" /> */}
                <h1 className="text-2xl font-bold text-gray-900">🍽️ KhanaKart (...Restaurant)</h1>
                <p className="text-sm text-gray-600">Pokhara, Nepal</p>
                <p className="text-sm text-gray-600">Phone: +977 123456789</p>
              </div>

              <hr className="my-4" />

              {/* Invoice Info */}
              <div className="flex justify-between text-sm mb-6">
                <div>
                  <p><span className="font-medium">Invoice ID:</span> #{invoiceOrder.id}</p>
                  <p><span className="font-medium">Table:</span> {invoiceOrder.table?.table_number || 'N/A'}</p>
                </div>
                <div className="text-right">
                 <p><strong>Date:</strong> {format(new Date(), 'MMM dd, yyyy')}</p>
<p><strong>Time:</strong> {format(new Date(), 'HH:mm')}</p>

                </div>
              </div>

              {/* Items Table */}
              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm">
                    <th className="border p-2 text-left">Item</th>
                    <th className="border p-2 text-center">Qty</th>
                    <th className="border p-2 text-right">Price</th>
                    <th className="border p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceOrder.items?.map(item => {
                    const menuData = getMenuItemData(item);
                    const subtotal = calculateItemSubtotal(item);
                    return (
                      <tr key={item.id} className="text-sm">
                        <td className="border p-2">{menuData.name}</td>
                        <td className="border p-2 text-center">{item.quantity}</td>
                        <td className="border p-2 text-right">Rs.{menuData.price.toFixed(2)}</td>
                        <td className="border p-2 text-right">Rs.{subtotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                  <span>Subtotal:</span>
                  <span>Rs.{(invoiceOrder.total_amount || 0).toFixed(2)}</span>
                </div>
                {invoiceOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-red-600 mb-1">
                    <span>Discount ({invoiceOrder.discount}%):</span>
                    <span>-Rs.{(((invoiceOrder.total_amount || 0) * invoiceOrder.discount) / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Grand Total:</span>
                  <span className="text-orange-600">
                    Rs.{calculateDiscountedTotal(invoiceOrder.total_amount || 0, invoiceOrder.discount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 text-sm text-gray-600">
                <p>✨ Thank you for dining with us! ✨</p>
                <p>Please visit again 🙏</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setShowInvoice(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;