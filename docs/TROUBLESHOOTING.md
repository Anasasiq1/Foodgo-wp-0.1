# Production Diagnostics & Troubleshooting Guide

This guide outlines step-by-step diagnostic procedures for resolving issues with `admin.php`, WordPress connectivity, server permissions, and customer storefront loading.

---

## 1. Diagnostic Health Check Sequence

If `https://domain.com/admin.php` fails or returns unexpected results, follow this exact diagnostic checklist:

### STEP 1: Check System Health API
Open:
```text
https://domain.com/admin.php?health=1
or
https://domain.com/admin.php?health=json
```

Expected output:
```json
{
  "status": "ok",
  "php_runtime": true,
  "php_version": "8.2.x",
  "extensions": {
    "curl": true,
    "json": true,
    "openssl": true
  },
  "filesystem": {
    "config_dir_exists": true,
    "config_dir_writable": true,
    "plugin_zip_present": true
  }
}
```

---

## 2. Common Issues and Solutions

### Issue 1: Browser downloads `admin.php` instead of running it
- **Cause**: PHP is not configured or assigned to the domain handler in aaPanel/cPanel.
- **Solution**:
  - **aaPanel**: Go to **Website** → Click site domain → **PHP Version** → Select PHP 8.1 or 8.2.
  - **cPanel**: Go to **MultiPHP Manager** → Assign PHP 8.1+ to the domain.
  - **OpenLiteSpeed / Nginx**: Verify PHP-FPM socket handler is running.

### Issue 2: `admin.php` displays "PHP cURL extension is missing"
- **Cause**: The `php-curl` extension is disabled or not installed on your server.
- **Solution**:
  - **aaPanel**: Go to **App Store** → **PHP-8.x** → **Extensions** → Install `curl`.
  - **cPanel**: Go to **Select PHP Version** → **Extensions** → Check `curl`.
  - **Ubuntu/Debian SSH**: `sudo apt install php8.2-curl && sudo systemctl restart php8.2-fpm`

### Issue 3: `admin.php` shows HTTP 500 (Internal Server Error)
- **Cause**: PHP fatal error or file permission issue.
- **Solution**:
  - Check the server PHP error log (`/www/wwwlogs/yourdomain.com.error.log` in aaPanel or `error_log` in cPanel `public_html/`).
  - Ensure all files in `public_html/` have permission `644` and directories have permission `755`.

### Issue 4: SSL Handshake Error / HTTPS Certificate Failure
- **Cause**: WordPress URL has an expired, self-signed, or untrusted SSL certificate.
- **Solution**:
  - Ensure your WordPress domain has a valid SSL certificate (e.g. via Let's Encrypt in aaPanel/cPanel).
  - Verify that the WordPress URL entered in `admin.php` starts with `https://` and resolves to the correct host.

### Issue 5: WordPress Core REST connected, but WooCommerce Store API fails
- **Cause**: WooCommerce is inactive, or permalinks are set to Plain.
- **Solution**:
  - In WordPress Admin, go to **Settings → Permalinks** and choose **Post name** (e.g. `/%postname%/`), then click **Save Changes**. WooCommerce REST & Store API require pretty permalinks.
  - Ensure **WooCommerce** plugin is installed and activated.

### Issue 6: Foodgo Connector Plugin shows "Not Found / Inactive"
- **Cause**: `foodgo-headless-connector.zip` is not installed or activated on WordPress.
- **Solution**:
  - Download `foodgo-headless-connector.zip` from `https://domain.com/admin.php` or `https://domain.com/foodgo-headless-connector.zip`.
  - In WordPress Admin, go to **Plugins → Add New → Upload Plugin**, upload the ZIP, and click **Activate**.

### Issue 7: Customer storefront shows blank page or 404 on refresh
- **Cause**: `.htaccess` rewrite rules are not being applied by the web server.
- **Solution**:
  - In Apache, ensure `AllowOverride All` is enabled in your virtual host config.
  - In aaPanel Nginx, ensure URL Rewrite rule contains:
    ```nginx
    location / {
        try_files $uri $uri/ /index.html;
    }
    ```
