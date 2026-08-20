# WooCommerce Core Integration

WooCommerce functions as the single source of truth for the entire Foodgo commerce lifecycle.

---

## 1. Product & Catalog Synchronization
- **Endpoints**: `/wp-json/wc/store/v1/products`, `/wp-json/wc/store/v1/products/categories`
- **Supported Types**:
  - Simple Products (Burgers, Drinks, Desserts)
  - Variable Products & Variations (Portion sizes, combos)
  - Categories & Tags
  - Stock management (In Stock, Out of Stock, Backorders)

## 2. Cart & Line Items
- **Endpoints**: `/wp-json/wc/store/v1/cart`, `/wp-json/wc/store/v1/cart/add-item`
- Line items support food customizations (Spice level, Curry/Salna selections, Addon toppings) via Store API extensions.

## 3. Checkout & Dynamic Payments
- **Endpoint**: `/wp-json/wc/store/v1/checkout`
- Any payment gateway enabled in **WooCommerce → Settings → Payments** (COD, Stripe, Razorpay, etc.) is automatically discovered.

## 4. Coupons & Discounts
- Coupons managed in **Marketing → Coupons** work out-of-the-box in the checkout flow via `/wp-json/wc/store/v1/cart/apply-coupon`.
