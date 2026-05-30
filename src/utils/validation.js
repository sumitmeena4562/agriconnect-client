import { z } from 'zod';

/**
 * Centralized Validation Utility powered by Zod
 */

// Helper to extract error message from Zod
const getError = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success) {
    return result.error.errors[0].message;
  }
  return '';
};

export const validateRequired = (value) => {
  const schema = z.string().min(1, 'This field is required');
  return getError(schema, value);
};

export const validateEmail = (email) => {
  const schema = z.string()
    .min(1, 'Email address is required')
    .email('Enter a valid email address');
  return getError(schema, email);
};

export const validatePhone = (phone) => {
  const schema = z.string()
    .min(1, 'Mobile number is required')
    .regex(/^[0-9]{7,15}$/, 'Enter a valid mobile number');
  return getError(schema, phone);
};

export const validateName = (name) => {
  const schema = z.string()
    .min(1, 'Name is required')
    .min(3, 'Name must be at least 3 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain alphabets');
  return getError(schema, name);
};

export const validatePassword = (password) => {
  const schema = z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long');
  return getError(schema, password);
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

export const validateOtp = (otp) => {
  const schema = z.string()
    .min(1, 'OTP is required')
    .length(6, 'Enter a valid 6-digit OTP')
    .regex(/^[0-9]+$/, 'OTP can only contain numbers');
  return getError(schema, otp);
};

export const validateLocationString = (value, fieldName) => {
  const schema = z.string()
    .min(1, `${fieldName} is required`)
    .min(3, 'Must be at least 3 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Only alphabets allowed');
  return getError(schema, value);
};

export const validateLandSize = (size) => {
  // Convert to number for Zod
  const numSize = parseFloat(size);
  const schema = z.number({
    required_error: 'Land size is required',
    invalid_type_error: 'Must be a valid number'
  })
    .positive('Must be greater than 0')
    .max(1000, 'Value seems suspiciously high');
  
  return getError(schema, isNaN(numSize) ? undefined : numSize);
};

export const validateCrops = (crops) => {
  const schema = z.string()
    .min(1, 'Primary crops are required')
    .min(3, 'Please list at least one valid crop');
  return getError(schema, crops);
};
