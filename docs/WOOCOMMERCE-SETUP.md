# WooCommerce Setup & Configuration

## 1. Store API & Permalinks
Ensure WooCommerce Store API is accessible at:
```
https://your-wp-domain.com/wp-json/wc/store/v1/
```

## 2. Product Management
Create products in WooCommerce Admin (**Products → Add New**):
- **Simple Products**: Burgers, Drinks, Desserts, Pizzas.
- **Variable Products**: Size or option variations (e.g. Regular, Large).
- **Categories**: Create categories (e.g. Burgers, Curries, Drinks). The frontend auto-fetches them and maps appropriate category icons.
- **Custom Meta**: When editing a product, configure optional **Kitchen Prep Time** and **Default Spice Level** in the General tab.

## 3. Payments
Enable and configure payment gateways under **WooCommerce → Settings → Payments**. Any enabled gateway returned by the Store API is auto-detected on the React checkout screen.

## 4. Coupons
Coupons created in **Marketing → Coupons** work seamlessly on the checkout screen via the Store API cart coupon endpoint.
