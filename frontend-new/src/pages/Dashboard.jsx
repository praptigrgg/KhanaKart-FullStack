import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import WaiterDashboard from '../components/Dashboard/WaiterDashboard';
import KitchenDashboard from '../components/Dashboard/KitchenDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'waiter':
        return <WaiterDashboard />;
      case 'kitchen':
        return <KitchenDashboard />;
      default:
        return <div>Unauthorized access</div>;
    }
  };

  return renderDashboard();
};

export default Dashboard;