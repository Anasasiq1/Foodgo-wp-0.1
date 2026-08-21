# aaPanel Production Deployment & Setup Guide

This guide details how to deploy the Foodgo production package to **aaPanel** and connect it to your WordPress + WooCommerce backend.

---

## 1. Architecture Summary

- **Customer Storefront (`/`)**: 100% Static React Single Page Application loaded through `index.html`.
- **WordPress Connection Gateway (`/admin.php`)**: Independent PHP script that handles server-side connection testing and Application Password configuration.
- **Diagnostics (`/admin.php?health=1`)**: Production-safe diagnostic endpoint for runtime, cURL, OpenSSL, and storage status.
- **Backend**: WordPress + WooCommerce + Foodgo Headless Connector Plugin.
- **No Node.js, PM2, or SSH** is required on the production web server!

---

## 2. Build the Production Package Locally

On your local machine:
```bash
npm install
npm run build
```

This single command builds and validates the complete production package inside `dist/`:
```text
dist/
├── index.html                     # Customer storefront SPA entry point
├── admin.php                      # WordPress connection & diagnostic control panel
├── .htaccess                      # DirectoryIndex index.html & SPA Rewrite Rules
├── foodgo-headless-connector.zip  # WordPress plugin package
├── assets/                        # Compiled JS, CSS, and image assets
└── config/                        # Protected server-side config storage (.htaccess protected)
```

---

## 3. Create the Site in aaPanel

1. Log in to your **aaPanel dashboard**.
2. Navigate to **Website** → **Add site**.
3. Fill in:
   - **Domain**: `yourdomain.com` (or `store.yourdomain.com`)
   - **PHP Version**: Select **PHP 8.1**, **PHP 8.2**, **PHP 8.3**, or **PHP 8.4**
4. Click **Submit**.

---

## 4. Upload `dist/` Contents to Website Document Root

> ⚠️ **CRITICAL PATH RULE**: Upload the **CONTENTS** of `dist/` directly into `/www/wwwroot/yourdomain.com/`. Do NOT upload the parent `dist` folder itself.

1. In aaPanel, navigate to **Files** → `/www/wwwroot/yourdomain.com/`.
2. Delete any default aaPanel placeholder files (`index.html`, `404.html`).
3. Upload and extract the contents of `dist/` so the root directory looks like:
   ```text
   /www/wwwroot/yourdomain.com/
   ├── index.html
   ├── admin.php
   ├── .htaccess
   ├── foodgo-headless-connector.zip
   ├── assets/
   └── config/
   ```
4. Ensure file permissions:
   - Files: `644`
   - Directories: `755` (especially `/config` directory for saving connection settings)

---

## 5. Web Server Configuration in aaPanel

### A. If using Nginx in aaPanel:
Navigate to **Website** → Click your site → **URL rewrite**, and set:

```nginx
# 1. Direct execution for admin.php & static plugin zip
location ~ ^/(admin\.php|foodgo-headless-connector\.zip)$ {
    include enable-php-81.conf; # Match your aaPanel PHP version (e.g. enable-php-82.conf)
}

# 2. Block direct access to sensitive config files except public config
location ~ ^/config/(?!connection-public\.json$).*\.json$ {
    deny all;
}

# 3. Customer Storefront SPA Rewrite to index.html
location / {
    try_files $uri $uri/ /index.html;
}

# 4. Standard PHP handler
location ~ \.php$ {
    include enable-php-81.conf;
}
```

### B. If using Apache or OpenLiteSpeed in aaPanel:
The included `.htaccess` in `dist/` automatically handles `DirectoryIndex index.html`, SPA routes, and security protections out of the box.

---

## 6. Verify PHP Extensions in aaPanel

1. In aaPanel, go to **App Store** → **PHP-8.x** → **Settings** → **Extensions**.
2. Verify that the following extensions are installed and enabled:
   - `curl` (Required for WordPress REST & Store API calls)
   - `json` (Built-in)
   - `openssl` (Required for HTTPS SSL verification)
   - `fileinfo`

---

## 7. Connect Storefront to WordPress & WooCommerce

1. Open `https://yourdomain.com/admin.php` (or test health via `https://yourdomain.com/admin.php?health=1`).
2. Download the plugin `foodgo-headless-connector.zip` and upload/activate it in WordPress (**Plugins → Add New → Upload Plugin**).
3. In WordPress Admin, navigate to **Users → Profile → Application Passwords** and generate a new Application Password.
4. Back in `https://yourdomain.com/admin.php`, enter:
   - **WordPress Website URL**: `https://your-wordpress-site.com`
   - **WordPress Username**: Your WordPress admin username
   - **WordPress Application Password**: The 24-character Application Password
5. Click **CONNECT WORDPRESS**.
6. When diagnostics show all green (WordPress REST API, WooCommerce Store API, Foodgo Connector Plugin), open `https://yourdomain.com/` to start receiving orders!
