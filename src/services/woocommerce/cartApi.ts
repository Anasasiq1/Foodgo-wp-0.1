import { apiClient } from '../apiClient';
import { WcCartResponse, FoodgoCustomizationMeta } from '../../types/woocommerce';

export async function getWcCart(): Promise<WcCartResponse> {
  return apiClient<WcCartResponse>('/wp-json/wc/store/v1/cart', {
    method: 'GET',
    isStoreApi: true,
  });
}

export interface AddToCartPayload {
  id: number | string;
  quantity: number;
  variation?: Array<{ attribute: string; value: string }>;
  customization?: FoodgoCustomizationMeta;
}

export async function addToWcCart(payload: AddToCartPayload): Promise<WcCartResponse> {
  const numericId = typeof payload.id === 'string' ? parseInt(payload.id, 10) : payload.id;
  
  // Format extensions and request data
  const body: any = {
    id: numericId || 1,
    quantity: payload.quantity || 1,
  };

  if (payload.variation && payload.variation.length > 0) {
    body.variation = payload.variation;
  }

  // Include Foodgo custom food attributes in extensions if present
  if (payload.customization) {
    body.extensions = {
      foodgo: payload.customization,
    };
  }

  return apiClient<WcCartResponse>('/wp-json/wc/store/v1/cart/add-item', {
    method: 'POST',
    isStoreApi: true,
    body: JSON.stringify(body),
  });
}

export async function updateWcCartItem(key: string, quantity: number): Promise<WcCartResponse> {
  return apiClient<WcCartResponse>(`/wp-json/wc/store/v1/cart/update-item`, {
    method: 'POST',
    isStoreApi: true,
    body: JSON.stringify({
      key,
      quantity,
    }),
  });
}

export async function removeWcCartItem(key: string): Promise<WcCartResponse> {
  return apiClient<WcCartResponse>(`/wp-json/wc/store/v1/cart/remove-item`, {
    method: 'POST',
    isStoreApi: true,
    body: JSON.stringify({ key }),
  });
}

export async function applyWcCoupon(code: string): Promise<WcCartResponse> {
  return apiClient<WcCartResponse>('/wp-json/wc/store/v1/cart/apply-coupon', {
    method: 'POST',
    isStoreApi: true,
    body: JSON.stringify({ code }),
  });
}

export async function removeWcCoupon(code: string): Promise<WcCartResponse> {
  return apiClient<WcCartResponse>('/wp-json/wc/store/v1/cart/remove-coupon', {
    method: 'POST',
    isStoreApi: true,
    body: JSON.stringify({ code }),
  });
}

export async function clearWcCart(): Promise<void> {
  try {
    const cart = await getWcCart();
    if (cart && Array.isArray(cart.items)) {
      for (const item of cart.items) {
        await removeWcCartItem(item.key);
      }
    }
  } catch (err) {
    console.warn('Error clearing WC cart:', err);
  }
}
