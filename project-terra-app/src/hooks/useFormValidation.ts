// hooks/useFormValidation.ts
import { useState } from 'react';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<string, (value: any) => string | null>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (name: keyof T, value: any): string | null => {
    const validator = (validationRules as Record<string, (value: any) => string | null>)[name as string];
    if (!validator) return null;
    
    const error = validator(value);
    return error;
  };

  const validateAll = (): ValidationResult => {
    const newErrors: Record<string, string> = {};
    
    for (const field in validationRules) {
      const error = validate(field, values[field]);
      if (error) {
        newErrors[field] = error;
      }
    }
    
    setErrors(newErrors);
    
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate this field and update errors
    const error = validate(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      setErrors(prev => {
        const {[name]: _, ...rest} = prev; // Remove field from errors if no error
        return rest;
      });
    }
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
    validateAll,
    handleChange,
    clearErrors,
    setValues
  };
};