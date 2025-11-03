// components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  description, 
  className = '',
  ...props 
}) => {
  const inputClassName = `input-field ${error ? 'border-red-500' : ''} ${className}`;
  
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      )}
      <input
        {...props}
        className={inputClassName}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};