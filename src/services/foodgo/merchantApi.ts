import { apiClient } from '../apiClient';

export interface MerchantOrder {
  id: string | number;
  orderNumber: string;
  customerName: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    notes?: string;
    customization?: any;
  }>;
  total: number;
  status: 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Completed';
  date: string;
}

export async function fetchMerchantOrders(): Promise<MerchantOrder[]> {
  try {
    const res = await apiClient<MerchantOrder[]>('/wp-json/foodgo/v1/merchant/orders', {
      requiresAuth: true,
    });
    if (Array.isArray(res)) return res;
  } catch (e) {
    // Return empty array
  }
  return [];
}

export async function updateMerchantOrderStatus(
  orderId: string | number,
  status: 'Preparing' | 'Ready for Pickup' | 'Completed'
): Promise<boolean> {
  try {
    const res = await apiClient<{ success: boolean }>(`/wp-json/foodgo/v1/merchant/orders/${orderId}/status`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ status }),
    });
    return res.success;
  } catch {
    return false;
  }
}
