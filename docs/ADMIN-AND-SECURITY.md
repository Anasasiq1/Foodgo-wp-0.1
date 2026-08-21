# 🛡️ Admin Gateway & Security Architecture

Foodgo is built with strict security practices to keep your WooCommerce credentials and user payment metadata secure.

---

## 🏛️ 1. The `admin.php` Web Gateway

The `admin.php` portal provides an on-server interface for setting up and testing WooCommerce connections without modifying source code or rebuilding bundles.

### Key Capabilities:
- **Test Connection**: Validates WordPress reachability, SSL integrity, REST API permissions, and WooCommerce version.
- **Credential Storage**: Saves credentials server-side into `config/connection.json` with strict file permissions.
- **Public Config Extraction**: Automatically generates a sanitized `config/connection-public.json` (containing only public non-sensitive attributes like store name, currency, and store URL).
- **Direct Plugin Download**: One-click download of `foodgo-headless-connector.zip`.
- **Diagnostic Health Check**: Runs system tests for PHP extensions (curl, json, mbstring), write permissions, and mod_rewrite status.

---

## 🔒 2. File & Directory Protection Rules

### Sensitive Storage
- `config/connection.json`: Contains Consumer Key & Secret. Protected by `.htaccess` and server rules against direct HTTP access.
- `.env` & `.git`: Completely blocked from web access.

### Production Permissions
```bash
chmod 755 /var/www/foodgo
chmod 644 /var/www/foodgo/index.html
chmod 644 /var/www/foodgo/admin.php
chmod 644 /var/www/foodgo/.htaccess
chmod 775 /var/www/foodgo/config
chmod 660 /var/www/foodgo/config/connection.json
```

---

## 🛡️ 3. Security Headers
Foodgo serves standard security headers to prevent clickjacking and MIME sniffing:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
