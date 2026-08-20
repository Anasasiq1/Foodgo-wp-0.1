import { apiClient } from './apiClient';
import { getRuntimeConfig, updateRuntimeConfig } from '../config/runtimeConfig';
import { FoodgoPublicConfig } from '../types/woocommerce';

export interface HealthCheckResult {
  wordpressConnected: boolean;
  woocommerceConnected: boolean;
  storeApiConnected: boolean;
  foodgoPluginConnected: boolean;
  currency: string;
  siteName: string;
  details: string;
}

export async function fetchFoodgoConfig(): Promise<FoodgoPublicConfig | null> {
  const config = getRuntimeConfig();

  // If no WP URL configured yet, try checking /api/connection/public from admin.php setup
  if (!config.wpUrl) {
    try {
      const pubRes = await fetch('/api/connection/public');
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        if (pubData.wpUrl) {
          updateRuntimeConfig({ wpUrl: pubData.wpUrl });
        }
      }
    } catch {
      // offline or standalone
    }
  }

  try {
    const data = await apiClient<FoodgoPublicConfig>('/wp-json/foodgo/v1/config', {
      isStoreApi: false,
    });
    if (data && (data.siteName || data.currency)) {
      updateRuntimeConfig({
        siteUrl: data.siteUrl,
        currency: data.currency || 'INR',
        currencySymbol: data.currencySymbol || '₹',
        isWooCommerceConnected: true,
        features: data.features,
      });
      return data;
    }
  } catch (err) {
    // If foodgo custom config is not present, attempt checking WooCommerce Store API directly
    try {
      const storeData = await apiClient('/wp-json/wc/store/v1/cart', { isStoreApi: true });
      if (storeData) {
        updateRuntimeConfig({ isWooCommerceConnected: true });
      }
    } catch {
      // Standalone mode
    }
  }
  return null;
}

export async function runConnectionDiagnostics(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    wordpressConnected: false,
    woocommerceConnected: false,
    storeApiConnected: false,
    foodgoPluginConnected: false,
    currency: '₹ (INR)',
    siteName: 'Foodgo Gourmet Kitchen',
    details: 'Testing connection to WordPress backend...',
  };

  try {
    // 1. Test WordPress core REST API
    const wpRes = await apiClient('/wp-json/wp/v2/types', { params: { per_page: 1 } });
    if (wpRes) {
      result.wordpressConnected = true;
    }
  } catch {
    // WP REST not reachable
  }

  try {
    // 2. Test WooCommerce Store API
    const cartRes = await apiClient('/wp-json/wc/store/v1/cart', { isStoreApi: true });
    if (cartRes) {
      result.woocommerceConnected = true;
      result.storeApiConnected = true;
      if (cartRes.totals?.currency_symbol) {
        result.currency = `${cartRes.totals.currency_symbol} (${cartRes.totals.currency_code})`;
      }
    }
  } catch {
    // Store API not reachable
  }

  try {
    // 3. Test Foodgo Headless Connector plugin
    const foodgoRes = await apiClient<FoodgoPublicConfig>('/wp-json/foodgo/v1/config');
    if (foodgoRes && (foodgoRes.siteName || foodgoRes.currency)) {
      result.foodgoPluginConnected = true;
      result.siteName = foodgoRes.siteName || 'Foodgo Store';
      result.currency = `${foodgoRes.currencySymbol || '₹'} (${foodgoRes.currency || 'INR'})`;
    }
  } catch {
    // Foodgo plugin not active
  }

  if (result.wordpressConnected && result.woocommerceConnected && result.foodgoPluginConnected) {
    result.details = 'Full Headless WordPress + WooCommerce + Foodgo Connector connection established.';
  } else if (result.wordpressConnected && result.woocommerceConnected) {
    result.details = 'Connected to WooCommerce Store API. Install Foodgo Connector plugin for food customization.';
  } else {
    result.details = 'Configure WordPress URL in domain.com/admin.php or set VITE_WP_URL in .env.';
  }

  return result;
}
