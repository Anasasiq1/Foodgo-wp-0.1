# 🚀 Foodgo Complete Deployment & Installation Guide

This master guide covers end-to-end installation and deployment of the Foodgo Headless Ordering Platform on **aaPanel**, **cPanel**, **Apache / Nginx VPS**, **Node.js Server**, and **Static / CDN Hosting**.

---

## 📋 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [aaPanel Installation (Recommended)](#2-aapanel-installation-recommended)
3. [cPanel Installation](#3-cpanel-installation)
4. [Linux VPS (Ubuntu / Debian + Apache / Nginx)](#4-linux-vps-ubuntu--debian--apache--nginx)
5. [Node.js / Full-Stack Server Deployment](#5-nodejs--full-stack-server-deployment)
6. [WordPress & WooCommerce Backend Connection](#6-wordpress--woocommerce-backend-connection)
7. [Post-Installation Checklist](#7-post-installation-checklist)

---

## 1. Architecture Overview

Foodgo uses a modern decoupled headless architecture:
- **Frontend**: React 19 + TypeScript + Tailwind CSS (SPA).
- **Web Admin Gateway**: `admin.php` (for quick runtime connection to WooCommerce without server restarts).
- **Backend / E-Commerce**: Standard WordPress + WooCommerce + `foodgo-headless-connector` plugin.
- **Payment Layer**: Native UPI Deep Linking (`upi://pay`), QR Code, Cash on Delivery (COD), and Card gateways.

```
┌────────────────────────────────────────┐
│     Customer Front Store (React SPA)   │
│     https://your-domain.com            │
└──────────────────┬─────────────────────┘
                   │
         REST API / Store API
                   │
┌──────────────────▼─────────────────────┐
│ WordPress + WooCommerce + Bridge Plugin│
│ https://wp.your-domain.com             │
└────────────────────────────────────────┘
```

---

## 2. aaPanel Installation (Recommended)

### Step 1: Create Website in aaPanel
1. Log in to your **aaPanel Control Panel**.
2. Navigate to **Website** ➔ Click **Add Site**.
3. Enter your domain (e.g., `hm-q.in`).
4. **CRITICAL**: In the **PHP Version** dropdown:
   - ❌ Do **NOT** choose "Pure static".
   - ✅ Select **PHP 7.4**, **PHP 8.0**, **PHP 8.1**, or **PHP 8.2** (required for `admin.php` backend gateway).
5. Click **Submit**.

### Step 2: Build & Upload Files
1. In your local development machine, run the build command:
   ```bash
   npm run build
   ```
2. Compress all files inside the generated `dist/` directory into a `.zip` archive.
3. In aaPanel, go to **Files** ➔ navigate to `/www/wwwroot/your-domain.com/`.
4. Upload and extract your `.zip` archive directly into the root web directory.

### Step 3: Verify `.htaccess` (Apache / OLS)
Ensure your `.htaccess` inside the root folder matches this configuration:
```apache
DirectoryIndex index.html index.php

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Allow direct execution of admin gateway & connector plugin
    RewriteRule ^admin\.php$ - [L]
    RewriteRule ^foodgo-headless-connector\.zip$ - [L]
    RewriteRule ^config/connection-public\.json$ - [L]

    # Protect internal configuration
    RewriteRule ^config/connection\.json$ - [F,L,NC]
    RewriteRule ^(\.git|\.env|package\.json|tsconfig\.json|server\.ts) - [F,L,NC]

    # Serve static assets
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # SPA Fallback to index.html
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

### Step 4: If using Nginx in aaPanel
In aaPanel ➔ **Website** ➔ **Settings** ➔ **URL Rewrite**, paste:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location ~ \.php$ {
    include enable-php-74.conf; # or your active PHP version
}

location ~ ^/config/connection\.json {
    deny all;
}
```

### Step 5: Enable SSL (HTTPS)
In aaPanel ➔ **Website** ➔ **Settings** ➔ **SSL** ➔ Select **Let's Encrypt** ➔ Click **Apply**.

---

## 3. cPanel Installation

1. Log in to your **cPanel**.
2. Open **File Manager** ➔ Go to `public_html/`.
3. Upload the built files from `dist/` (or your repository deployment).
4. Go to cPanel **Select PHP Version**: Ensure PHP 7.4 or 8.x is active.
5. In **File Manager Settings** (top right), enable **Show Hidden Files (dotfiles)**.
6. Verify that `.htaccess` is present and contains the rewrite rules above.
7. Open `https://your-domain.com/admin.php` to configure your WooCommerce connection.

---

## 4. Linux VPS (Ubuntu / Debian + Apache / Nginx)

### A. Apache Setup
```bash
sudo apt update && sudo apt install -y apache2 php libapache2-mod-php php-curl php-json php-mbstring
sudo a2enmod rewrite headers ssl
```

Configure your VirtualHost (`/etc/apache2/sites-available/foodgo.conf`):
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/foodgo

    <Directory /var/www/foodgo>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/foodgo_error.log
    CustomLog ${APACHE_LOG_DIR}/foodgo_access.log combined
</VirtualHost>
```
Enable site and reload:
```bash
sudo a2ensite foodgo.conf
sudo systemctl restart apache2
```

### B. Nginx + PHP-FPM Setup
```bash
sudo apt update && sudo apt install -y nginx php-fpm php-curl php-json
```

Configure Nginx server block (`/etc/nginx/sites-available/foodgo`):
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/foodgo;
    index index.html index.php;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock; # Adjust to your PHP version
    }

    location ~ /config/connection\.json {
        deny all;
        return 403;
    }

    location ~ /\.(env|git) {
        deny all;
        return 403;
    }
}
```
Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/foodgo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

---

## 5. Node.js / Full-Stack Server Deployment

Foodgo also includes a full-stack Express server (`server.ts`) for environments that prefer running as a Node.js process:

```bash
# 1. Install dependencies
npm install

# 2. Build frontend and compile backend
npm run build

# 3. Start with PM2
npm install -g pm2
pm2 start dist/server.cjs --name "foodgo"

# 4. Save PM2 startup
pm2 save
pm2 startup
```

---

## 6. WordPress & WooCommerce Backend Connection

1. On your WordPress site (`https://your-wp-site.com`):
   - Install and activate **WooCommerce**.
   - Install and activate **Foodgo Headless Connector** (`foodgo-headless-connector.zip`).
2. Go to WooCommerce ➔ **Settings** ➔ **Advanced** ➔ **REST API** ➔ **Add Key**:
   - Description: `Foodgo Frontend`
   - Permissions: `Read/Write`
   - Copy the **Consumer Key (`ck_...`)** and **Consumer Secret (`cs_...`)**.
3. Open your Foodgo Admin Portal:
   - Visit `https://your-domain.com/admin.php`
   - Paste your WordPress URL, Consumer Key, Consumer Secret, and UPI details.
   - Click **Save Connection & Sync Catalog**.

---

## 7. Post-Installation Checklist

- [ ] `https://your-domain.com/` loads the customer storefront.
- [ ] `https://your-domain.com/admin.php` loads the connection admin gateway without 500 or 503 errors.
- [ ] Products load dynamically from WooCommerce.
- [ ] Cart add, customizations (portions, spiciness, salna), and checkout work seamlessly.
- [ ] UPI Intent and QR generation display correct VPA and amounts.
