import { apiClient } from '../apiClient';

export interface DeliveryTask {
  id: string | number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  total: number;
  paymentMethod: string;
  status: 'Assigned' | 'Picked Up' | 'Out for Delivery' | 'Delivered' | 'Failed';
  assignedPartnerId?: string;
  notes?: string;
}

export async function fetchAssignedDeliveryTasks(): Promise<DeliveryTask[]> {
  try {
    const res = await apiClient<DeliveryTask[]>('/wp-json/foodgo/v1/delivery/tasks', {
      requiresAuth: true,
    });
    if (Array.isArray(res)) return res;
  } catch (e) {
    // Return empty array
  }
  return [];
}

export async function updateDeliveryStatus(
  taskId: string | number,
  status: DeliveryTask['status']
): Promise<boolean> {
  try {
    const res = await apiClient<{ success: boolean }>(`/wp-json/foodgo/v1/delivery/tasks/${taskId}/status`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ status }),
    });
    return res.success;
  } catch {
    return false;
  }
}
