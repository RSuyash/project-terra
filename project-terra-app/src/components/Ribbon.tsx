// components/Ribbon.tsx
import React from 'react';

interface RibbonProps {
  title: string;
  children?: React.ReactNode;
}

const Ribbon: React.FC<RibbonProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
};

export default Ribbon;