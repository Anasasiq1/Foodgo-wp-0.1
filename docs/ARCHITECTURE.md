# Foodgo - Headless Food Ordering Platform Architecture

## 1. System Topology

```text
[ Browser / Customer Device ]
            │
            ▼
    https://domain.com/
   (index.html - React SPA)
            │
            │ Direct REST / Store API Calls
            ▼
[ WordPress + WooCommerce Server ]
  ├── WooCommerce Store API (/wp-json/wc/store/v1/)
  ├── WordPress Core REST API (/wp-json/wp/v2/)
  └── Foodgo Headless Connector Plugin (/wp-json/foodgo/v1/)
            ▲
            │ Server-side cURL verification & config
    https://domain.com/admin.php
       (PHP Connection Gateway)
```

## 2. Key Components

1. **Customer Storefront (`index.html`)**:
   - High-performance, mobile-first React 19 Single Page Application.
   - Handles menu browsing, categories, live search, customizable spice/curry line items, cart, checkout, customer auth, and order tracking.
   - Built to pure static HTML/JS/CSS assets in `dist/`.

2. **WordPress Connection Gateway (`admin.php`)**:
   - Standalone PHP script requiring PHP 8.1+ with `curl`, `json`, and `openssl`.
   - Connects the storefront to the remote WordPress server using Application Passwords.
   - Performs diagnostics via `admin.php?health=1` and stores private server credentials safely in `config/connection.json` protected from public web access.

3. **Foodgo Headless Connector Plugin (`foodgo-headless-connector.zip`)**:
   - WordPress plugin providing frontend endpoint discovery, line item metadata for custom spice/curry selections, and custom delivery slots.

4. **Web Hosting Server**:
   - Works on any standard Apache, OpenLiteSpeed, Nginx, cPanel, or aaPanel environment.
   - No persistent Node.js or PM2 process required on production.
