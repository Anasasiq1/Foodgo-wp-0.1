import { apiClient } from '../apiClient';
import { WcOrder } from '../../types/woocommerce';
import { Order } from '../../types';

function mapWcOrderToFoodgoOrder(wcOrder: WcOrder): Order {
  const dateStr = wcOrder.date_created
    ? new Date(wcOrder.date_created).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  // Map status
  let mappedStatus: Order['status'] = 'In Transit';
  if (wcOrder.status === 'completed') mappedStatus = 'Delivered';
  else if (wcOrder.status === 'cancelled' || wcOrder.status === 'failed') mappedStatus = 'Cancelled';
  else if (wcOrder.status === 'processing') mappedStatus = 'Preparing';
  else if (wcOrder.status === 'pending' || wcOrder.status === 'on-hold') mappedStatus = 'Order Placed';

  return {
    id: String(wcOrder.id),
    orderNumber: `#WC-${wcOrder.number || wcOrder.id}`,
    date: dateStr,
    items: (wcOrder.line_items || []).map((li) => {
      // Find foodgo custom meta
      const spiceMeta = li.meta_data?.find((m) => m.key === '_foodgo_spice_level' || m.key === 'Spiciness');
      const portionMeta = li.meta_data?.find((m) => m.key === '_foodgo_portion' || m.key === 'Portion');
      const curryMeta = li.meta_data?.find((m) => m.key === '_foodgo_curry');

      return {
        id: `wc-item-${li.id}`,
        productId: String(li.product_id),
        name: li.name,
        subtitle: 'WooCommerce Order Item',
        image: li.image?.src || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        basePrice: parseFloat(li.price ? String(li.price) : '0') || 0,
        portion: li.quantity || 1,
        spiceLevel: spiceMeta ? parseInt(String(spiceMeta.value), 10) : 50,
        selectedToppings: [],
        selectedSides: [],
        totalPrice: parseFloat(li.total || '0') || 0,
        selectedCurry: curryMeta?.value,
      };
    }),
    subtotal: parseFloat(wcOrder.total) - parseFloat(wcOrder.shipping_total || '0') - parseFloat(wcOrder.total_tax || '0'),
    taxes: parseFloat(wcOrder.total_tax || '0'),
    deliveryFees: parseFloat(wcOrder.shipping_total || '0'),
    total: parseFloat(wcOrder.total || '0'),
    estimatedDelivery: '20 - 35 mins',
    paymentMethod: wcOrder.payment_method_title || wcOrder.payment_method || 'Cash on Delivery',
    status: mappedStatus,
  };
}

export async function fetchCustomerOrders(): Promise<Order[]> {
  try {
    // 1. Try Foodgo customer orders endpoint (uses logged in customer session or token)
    const res = await apiClient<WcOrder[]>('/wp-json/foodgo/v1/customer/orders', {
      requiresAuth: true,
    });
    if (Array.isArray(res)) {
      return res.map(mapWcOrderToFoodgoOrder);
    }
  } catch (e) {
    // Fallback
  }
  return [];
}

export async function fetchOrderDetails(orderId: string | number): Promise<Order | null> {
  try {
    const res = await apiClient<WcOrder>(`/wp-json/foodgo/v1/orders/${orderId}`, {
      requiresAuth: true,
    });
    if (res && res.id) {
      return mapWcOrderToFoodgoOrder(res);
    }
  } catch (e) {
    console.warn(`Failed to fetch order details for ${orderId}:`, e);
  }
  return null;
}
