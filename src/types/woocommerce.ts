/**
 * WooCommerce & WordPress Headless Type Definitions for Foodgo
 */

export interface WcImage {
  id: number;
  src: string;
  thumbnail?: string;
  name?: string;
  alt?: string;
}

export interface WcPrice {
  price: string;
  regular_price: string;
  sale_price: string;
  price_range?: {
    min_amount: string;
    max_amount: string;
  } | null;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface WcCategory {
  id: number;
  name: string;
  slug: string;
  link?: string;
  count?: number;
  image?: WcImage | null;
}

export interface WcAttributeTerm {
  id: number;
  name: string;
  slug: string;
}

export interface WcAttribute {
  id: number;
  name: string;
  taxonomy?: string;
  has_variations: boolean;
  terms: WcAttributeTerm[];
}

export interface WcVariation {
  id: number;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  is_in_stock: boolean;
  image?: WcImage;
}

export interface FoodgoCustomizationMeta {
  spiceLevel?: number;
  portion?: number;
  toppings?: Array<{ id: string; name: string; price: number }>;
  sides?: Array<{ id: string; name: string; price: number }>;
  curry?: {
    curryId: string;
    curryName: string;
    pricePerUnit: number;
    unitLabel: string;
    unitsPerProduct: number;
    totalUnits: number;
    totalPrice: number;
  };
  specialInstructions?: string;
  optionChoices?: Array<{
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    price: number;
  }>;
}

export interface WcStoreProduct {
  id: number;
  name: string;
  slug: string;
  parent: number;
  type: 'simple' | 'variable' | 'grouped' | 'external';
  variation: string;
  permalink: string;
  sku: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: WcPrice;
  price_html: string;
  average_rating: string;
  review_count: number;
  images: WcImage[];
  categories: WcCategory[];
  tags: Array<{ id: number; name: string; slug: string }>;
  attributes: WcAttribute[];
  variations: WcVariation[];
  has_options: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
  is_on_backorder: boolean;
  low_stock_remaining: number | null;
  sold_individually: boolean;
  add_to_cart: {
    text: string;
    description: string;
    url: string;
    minimum: number;
    maximum: number;
    multiple_of: number;
  };
  // Foodgo specific custom extensions
  foodgo_meta?: {
    moduleId?: string;
    prepTime?: string;
    defaultSpice?: number;
    defaultPortion?: number;
    curryConfig?: any;
    customizationSections?: any[];
  };
}

export interface WcCartItem {
  key: string;
  id: number;
  quantity: number;
  quantity_limits: {
    minimum: number;
    maximum: number;
    multiple_of: number;
    editable: boolean;
  };
  name: string;
  short_description: string;
  description: string;
  sku: string;
  low_stock_remaining: number | null;
  backorders_allowed: boolean;
  show_backorder_badge: boolean;
  sold_individually: boolean;
  permalink: string;
  images: WcImage[];
  variation: Array<{
    attribute: string;
    value: string;
  }>;
  item_data: Array<{
    key: string;
    value: string;
  }>;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    price_range: any;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
    raw_prices: {
      precision: number;
      price: string;
      regular_price: string;
      sale_price: string;
    };
  };
  totals: {
    line_subtotal: string;
    line_subtotal_tax: string;
    line_total: string;
    line_total_tax: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
  // Extension data containing Foodgo customization
  extensions?: {
    foodgo?: FoodgoCustomizationMeta;
  };
}

export interface WcCartCoupon {
  code: string;
  discount_type: string;
  totals: {
    total_discount: string;
    total_discount_tax: string;
    currency_code: string;
    currency_symbol: string;
  };
}

export interface WcCartTotals {
  total_items: string;
  total_items_tax: string;
  total_fees: string;
  total_fees_tax: string;
  total_discount: string;
  total_discount_tax: string;
  total_shipping: string;
  total_shipping_tax: string;
  total_price: string;
  total_tax: string;
  tax_lines: Array<{
    name: string;
    price: string;
    rate: string;
  }>;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface WcCartResponse {
  coupons: WcCartCoupon[];
  shipping_rates: Array<{
    package_id: number;
    name: string;
    destination: any;
    items: Array<{ key: string; name: string; quantity: number }>;
    shipping_rates: Array<{
      rate_id: string;
      name: string;
      description: string;
      delivery_time: string;
      price: string;
      instance_id: number;
      method_id: string;
      selected: boolean;
      currency_code: string;
      currency_symbol: string;
    }>;
  }>;
  shipping_address: WcAddress;
  billing_address: WcAddress;
  items: WcCartItem[];
  items_count: number;
  items_weight: number;
  cross_sells: WcStoreProduct[];
  needs_payment: boolean;
  needs_shipping: boolean;
  has_calculated_shipping: boolean;
  fees: Array<{
    id: string;
    name: string;
    totals: {
      total: string;
      total_tax: string;
      currency_code: string;
      currency_symbol: string;
    };
  }>;
  totals: WcCartTotals;
  errors: Array<{
    code: string;
    message: string;
  }>;
  payment_requirements: string[];
  extensions: Record<string, any>;
}

export interface WcAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface WcPaymentGateway {
  id: string;
  title: string;
  description: string;
  order: number;
  enabled: boolean;
  method_title?: string;
  method_description?: string;
  icon?: string;
}

export interface WcOrderNote {
  id: number;
  author: string;
  date_created: string;
  note: string;
  customer_note: boolean;
}

export interface WcOrderItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  subtotal: string;
  total: string;
  sku: string;
  price: number;
  image?: WcImage;
  meta_data: Array<{
    id: number;
    key: string;
    value: any;
    display_key?: string;
    display_value?: any;
  }>;
}

export interface WcOrder {
  id: number;
  parent_id: number;
  number: string;
  order_key: string;
  created_via: string;
  version: string;
  status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed' | 'trash' | string;
  currency: string;
  date_created: string;
  date_modified: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  prices_include_tax: boolean;
  customer_id: number;
  customer_ip_address: string;
  customer_user_agent: string;
  customer_note: string;
  billing: WcAddress;
  shipping: WcAddress;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  date_paid?: string;
  date_completed?: string;
  line_items: WcOrderItem[];
  meta_data: Array<{
    id: number;
    key: string;
    value: any;
  }>;
  // Foodgo specific computed
  foodgo_delivery_status?: 'Pending Assignment' | 'Assigned' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Cancelled';
  foodgo_kitchen_status?: 'Received' | 'Preparing' | 'Ready for Pickup';
}

export interface CustomerProfile {
  id: number;
  username: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  avatar?: string;
  role?: string;
}

export interface FoodgoPublicConfig {
  siteName: string;
  siteUrl: string;
  apiBaseUrl: string;
  storeApiUrl: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  version: string;
  features: {
    cart: boolean;
    checkout: boolean;
    coupons: boolean;
    guestCheckout: boolean;
    variations: boolean;
    merchant: boolean;
    delivery: boolean;
    support: boolean;
    customization: boolean;
  };
  modules?: Array<{
    id: string;
    name: string;
    title: string;
    subtitle: string;
    tagline: string;
    icon: string;
    order: number;
    active: boolean;
    bannerTitle?: string;
    bannerSubtitle?: string;
    bannerAction?: string;
    bannerBadge?: string;
  }>;
  paymentMethods?: WcPaymentGateway[];
  deliverySettings?: {
    slots: Array<{ id: string; timeLabel: string; fee: number; active: boolean; order: number }>;
    urgentDelivery: { enabled: boolean; fee: number; label: string };
  };
}
