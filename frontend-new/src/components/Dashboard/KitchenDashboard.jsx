import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import { ChefHat, Clock, CheckCircle, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const KitchenDashboard = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await authAPI.dashboard();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.in_preparation || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.ready_to_serve || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.served_today || 0}</p>
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
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 text-orange-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    #{order.id}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Table {order.table?.table_number || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} items • {format(new Date(order.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                    order.status === 'ready' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    View
                  </Link>
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
    </div>
  );
};

export default KitchenDashboard;