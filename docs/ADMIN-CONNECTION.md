# Admin Connection Guide (admin.php)

## Purpose of admin.php
`admin.php` is a lightweight, standalone PHP gateway designed to connect your Foodgo frontend to WordPress & WooCommerce.
- **It is NOT a secondary commerce dashboard**: All product management, orders, customer details, and payment gateways remain in WordPress Admin (`/wp-admin`).
- **Functionality**:
  1. Securely saves the WordPress URL and Application Password server-side (in `config/connection.json`).
  2. Tests connectivity across three core layers:
     - WordPress Core REST API (`/wp-json/`)
     - WooCommerce Store API (`/wp-json/wc/store/v1/products`)
     - Foodgo Connector Plugin (`/wp-json/foodgo/v1/config`)
  3. Provides a 1-click download button for `foodgo-headless-connector.zip`.

---

## Security Model
- **No plaintext admin passwords**: Only WordPress **Application Passwords** are accepted.
- **Server-side storage**: Sensitive connection details are stored in `config/connection.json`, protected by `.htaccess` denying direct HTTP access.
- **No secret leakage**: React frontend never receives secret keys. The frontend accesses public Store API endpoints using standard cookies and nonces.

---

## How to Connect
1. Generate an Application Password in WordPress:
   - Navigate to **WordPress Admin → Users → Profile**.
   - Scroll to **Application Passwords**.
   - Enter name: `Foodgo Storefront` and click **Add New Application Password**.
   - Copy the generated 24-character password.
2. Open `https://your-domain.com/admin.php`.
3. Enter:
   - **WordPress Site URL**: e.g., `https://wp.example.com`
   - **WordPress Username**: e.g., `admin`
   - **Application Password**: The 24-character key
4. Click **SAVE & CONNECT WORDPRESS**.
5. Check that all diagnostic test badges show **CONNECTED**.
