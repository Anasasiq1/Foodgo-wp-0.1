# cPanel Static Deployment & WordPress Setup Guide

This guide walks through deploying the static Foodgo React storefront to **cPanel Shared Hosting / LiteSpeed / Apache** and connecting to WooCommerce.

---

## Deployment Steps

### 1. Build the Frontend Locally
```bash
npm install
npm run build
```

### 2. Upload to public_html via cPanel File Manager
1. Log in to your **cPanel dashboard**.
2. Open **File Manager** and navigate into `public_html/` (or the document root of your subdomain).
3. If an existing `index.html` or default page exists, delete or rename it.
4. Upload and extract the contents of the `dist/` folder:
   - `public_html/index.html`
   - `public_html/assets/`
   - `public_html/foodgo-headless-connector.zip`
5. Upload the root files:
   - `public_html/admin.php`
   - `public_html/index.php`
   - `public_html/.htaccess`

### 3. Verify .htaccess for SPA Routes & PHP Gateway
Ensure the `.htaccess` file inside `public_html/` contains the standard Foodgo rules:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    RewriteRule ^admin\.php$ - [L]
    RewriteRule ^index\.php$ - [L]
    RewriteRule ^foodgo-headless-connector\.zip$ - [L]

    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    RewriteCond %{DOCUMENT_ROOT}/index.html -f
    RewriteRule ^ index.html [L]

    RewriteRule ^ index.php [L]
</IfModule>
```

### 4. Install Foodgo Headless Connector in WordPress
1. In WordPress Admin (`/wp-admin`), go to **Plugins → Add New → Upload Plugin**.
2. Upload `foodgo-headless-connector.zip`.
3. Activate the plugin.
4. Generate an Application Password under **Users → Profile**.

### 5. Finalize Connection
1. Visit `https://yourdomain.com/admin.php`.
2. Enter your WordPress URL, Username, and Application Password.
3. Click **SAVE & CONNECT WORDPRESS**.
4. Visit `https://yourdomain.com/` — your store will display all live products, categories, cart, and checkout seamlessly!
