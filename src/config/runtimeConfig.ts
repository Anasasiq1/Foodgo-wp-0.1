import { FoodgoPublicConfig } from '../types/woocommerce';

declare global {
  interface Window {
    __FOODGO_CONFIG__?: Partial<FoodgoPublicConfig>;
  }
}

export interface RuntimeConfig {
  wpUrl: string;
  restApiUrl: string;
  storeApiUrl: string;
  foodgoApiUrl: string;
  currency: string;
  currencySymbol: string;
  isWooCommerceConnected: boolean;
  features: FoodgoPublicConfig['features'];
}

const DEFAULT_FEATURES: FoodgoPublicConfig['features'] = {
  cart: true,
  checkout: true,
  coupons: true,
  guestCheckout: true,
  variations: true,
  merchant: true,
  delivery: true,
  support: true,
  customization: true,
};

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getInitialWpUrl(): string {
  // 1. Injected window runtime
  if (window.__FOODGO_CONFIG__?.siteUrl) {
    return normalizeUrl(window.__FOODGO_CONFIG__.siteUrl);
  }
  // 2. Saved local storage preference (for dynamic switching or testing)
  try {
    const saved = localStorage.getItem('foodgo_wp_url');
    if (saved) return normalizeUrl(saved);
  } catch {
    // Ignore
  }
  // 3. Vite environment variable
  const envUrl = (
    (import.meta as any).env?.VITE_WP_URL ||
    (import.meta as any).env?.VITE_API_BASE_URL ||
    (import.meta as any).env?.NEXT_PUBLIC_API_URL ||
    ''
  ).trim();

  if (envUrl) {
    return normalizeUrl(envUrl);
  }

  // 4. Default same-origin or localhost
  return '';
}

let activeConfig: RuntimeConfig = {
  wpUrl: getInitialWpUrl(),
  restApiUrl: `${getInitialWpUrl()}/wp-json/wp/v2`,
  storeApiUrl: `${getInitialWpUrl()}/wp-json/wc/store/v1`,
  foodgoApiUrl: `${getInitialWpUrl()}/wp-json/foodgo/v1`,
  currency: 'INR',
  currencySymbol: '₹',
  isWooCommerceConnected: false,
  features: DEFAULT_FEATURES,
};

export function getRuntimeConfig(): RuntimeConfig {
  return activeConfig;
}

export function updateRuntimeConfig(updates: Partial<RuntimeConfig> | Partial<FoodgoPublicConfig>): void {
  const wpUrl = (updates as any).siteUrl || (updates as any).wpUrl || activeConfig.wpUrl;
  const cleanWpUrl = normalizeUrl(wpUrl || '');

  activeConfig = {
    ...activeConfig,
    ...updates,
    wpUrl: cleanWpUrl,
    restApiUrl: (updates as any).apiBaseUrl || `${cleanWpUrl}/wp-json/wp/v2`,
    storeApiUrl: (updates as any).storeApiUrl || `${cleanWpUrl}/wp-json/wc/store/v1`,
    foodgoApiUrl: `${cleanWpUrl}/wp-json/foodgo/v1`,
    currency: (updates as any).currency || activeConfig.currency,
    currencySymbol: (updates as any).currencySymbol || activeConfig.currencySymbol,
    features: {
      ...activeConfig.features,
      ...((updates as any).features || {}),
    },
    isWooCommerceConnected: (updates as any).isWooCommerceConnected ?? activeConfig.isWooCommerceConnected,
  };

  try {
    if (cleanWpUrl) {
      localStorage.setItem('foodgo_wp_url', cleanWpUrl);
    }
  } catch {
    // Ignore
  }
}
