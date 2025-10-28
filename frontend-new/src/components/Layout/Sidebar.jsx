import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Menu, 
  ShoppingCart, 
  Receipt, 
  Package, 
  Users, 
  ChefHat,
  TableProperties,
  FileText,
  LogOut,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { path: '/menu', icon: Menu, label: 'Menu Management' },
        { path: '/tables', icon: TableProperties, label: 'Tables' },
        { path: '/orders', icon: ShoppingCart, label: 'Orders' },
        { path: '/create-order', icon: Plus, label: 'Create Order' },
        { path: '/invoices', icon: Receipt, label: 'Invoices' },
        { path: '/inventory', icon: Package, label: 'Inventory' },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/kot', icon: FileText, label: 'KOT' },
      ];
    }

    if (user?.role === 'waiter') {
      return [
        ...baseItems,
        { path: '/menu', icon: Menu, label: 'Menu' },
        { path: '/tables', icon: TableProperties, label: 'Tables' },
        { path: '/orders', icon: ShoppingCart, label: 'Orders' },
        { path: '/create-order', icon: Plus, label: 'Create Order' },
        { path: '/invoices', icon: Receipt, label: 'Invoices' },
        { path: '/kot', icon: FileText, label: 'KOT' },

      ];
    }

    if (user?.role === 'kitchen') {
      return [
        ...baseItems,
        { path: '/orders', icon: ShoppingCart, label: 'Orders' },
        { path: '/kot', icon: FileText, label: 'KOT' },
         { path: '/inventory', icon: Package, label: 'Inventory' },
      ];
    }

    if (user?.role === 'cashier') {
      return [
        ...baseItems,
        { path: '/tables', icon: TableProperties, label: 'Tables' },
        { path: '/orders', icon: ShoppingCart, label: 'Orders' },
        { path: '/invoices', icon: Receipt, label: 'Invoices' },
   
      ];
    }

    return baseItems;
  };

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <ChefHat className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-xl font-bold">KhanaKart</h1>
            <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {getMenuItems().map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="mb-4">
          <p className="text-sm text-gray-400">Logged in as</p>
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;