// components/ui/FormField.tsx
import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  description?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  children, 
  required = false, 
  error,
  description 
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      )}
      {children}
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};