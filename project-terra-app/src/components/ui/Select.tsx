// components/ui/Select.tsx
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  description?: string;
  options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  error, 
  description, 
  options,
  className = '',
  ...props 
}) => {
  const selectClassName = `input-field ${error ? 'border-red-500' : ''} ${className}`;
  
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      )}
      <select
        {...props}
        className={selectClassName}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};