import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { Printer, Clock, CheckCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const KOT = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      // Filter orders that are not completed or cancelled
      const activeOrders = (response.data.data || response.data).filter(
        order => !['completed', 'cancelled'].includes(order.status)
      );
      setOrders(activeOrders);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const viewOrder = async (orderId) => {
    try {
      const response = await orderAPI.getById(orderId);
      setSelectedOrder(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to fetch order details');
    }
  };

  const printKOT = (order) => {
    const kotContent = generateKOTHTML(order);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(kotContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generateKOTHTML = (order) => {
    return `
      <html>
        <head>
          <title>KOT - Order #${order.id}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 20px; 
              font-size: 14px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .order-info { 
              margin-bottom: 20px; 
              display: flex;
              justify-content: space-between;
            }
            .items { 
              margin-bottom: 20px; 
            }
            .item { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 5px;
              padding: 5px 0;
              border-bottom: 1px dashed #ccc;
            }
            .item-name { 
              font-weight: bold; 
            }
            .item-qty { 
              margin-left: 10px; 
            }
            .footer { 
              margin-top: 20px; 
              text-align: center; 
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .status {
              background: #f0f0f0;
              padding: 5px 10px;
              border-radius: 3px;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>KITCHEN ORDER TICKET</h2>
            <h3>RestaurantPOS</h3>
          </div>
          
          <div class="order-info">
            <div>
              <strong>Order #:</strong> ${order.id}<br>
              <strong>Table:</strong> ${order.table?.table_number || 'N/A'}<br>
              <strong>Time:</strong> ${format(new Date(order.created_at), 'MMM dd, HH:mm')}
            </div>
            <div>
              <span class="status">${order.status.toUpperCase()}</span>
            </div>
          </div>

          <div class="items">
            <h3>ITEMS TO PREPARE:</h3>
            ${order.items?.map(item => `
              <div class="item">
                <div>
                  <span class="item-name">${item.menuItem?.name || item.menu_item?.name || 'Unknown Item'}</span>
                  <span class="item-qty">x${item.quantity}</span>
                </div>
                <div>
                  <span class="status">${item.status?.toUpperCase() || 'PENDING'}</span>
                </div>
              </div>
            `).join('') || '<p>No items found</p>'}
          </div>

          <div class="footer">
            <p><strong>Total Items:</strong> ${order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</p>
            <p>Printed: ${format(new Date(), 'MMM dd, yyyy HH:mm:ss')}</p>
          </div>
        </body>
      </html>
    `;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'served':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (createdAt) => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const diffMinutes = (now - orderTime) / (1000 * 60);
    
    if (diffMinutes > 30) return 'border-l-4 border-red-500';
    if (diffMinutes > 15) return 'border-l-4 border-yellow-500';
    return 'border-l-4 border-green-500';
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
          <h1 className="text-3xl font-bold text-gray-900">Kitchen Order Tickets (KOT)</h1>
          <p className="text-gray-600 mt-1">Manage kitchen orders and print tickets</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Auto-refreshes every 30 seconds</span>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold mb-2">Priority Legend:</h3>
        <div className="flex space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500"></div>
            <span>New (0-15 min)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500"></div>
            <span>Moderate (15-30 min)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span>Urgent (30+ min)</span>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Orders</h3>
            <p className="text-gray-600">All orders have been completed or cancelled.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${getPriorityColor(order.created_at)}`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">Table {order.table?.table_number || 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Order Time:</span>
                    <span className="font-medium">{format(new Date(order.created_at), 'HH:mm')}</span>
                  </div>
                  <div className="text-sm text-gray-700 max-h-28 overflow-y-auto border border-gray-100 rounded p-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-gray-600 truncate" title={item.menuItem?.name || item.menu_item?.name || 'Unknown Item'}>
                          {item.menuItem?.name || item.menu_item?.name || 'Unknown Item'}
                        </span>
                        <span className="font-semibold">x{item.quantity}</span>
                      </div>
                    )) || <p className="text-gray-400 italic">No items</p>}
                  </div>
                </div>

                <div className="flex justify-between space-x-2">
                  <button
                    onClick={() => printKOT(order)}
                    className="flex items-center space-x-1 text-sm text-white bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded"
                    title="Print KOT"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>

                  <button
                    onClick={() => viewOrder(order.id)}
                    className="flex items-center space-x-1 text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">Order #{selectedOrder.id} Details</h2>

            <div className="mb-4">
              <p>
                <strong>Table:</strong> {selectedOrder.table?.table_number || 'N/A'}
              </p>
              <p>
                <strong>Order Time:</strong> {format(new Date(selectedOrder.created_at), 'MMM dd, yyyy HH:mm')}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`px-2 py-1 rounded ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Items</h3>
              <ul className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded p-3">
                {selectedOrder.items?.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center border-b border-gray-100 pb-1 last:border-b-0"
                  >
                    <h4 className="font-medium text-gray-900" title={item.menuItem?.name || item.menu_item?.name || 'Unknown Item'}>
                      {item.menuItem?.name || item.menu_item?.name || 'Unknown Item'}
                    </h4>
                    <span className="font-semibold">x{item.quantity}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${getStatusColor(item.status || 'pending')}`}
                    >
                      {item.status || 'pending'}
                    </span>
                  </li>
                )) || <p className="italic text-gray-400">No items available</p>}
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
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

export default KOT;
