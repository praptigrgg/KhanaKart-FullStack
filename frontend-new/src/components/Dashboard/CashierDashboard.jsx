import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api'; // ✅ switched from authAPI
import { ShoppingCart, CreditCard, Clock, CheckCircle, FileText, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CashierDashboard = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      const allOrders = response.data.data || response.data;

      const today = new Date().toDateString();
      const todayOrders = allOrders.filter(
        (o) => new Date(o.created_at).toDateString() === today
      );

      const paidOrders = todayOrders.filter((o) => o.is_paid);
      const pendingPayments = todayOrders.filter((o) => !o.is_paid);

      const totalRevenue = paidOrders.reduce((sum, order) => {
        const total = order.items?.reduce(
          (acc, item) => acc + (item.menu_item?.price || 0) * item.quantity,
          0
        );
        return sum + total;
      }, 0);

      const recentOrders = [...todayOrders]
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
        orders_today: todayOrders.length,
        paid_orders_today: paidOrders.length,
        pending_payments_today: pendingPayments.length,
        total_revenue_today: totalRevenue,
        recent_orders: recentOrders,
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cashier Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage payments and track revenue</p>
        </div>
        <Link
          to="/invoices"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <FileText className="w-5 h-5" />
          <span>Invoices</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Orders Today" value={data.orders_today || 0} icon={<ShoppingCart className="w-6 h-6 text-blue-600" />} bg="bg-blue-100" />
        <StatCard title="Paid Orders" value={data.paid_orders_today || 0} icon={<CreditCard className="w-6 h-6 text-green-600" />} bg="bg-green-100" />
        <StatCard title="Pending Payments" value={data.pending_payments_today || 0} icon={<Clock className="w-6 h-6 text-yellow-600" />} bg="bg-yellow-100" />
        <StatCard title="Revenue Today" value={`Rs.${(data.total_revenue_today || 0).toFixed(2)}`} icon={<CheckCircle className="w-6 h-6 text-purple-600" />} bg="bg-purple-100" />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
        {data.recent_orders && data.recent_orders.length > 0 ? (
          <div className="space-y-3">
            {data.recent_orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 text-orange-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    #{order.id}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Table {order.table_number}</p>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} items • {format(new Date(order.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.is_paid ? 'Paid' : 'Pending'}
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
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No orders today</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction to="/invoices" color="bg-purple-600 hover:bg-purple-700" icon={<FileText className="w-8 h-8 mx-auto mb-2" />} label="Invoices" />
        <QuickAction to="/orders" color="bg-green-600 hover:bg-green-700" icon={<ShoppingCart className="w-8 h-8 mx-auto mb-2" />} label="All Orders" />
        <QuickAction to="/payments" color="bg-yellow-600 hover:bg-yellow-700" icon={<CreditCard className="w-8 h-8 mx-auto mb-2" />} label="Payments" />
        <QuickAction to="/reports" color="bg-blue-600 hover:bg-blue-700" icon={<Clock className="w-8 h-8 mx-auto mb-2" />} label="Reports" />
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <OrderModal order={selectedOrder} close={() => setShowModal(false)} />
      )}
    </div>
  );
};

// 🧩 Reusable components
const StatCard = ({ title, value, icon, bg }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${bg}`}>{icon}</div>
    </div>
  </div>
);

const QuickAction = ({ to, color, icon, label }) => (
  <Link
    to={to}
    className={`${color} text-white p-4 rounded-lg transition-colors text-center`}
  >
    {icon}
    <p className="font-medium">{label}</p>
  </Link>
);

// 🪟 Order Modal (for viewing full order & payment details)
const OrderModal = ({ order, close }) => {
  const total = order.items?.reduce(
    (sum, item) => sum + (item.menu_item?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Order #{order.id}</h2>
            <button onClick={close} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <InfoBox label="Table" value={order.table?.table_number || 'N/A'} />
            <InfoBox
              label="Payment Status"
              value={
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    order.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.is_paid ? 'Paid' : 'Pending'}
                </span>
              }
            />
            <InfoBox label="Created" value={format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')} />
            <InfoBox label="Order Status" value={order.status || 'N/A'} />
          </div>

          <hr className="my-6" />

          {/* Order Items */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 text-lg">
                      {item.menu_item?.name || 'Unnamed Item'}
                    </h4>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>Qty: <span className="font-medium">{item.quantity}</span></span>
                      <span>Price: <span className="font-medium">Rs.{item.menu_item?.price?.toFixed(2) || 0}</span></span>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    Rs.{((item.menu_item?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No items found</div>
            )}
          </div>

          <hr className="my-6" />

          {/* Total */}
          <div className="flex justify-end">
            <p className="text-lg font-semibold text-gray-900">
              Total: Rs.{total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoBox = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
  </div>
);

export default CashierDashboard;
