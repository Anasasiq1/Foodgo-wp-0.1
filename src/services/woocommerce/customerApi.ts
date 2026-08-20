import { apiClient } from '../apiClient';
import { CustomerProfile } from '../../types/woocommerce';

export async function fetchCustomerProfile(): Promise<CustomerProfile | null> {
  try {
    const res = await apiClient<{ success: boolean; user: CustomerProfile }>('/wp-json/foodgo/v1/auth/me');
    return res?.user || null;
  } catch (err) {
    console.warn('[CustomerApi] Error fetching customer profile:', err);
    return null;
  }
}

export async function updateCustomerProfile(data: Partial<CustomerProfile>): Promise<CustomerProfile | null> {
  try {
    const res = await apiClient<{ success: boolean; user: CustomerProfile }>('/wp-json/foodgo/v1/auth/me', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.user || null;
  } catch (err) {
    console.warn('[CustomerApi] Error updating customer profile:', err);
    return null;
  }
}
