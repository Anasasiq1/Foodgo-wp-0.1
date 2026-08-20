import { apiClient } from '../apiClient';
import { WcAddress, WcOrder, WcPaymentGateway } from '../../types/woocommerce';

export interface CheckoutPayload {
  billing_address: WcAddress;
  shipping_address?: WcAddress;
  customer_note?: string;
  payment_method: string;
  payment_data?: Array<{ key: string; value: string }>;
  extensions?: Record<string, any>;
}

export interface CheckoutResponse {
  order_id: number;
  status: string;
  order_key: string;
  customer_id: number;
  billing_address: WcAddress;
  shipping_address: WcAddress;
  payment_result: {
    payment_status: string;
    payment_details: any;
    redirect_url?: string;
  };
}

export async function processWcCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const body = {
    billing_address: payload.billing_address,
    shipping_address: payload.shipping_address || payload.billing_address,
    customer_note: payload.customer_note || '',
    payment_method: payload.payment_method || 'cod',
    payment_data: payload.payment_data || [],
    extensions: payload.extensions || {},
  };

  return apiClient<CheckoutResponse>('/wp-json/wc/store/v1/checkout', {
    method: 'POST',
    isStoreApi: true,
    body: JSON.stringify(body),
  });
}

export async function getAvailablePaymentGateways(): Promise<WcPaymentGateway[]> {
  try {
    // Try custom Foodgo gateway list or Store API payment methods
    const gateways = await apiClient<WcPaymentGateway[]>('/wp-json/foodgo/v1/payment-methods');
    if (Array.isArray(gateways) && gateways.length > 0) {
      return gateways;
    }
  } catch {
    // Fallback to standard COD default
  }

  return [
    {
      id: 'cod',
      title: 'Cash on Delivery',
      description: 'Pay with cash upon food arrival at your doorstep.',
      order: 1,
      enabled: true,
    },
    {
      id: 'upi',
      title: 'Instant UPI / QR',
      description: 'Pay via Google Pay, PhonePe, Paytm or any UPI app.',
      order: 2,
      enabled: true,
    },
  ];
}
