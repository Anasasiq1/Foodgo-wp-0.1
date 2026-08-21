# Production Deployment Architecture & Workflow

This document details the production build pipeline and deployment model for Foodgo.

---

## 1. Single Authoritative Entry Point Architecture

- **Customer Storefront**: `index.html` (Vite compiled React SPA).
- **WordPress Connection & Diagnostics**: `admin.php` (Independent PHP script).
- **Commerce Engine**: WordPress + WooCommerce (REST / Store API).
- **Bridge Plugin**: `foodgo-headless-connector.zip`.
- **Database**: WordPress MySQL database (No secondary database or Node server in production).

---

## 2. Automated Production Build (`npm run build`)

Running:
```bash
npm run build
```

Executes the automated pipeline in `scripts/build-production.ts`:
1. Cleans previous `dist/`.
2. Packages the WordPress plugin `foodgo-headless-connector.zip`.
3. Runs `vite build` to compile React frontend to `dist/`.
4. Copies `admin.php` directly into `dist/admin.php`.
5. Copies `.htaccess` into `dist/.htaccess`.
6. Copies `foodgo-headless-connector.zip` into `dist/foodgo-headless-connector.zip`.
7. Creates `dist/config/` with a security `.htaccess` preventing direct HTTP access to credentials.
8. Automatically validates all required files, bundle sizes, JS/CSS assets, and exits with code 0.

---

## 3. Server Deployment (aaPanel / cPanel / Apache / Nginx / LiteSpeed)

Upload the **CONTENTS of `dist/`** directly to the website root:

```text
DOCUMENT ROOT (/www/wwwroot/domain.com/ or public_html/)
│
├── index.html                     # Customer Storefront (Default DirectoryIndex)
├── admin.php                      # WordPress Connection Gateway
├── .htaccess                      # Security & SPA Rewrite rules
├── foodgo-headless-connector.zip  # Downloadable WordPress Plugin
│
├── assets/                        # Compiled JavaScript & CSS bundles
│   ├── index-*.js
│   └── index-*.css
│
└── config/                        # Server-side persistent storage
    └── .htaccess                  # Access-denied rules for connection.json
```

---

## 4. Verification Check

After uploading:
1. `https://domain.com/` → Customer Storefront loads immediately.
2. `https://domain.com/admin.php?health=1` → System health JSON/table shows PHP 8.x, cURL, OpenSSL, and storage OK.
3. `https://domain.com/admin.php` → Connection Control Panel allows linking to WordPress with an Application Password.
