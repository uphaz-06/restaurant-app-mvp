import { useState } from 'react';

export const useForm = <T extends Record<string, any>>(
  initialValues: T, 
  validate: (values: T) => Partial<Record<keyof T, string>>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (name: keyof T, value: any) => {
    setValues({ ...values, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: undefined });
  };

  const handleSubmit = (callback: () => void) => {
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length === 0) {
      callback();
    } else {
      setErrors(validationErrors);
    }
  };

  return { values, errors, handleChange, handleSubmit, isValid: Object.keys(errors).length === 0 };
};