# Authentication Architecture

## Authentication Model

Foodgo implements a clean, decoupled authentication architecture aligned with WordPress and WooCommerce standards:

1. **Customer Authentication (Storefront)**:
   - Customers log in or register via the WordPress REST API (`/wp-json/wp/v2/users` / `/wp-json/foodgo/v1/auth/login`).
   - Sessions are maintained client-side via JWT / Token storage or WooCommerce Store API session cookies.
   - Guest checkout is fully supported by WooCommerce Store API out of the box.

2. **Integration / Server Connection (admin.php)**:
   - Connected via **WordPress Application Passwords**.
   - Used only by `admin.php` for server-to-server connectivity tests and metadata discovery.
   - Application Passwords can be revoked at any time from **WordPress Admin → Users → Profile**.

3. **No Legacy Auth Databases**:
   - There are **no separate bcrypt, SQLite, MongoDB, or JSON customer tables**.
   - All customer accounts, addresses, and order history live in the native WordPress `wp_users` and `wp_usermeta` tables.
