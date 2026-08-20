# REST & Store API Reference

## 1. WooCommerce Store API
- `GET /wp-json/wc/store/v1/products` - Product catalog list
- `GET /wp-json/wc/store/v1/products/:id` - Single product details
- `GET /wp-json/wc/store/v1/products/categories` - Product categories
- `GET /wp-json/wc/store/v1/cart` - Retrieve current customer session cart
- `POST /wp-json/wc/store/v1/cart/add-item` - Add item to cart with foodgo extensions
- `POST /wp-json/wc/store/v1/cart/update-item` - Update cart item quantity
- `POST /wp-json/wc/store/v1/cart/remove-item` - Remove item from cart
- `POST /wp-json/wc/store/v1/cart/apply-coupon` - Apply coupon code
- `POST /wp-json/wc/store/v1/cart/remove-coupon` - Remove coupon code
- `POST /wp-json/wc/store/v1/checkout` - Submit and place order

## 2. Foodgo Headless Connector API
- `GET /wp-json/foodgo/v1/config` - Dynamic store settings and feature discovery
- `POST /wp-json/foodgo/v1/auth/login` - Customer authentication
- `POST /wp-json/foodgo/v1/auth/register` - Customer registration
- `GET /wp-json/foodgo/v1/auth/me` - Authenticated customer profile
- `GET /wp-json/foodgo/v1/customer/orders` - Customer order history
- `GET /wp-json/foodgo/v1/merchant/orders` - Kitchen manager orders
- `POST /wp-json/foodgo/v1/merchant/orders/:id/status` - Update kitchen status
- `GET /wp-json/foodgo/v1/delivery/tasks` - Delivery logistics tasks
- `POST /wp-json/foodgo/v1/delivery/tasks/:id/status` - Update delivery status
