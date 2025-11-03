// components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title,
  description
}) => {
  return (
    <div className={`card ${className}`}>
      {(title || description) && (
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          {title && <h3 className="text-xl font-bold">{title}</h3>}
          {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};