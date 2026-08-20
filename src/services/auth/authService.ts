import { apiClient } from '../apiClient';
import { UserProfile } from '../../types';

export interface AuthResponse {
  token?: string;
  user: {
    id: number;
    username: string;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    avatar?: string;
    role?: string;
  };
}

export async function loginWithWordPress(usernameOrEmail: string, password: string): Promise<AuthResponse> {
  const data = await apiClient<AuthResponse>('/wp-json/foodgo/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: usernameOrEmail.trim(),
      password,
    }),
  });

  if (data.token) {
    localStorage.setItem('foodgo_auth_token', data.token);
  }

  return data;
}

export async function registerWithWordPress(payload: {
  username: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
}): Promise<AuthResponse> {
  const data = await apiClient<AuthResponse>('/wp-json/foodgo/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data.token) {
    localStorage.setItem('foodgo_auth_token', data.token);
  }

  return data;
}

export async function getCurrentUserFromWordPress(): Promise<UserProfile | null> {
  const token = localStorage.getItem('foodgo_auth_token');
  if (!token) return null;

  try {
    const data = await apiClient<any>('/wp-json/foodgo/v1/auth/me', {
      requiresAuth: true,
    });
    if (data && data.user) {
      return {
        name: data.user.displayName || data.user.name || 'Foodie Customer',
        email: data.user.email || '',
        phone: data.user.phone || '+91 98765 43210',
        address: data.user.address || 'Calicut Beach Road, Kerala',
        avatar: data.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        passwordMasked: '••••••••',
      };
    }
  } catch (err) {
    // If token invalid, remove it
    localStorage.removeItem('foodgo_auth_token');
  }
  return null;
}

export async function logoutWordPress(): Promise<void> {
  try {
    await apiClient('/wp-json/foodgo/v1/auth/logout', {
      method: 'POST',
      requiresAuth: true,
    });
  } catch {
    // Ignore
  } finally {
    localStorage.removeItem('foodgo_auth_token');
  }
}
