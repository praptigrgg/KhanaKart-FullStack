import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api'; // ✅ updated import
import { ChefHat, Clock, CheckCircle, Flame, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const KitchenDashboard = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // ✅ auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      const allOrders = response.data.data || response.data;

      // Filter out cancelled/completed orders
      const activeOrders = allOrders.filter(
        (o) => !['cancelled', 'completed'].includes(o.status)
      );

      // Count stats
      const in_preparation = activeOrders.filter((o) => o.status === 'preparing').length;
      const ready_to_serve = activeOrders.filter((o) => o.status === 'ready').length;
      const served_today = activeOrders.filter((o) => o.status === 'served').length;

      // Sort and prepare recent orders
      const recent_orders = [...activeOrders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map((order) => ({
          ...order,
          table_number: order.table?.table_number ?? 'N/A',
          items:
            order.items?.map((item) => ({
              ...item,
              menu_item: item.menu_item ?? item.menuItem ?? {
                name: item.name,
                price: item.price ?? 0,
              },
            })) ?? [],
        }));

      setData({
        in_preparation,
        ready_to_serve,
        served_today,
        recent_orders,
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'served':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
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
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kitchen Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor order preparation status</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Preparation</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data.in_preparation || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready to Serve</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data.ready_to_serve || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Served Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data.served_today || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <ChefHat className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
        {data.recent_orders && data.recent_orders.length > 0 ? (
          <div className="space-y-3">
            {data.recent_orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 text-orange-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    #{order.id}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Table {order.table_number}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} items •{' '}
                      {format(new Date(order.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No recent orders</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/orders?status=preparing"
          className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors text-center"
        >
          <Flame className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Orders in Preparation</p>
        </Link>
        <Link
          to="/orders?status=ready"
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
        >
          <CheckCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Ready to Serve</p>
        </Link>
        <Link
          to="/kot"
          className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          <Clock className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">KOT Management</p>
        </Link>
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          close={() => setShowModal(false)}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
};

const OrderModal = ({ order, close, getStatusColor }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Order #{order.id}
          </h2>
          <button
            onClick={close}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Table</p>
            <p className="text-lg font-semibold text-gray-900">
              {order.table?.table_number || 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Created</p>
            <p className="text-sm font-semibold text-gray-900">
              {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Payment</p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                order.is_paid
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {order.is_paid ? 'Paid' : 'Unpaid'}
            </span>
          </div>
        </div>

        <hr className="my-6" />

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 text-lg">
                        {item.menu_item?.name || 'Unnamed Item'}
                      </h4>
                      {item.menu_item?.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.menu_item.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>
                          Quantity:{' '}
                          <span className="font-medium">{item.quantity}</span>
                        </span>
                        {item.menu_item?.price != null && (
                          <span>
                            Price:{' '}
                            <span className="font-medium">
                              Rs.{Number(item.menu_item.price).toFixed(2)}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No items found in this order</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default KitchenDashboard;
