// components/layout/AppLayout.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title,
  actions 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <Link 
              to="/" 
              className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
            >
              Project Terra 🌱
            </Link>
            {actions && <div>{actions}</div>}
          </div>
          
          {title && (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
          )}
        </div>

        {/* Main Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};