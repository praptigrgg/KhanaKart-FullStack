import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import { ShoppingCart, CreditCard, Clock, CheckCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CashierDashboard = () => {
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Orders Today</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{data.orders_today || 0}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100">
                            <ShoppingCart className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Paid Orders</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{data.paid_orders_today || 0}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100">
                            <CreditCard className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{data.pending_payments_today || 0}</p>
                        </div>
                        <div className="p-3 rounded-full bg-yellow-100">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">Rs.{data.total_revenue_today?.toFixed(2) || 0}</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100">
                            <CheckCircle className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
                {data.recent_orders && data.recent_orders.length > 0 ? (
                    <div className="space-y-3">
                        {data.recent_orders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {/* Order Info */}
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

                                {/* Status + View Button */}
                                <div className="flex items-center space-x-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${order.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {order.is_paid ? 'Paid' : 'Pending'}
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
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No orders today</p>
                    </div>
                )}
            </div>


            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    to="/invoices"
                    className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
                >
                    <FileText className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">Invoices</p>
                </Link>
                <Link
                    to="/orders"
                    className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
                >
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">All Orders</p>
                </Link>
                <Link
                    to="/payments"
                    className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-700 transition-colors text-center"
                >
                    <CreditCard className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">Payments</p>
                </Link>
                <Link
                    to="/reports"
                    className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">Reports</p>
                </Link>
            </div>
        </div>
    );
};

export default CashierDashboard;
