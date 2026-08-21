# WordPress & WooCommerce Configuration

## WordPress Requirements
- **WordPress**: 6.0+
- **WooCommerce**: 8.0+
- **PHP**: 7.4, 8.1, or 8.2+
- **Permalinks**: Must be set to anything other than "Plain" (recommended: **Post name**).

---

## Required Plugins
1. **WooCommerce**: Core commerce engine for products, categories, taxes, coupons, and orders.
2. **Foodgo Headless Connector**: Custom bridge plugin providing `/wp-json/foodgo/v1` endpoints, CORS headers, kitchen options, and dynamic configuration.

---

## Application Passwords
To allow `admin.php` to verify your WordPress setup:
1. In WordPress Admin, navigate to **Users → Profile**.
2. Scroll to the **Application Passwords** section.
3. Provide a name such as `Foodgo Production` and click **Add New Application Password**.
4. Copy the generated 24-character token and paste it into `https://your-frontend.com/admin.php`.
