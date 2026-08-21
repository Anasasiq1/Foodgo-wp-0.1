# Troubleshooting Guide

### 1. Website Loads Blank Screen or 404 on Subpages
- **Cause**: The web server is looking for physical files for SPA route URLs.
- **Fix**:
  - **Apache / LiteSpeed**: Ensure `.htaccess` is uploaded to the document root and `mod_rewrite` is enabled.
  - **Nginx (aaPanel)**: Add `try_files $uri $uri/ /index.html;` to your site configuration.

### 2. Products Do Not Show Up on Homepage
- **Cause**: WordPress REST API or WooCommerce Store API is unreachable or has CORS restrictions.
- **Fix**:
  1. Open `https://your-domain.com/admin.php` and run connection diagnostics.
  2. Verify that **Foodgo Headless Connector Plugin** is installed and activated on WordPress.
  3. Ensure WordPress Pretty Permalinks are set to **Post name** (under **Settings → Permalinks**).

### 3. admin.php Shows "Foodgo Plugin: FAILED"
- **Cause**: `foodgo-headless-connector.zip` was not installed or activated in WordPress.
- **Fix**:
  1. Download the ZIP file from `https://your-domain.com/admin.php?download_plugin=1`.
  2. In WordPress Admin, go to **Plugins → Add New → Upload Plugin** and upload the ZIP.
  3. Activate the plugin and click **TEST CONNECTION** in `admin.php`.

### 4. Cart or Checkout Returns "Invalid Nonce" or Session Error
- **Cause**: WooCommerce Store API requires Nonce handling for state mutations.
- **Fix**: Foodgo's `src/services/apiClient.ts` automatically extracts and re-supplies `Nonce` headers from Store API responses. Ensure your web host does not strip `Nonce` or `X-WC-Store-API-Nonce` headers.
