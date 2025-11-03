// components/layout/Navigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Projects', path: '/projects' },
    { name: 'Plots', path: '/plots' },
    { name: 'Analysis', path: '/biodiversity' },
    { name: 'Export', path: '/export' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-2 mb-8 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap justify-center gap-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              location.pathname === item.path
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 hover:text-primary-700 dark:hover:text-primary-300 shadow-sm'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;