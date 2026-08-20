import { apiClient } from '../apiClient';
import { FoodgoPublicConfig } from '../../types/woocommerce';

export async function getFoodgoConfig(): Promise<FoodgoPublicConfig | null> {
  try {
    return await apiClient<FoodgoPublicConfig>('/wp-json/foodgo/v1/config');
  } catch (err) {
    console.warn('[FoodgoApi] Failed to fetch config:', err);
    return null;
  }
}

export * from './merchantApi';
export * from './deliveryApi';
export * from './supportApi';
