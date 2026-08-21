# 🛠️ Foodgo Complete Troubleshooting & Error Resolution Guide

This guide provides immediate, field-tested solutions for common server, PHP, Apache, and WooCommerce connection issues.

---

## 📑 Quick Diagnostic Matrix

| Error Code / Symptom | Root Cause | Immediate Fix |
| :--- | :--- | :--- |
| **500 Internal Server Error** | Invalid `.htaccess` directive or lookaround regex unsupported by Apache | Update `.htaccess` with safe `<Files>` syntax (see below). |
| **503 Service Unavailable** | PHP-FPM service stopped or site set to "Pure static" in aaPanel | Switch PHP version from "Pure static" to PHP 7.4 / 8.x and restart PHP-FPM. |
| **404 Not Found on Route Refresh** | Missing SPA rewrite rule in Apache / Nginx | Add `RewriteRule . index.html [L]` to `.htaccess`. |
| **CORS Blocked in Browser** | WordPress REST API missing CORS headers | Activate `foodgo-headless-connector` plugin on WordPress. |
| **401 / 403 REST API Error** | Invalid WooCommerce Consumer Key/Secret | Re-generate API keys in WooCommerce with Read/Write permission. |
| **UPI App Doesn't Open on Mobile** | Invalid UPI VPA ID or unsupported URL scheme | Verify VPA format (e.g., `user@okaxis`, `merchant@upi`) in `admin.php`. |

---

## 1. 500 Internal Server Error (Apache / aaPanel / cPanel)

### Cause:
Apache fails to parse `.htaccess` when negative lookahead regexes like `(?!...)` are used in `<FilesMatch>` directives or when `mod_rewrite` is disabled.

### Solution:
Replace your root `.htaccess` with the following clean, verified configuration:

```apache
DirectoryIndex index.html index.php

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Allow direct execution of admin.php and public config
    RewriteRule ^admin\.php$ - [L]
    RewriteRule ^foodgo-headless-connector\.zip$ - [L]
    RewriteRule ^config/connection-public\.json$ - [L]

    # Block sensitive config & files
    RewriteRule ^config/connection\.json$ - [F,L,NC]
    RewriteRule ^(\.git|\.env|package\.json|tsconfig\.json|server\.ts) - [F,L,NC]

    # Serve existing static files & assets directly
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # Fallback to index.html for SPA Frontend
    RewriteRule . index.html [L]
</IfModule>

<IfModule mod_autoindex.c>
    Options -Indexes
</IfModule>

<FilesMatch "\.(env|sql|log|sh|lock|ts|tsx)$">
    <IfModule mod_authz_core.c>
        Require all denied
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Deny from all
    </IfModule>
</FilesMatch>

<Files "connection.json">
    <IfModule mod_authz_core.c>
        Require all denied
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Deny from all
    </IfModule>
</Files>
```

---

## 2. 503 Service Unavailable (on `admin.php`)

### Cause:
The web server (Apache or Nginx) cannot communicate with the PHP-FPM process. This occurs when:
1. In aaPanel, the domain is configured as **"Pure static"** (no PHP handler assigned).
2. The PHP-FPM service has stopped or crashed.

### Solution in aaPanel:
1. Go to **Website** ➔ Click on your site (`hm-q.in`).
2. Go to the **PHP version** tab on the left.
3. Switch from **"Pure static"** to **PHP-74**, **PHP-80**, **PHP-81**, or **PHP-82**.
4. Click **Switch**.
5. Go to **App Store** ➔ **Installed** ➔ Find your PHP version ➔ Click **Restart**.

### Solution on Ubuntu / Linux VPS:
```bash
# Check PHP service status
sudo systemctl status php7.4-fpm # or php8.1-fpm

# Restart PHP-FPM and Apache
sudo systemctl restart php*-fpm
sudo systemctl restart apache2
```

---

## 3. 404 Not Found when Refreshing Sub-Pages (SPA Routing)

### Cause:
React uses HTML5 History API for client-side routing (`/cart`, `/profile`, `/orders`). When you reload the page, the server looks for a physical directory named `/cart/index.html`.

### Solution:
The `RewriteRule . index.html [L]` line in your `.htaccess` (or `try_files $uri $uri/ /index.html;` in Nginx) directs all non-file requests back to `index.html` so React Router can handle them.

---

## 4. CORS (Cross-Origin Resource Sharing) Errors

### Cause:
The browser blocks requests from `https://your-domain.com` to `https://your-wp-site.com` if WordPress does not return appropriate CORS headers.

### Solution:
1. Install and activate the **Foodgo Headless Connector** plugin (`foodgo-headless-connector.zip`) on your WordPress site. The plugin automatically emits:
   ```http
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE
   Access-Control-Allow-Headers: Authorization, Content-Type, X-WC-Store-API-Nonce, Nonce
   ```
2. If WordPress is behind Cloudflare, disable Cloudflare "Bot Fight Mode" or create a WAF rule allowing `wp-json/wc/*` and `wp-json/foodgo/*`.

---

## 5. WooCommerce REST API Authentication Failures (401 / 403)

### Checklist:
1. Ensure your WordPress URL uses **HTTPS** (Basic Auth over plain HTTP is rejected by WooCommerce for security).
2. Verify Consumer Key format: starts with `ck_` (e.g. `ck_1234567890abcdef...`).
3. Verify Consumer Secret format: starts with `cs_` (e.g. `cs_1234567890abcdef...`).
4. Ensure the WordPress user associated with the REST Key has the **Administrator** role.
5. In WordPress Admin ➔ **Settings** ➔ **Permalinks**, ensure Permalinks are set to **Post name** (not Plain). Plain permalinks break `wp-json` routes.

---

## 6. UPI Intent & QR Code Not Working

### Checklist:
1. Verify the VPA format: Must be in `username@bank` format (e.g., `hmq@oksbi`, `foodgo@upi`).
2. Ensure there are no spaces or special characters in the Payee Name or UPI ID.
3. On Desktop, UPI Intent links (`upi://pay`) do not open mobile apps; instead, the system automatically falls back to displaying the **Dynamic HM-Q QR Code** for scanning.
