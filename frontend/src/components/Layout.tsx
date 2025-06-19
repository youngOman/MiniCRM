import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import { Link } from 'react-router-dom';

const Layout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/customers', label: '會員資料', icon: '👥' },
    { to: '/orders', label: '訂單管理', icon: '📦' },
    { to: '/transactions', label: '交易記錄', icon: '💳' }, 
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <Link to="/" className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">BestCRM</h1>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;