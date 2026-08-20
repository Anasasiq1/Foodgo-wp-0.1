import { getRuntimeConfig } from '../config/runtimeConfig';

export interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  isStoreApi?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let storeApiNonce: string | null = null;

export function setStoreApiNonce(nonce: string | null): void {
  storeApiNonce = nonce;
  try {
    if (nonce) {
      sessionStorage.setItem('foodgo_wc_nonce', nonce);
    } else {
      sessionStorage.removeItem('foodgo_wc_nonce');
    }
  } catch {
    // Ignore
  }
}

export function getStoreApiNonce(): string | null {
  if (storeApiNonce) return storeApiNonce;
  try {
    return sessionStorage.getItem('foodgo_wc_nonce');
  } catch {
    return null;
  }
}

export async function apiClient<T = any>(
  endpointOrUrl: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = false, isStoreApi = false, params, ...fetchInit } = options;
  const config = getRuntimeConfig();

  let url = endpointOrUrl;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const base = config.wpUrl;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    url = `${base}${cleanPath}`;
  }

  // Append query params if provided
  if (params) {
    const urlObj = new URL(url, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        urlObj.searchParams.set(k, String(v));
      }
    });
    url = urlObj.toString();
  }

  const headers = new Headers(fetchInit.headers || {});

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json, text/plain, */*');
  }

  if (fetchInit.body && !headers.has('Content-Type') && !(fetchInit.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach WooCommerce Store API Nonce
  const currentNonce = getStoreApiNonce();
  if (currentNonce) {
    headers.set('Nonce', currentNonce);
  }

  // Attach WordPress / JWT / Token authentication
  if (requiresAuth) {
    const token = localStorage.getItem('foodgo_auth_token') || localStorage.getItem('foodgo_admin_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchInit,
      credentials: 'include',
      headers,
    });

    // Capture returned Nonce from WooCommerce Store API headers
    const newNonce = response.headers.get('Nonce') || response.headers.get('nonce') || response.headers.get('X-WC-Store-API-Nonce');
    if (newNonce) {
      setStoreApiNonce(newNonce);
    }

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    const trimmed = text.trim();

    // Catch unexpected HTML responses cleanly
    if (
      contentType.includes('text/html') ||
      trimmed.startsWith('<') ||
      trimmed.toLowerCase().startsWith('<!doctype') ||
      trimmed.toLowerCase().startsWith('<html')
    ) {
      throw new ApiError(
        !response.ok
          ? `Server connection error (HTTP ${response.status}). Please check backend API endpoints.`
          : 'Server returned HTML instead of JSON. Please verify WordPress REST API / CORS.',
        response.status,
        text
      );
    }

    let parsedData: any = {};
    if (trimmed) {
      try {
        parsedData = JSON.parse(text);
      } catch {
        throw new ApiError('Invalid response received from server. Please check backend API endpoints.', response.status);
      }
    }

    if (!response.ok) {
      const errorMessage =
        parsedData?.message ||
        parsedData?.error ||
        parsedData?.code ||
        `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, parsedData);
    }

    return parsedData as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || 'Server connection error. Please check backend API endpoints.',
      0
    );
  }
}
