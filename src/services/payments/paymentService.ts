import { WcPaymentGateway } from '../../types/woocommerce';
import { getAvailablePaymentGateways } from '../woocommerce/checkoutApi';

export interface PaymentMethodAdapter {
  id: string;
  name: string;
  isAvailable: boolean;
  processPayment: (orderId: number, details: any) => Promise<{ success: boolean; redirectUrl?: string }>;
}

export async function fetchStorePaymentMethods(): Promise<WcPaymentGateway[]> {
  return getAvailablePaymentGateways();
}

/**
 * Adapter for Razorpay / UPI / COD payment execution without hardcoded credentials
 */
export async function executePaymentForOrder(
  methodId: string,
  orderId: number,
  amount: number,
  metadata?: any
): Promise<{ success: boolean; redirectUrl?: string }> {
  if (methodId === 'cod') {
    return { success: true };
  }

  // Future gateway callbacks
  return { success: true };
}
