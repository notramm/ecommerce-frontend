import { z } from 'zod';

export const emailSchema = z.string()
  .email('Enter a valid email address')
  .toLowerCase()
  .trim();

export const phoneSchema = z.string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

export const passwordSchema = z.string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Include at least one uppercase letter')
  .regex(/[a-z]/, 'Include at least one lowercase letter')
  .regex(/\d/,    'Include at least one number');

export const nameSchema = z.string()
  .min(2, 'At least 2 characters')
  .max(50, 'Max 50 characters')
  .trim();

export const pincodeSchema = z.string()
  .regex(/^\d{6}$/, 'Enter a valid 6-digit pincode');

export const panSchema = z.string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN (e.g. ABCDE1234F)');

export const ifscSchema = z.string()
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code');

export const gstSchema = z.string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
    'Invalid GST number'
  )
  .optional()
  .or(z.literal(''));

export const objectIdSchema = z.string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

export const urlSchema = z.string()
  .url('Enter a valid URL')
  .optional()
  .or(z.literal(''));

// Common form schemas
export const addressFormSchema = z.object({
  label:     z.string().optional().default('Home'),
  fullName:  nameSchema,
  phone:     phoneSchema,
  line1:     z.string().min(5, 'Address required'),
  line2:     z.string().optional(),
  city:      z.string().min(2, 'City required'),
  state:     z.string().min(2, 'State required'),
  pincode:   pincodeSchema,
  isDefault: z.boolean().optional().default(false),
});

export const profileFormSchema = z.object({
  name: nameSchema,
});

export const loginEmailSchema = z.object({
  email: emailSchema,
  otp:   z.string().length(6, 'Enter 6-digit OTP'),
});

// Validate a single field and return error message or null
export const validateField = (schema, value) => {
  const result = schema.safeParse(value);
  return result.success ? null : result.error.errors[0]?.message || 'Invalid';
};