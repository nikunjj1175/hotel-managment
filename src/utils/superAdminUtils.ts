import { User } from '../server/models';

export interface SuperAdminRegistrationData {
  name: string;
  email: string;
  password: string;
  secretKey: string;
}

export interface SuperAdminResponse {
  success: boolean;
  message: string;
  user?: any;
  error?: string;
}

/**
 * Register a new SUPER_ADMIN user
 */
export async function registerSuperAdmin(data: SuperAdminRegistrationData): Promise<SuperAdminResponse> {
  try {
    const response = await fetch('/api/auth/register-super-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message,
        user: result.user
      };
    } else {
      return {
        success: false,
        message: result.message || 'Registration failed',
        error: result.message
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error occurred',
      error: 'Network error'
    };
  }
}

/**
 * Check if a SUPER_ADMIN already exists
 */
export async function checkSuperAdminExists(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/check-super-admin', {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      return data.exists;
    }
    return false;
  } catch (error) {
    console.error('Error checking SUPER_ADMIN existence:', error);
    return false;
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get default secret key (for development)
 */
export function getDefaultSecretKey(): string {
  return process.env.SUPER_ADMIN_SECRET_KEY || 'super-admin-secret-2024';
}
