# aaPanel Static Deployment & WordPress Setup Guide

This guide describes how to deploy the static Foodgo React storefront to **aaPanel** and connect it to your WordPress + WooCommerce backend.

---

## Architecture Overview

- **Customer Frontend**: 100% Static React Single Page Application (HTML, JS, CSS, WebP).
- **Backend**: WordPress + WooCommerce + Foodgo Headless Connector Plugin.
- **Connection**: `https://your-frontend-domain.com/admin.php` (Server-side WordPress credential verification).
- **No Node.js or PM2 process** is required on the production server for the frontend!

---

## Step-by-Step Deployment Instructions

### 1. Build the Frontend Locally
Run the production build on your development machine:
```bash
npm install
npm run build
```
This produces the `dist/` directory containing all compiled assets and the packaged WordPress plugin `foodgo-headless-connector.zip`.

### 2. Create the Frontend Site in aaPanel
1. Log in to your **aaPanel control panel**.
2. Navigate to **Website** → **Add site**.
3. Enter your domain (e.g. `foodgo.example.com` or `example.com`).
4. Set **PHP Version** to `PHP 7.4`, `PHP 8.1`, or `PHP 8.2` (for `admin.php` and `.htaccess` support).
5. Click **Submit**.

### 3. Upload dist CONTENTS via aaPanel File Manager
> ⚠️ **CRITICAL PATH RULE**: Do **NOT** upload the `dist` folder itself. Upload the **contents** of `dist/` directly into your website root `/www/wwwroot/your-domain.com/`.

1. In aaPanel, go to **Files** and navigate to `/www/wwwroot/your-domain.com/`.
2. Clear any default aaPanel placeholder files (`index.html`, `404.html`).
3. Upload all files from `dist/` into this folder:
   - `index.html` → `/www/wwwroot/your-domain.com/index.html`
   - `assets/` → `/www/wwwroot/your-domain.com/assets/`
   - `foodgo-headless-connector.zip` → `/www/wwwroot/your-domain.com/foodgo-headless-connector.zip`
4. Also upload `admin.php`, `index.php`, and `.htaccess` to `/www/wwwroot/your-domain.com/`.

### 4. Configure SPA URL Rewrite in aaPanel Nginx
In aaPanel **Website** → Click on your site → **URL rewrite**:
Paste the following rule:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location ~ \.php$ {
    include enable-php-81.conf; # Match your aaPanel PHP version
}
```
Click **Save**.

### 5. Setup WordPress & WooCommerce Backend
1. On your WordPress site (e.g. `api.example.com` or existing WordPress installation), navigate to **Plugins → Add New → Upload Plugin**.
2. Upload `foodgo-headless-connector.zip` (available from `dist/` or by downloading from `https://your-frontend-domain.com/admin.php`).
3. Click **Activate Plugin**.
4. In WordPress Admin, go to **Users → Profile → Application Passwords**.
5. Create a new Application Password named `Foodgo Frontend` and copy the generated 24-character token.

### 6. Connect Storefront via admin.php
1. Open `https://your-frontend-domain.com/admin.php` in your browser.
2. Enter:
   - **WordPress Site URL**: `https://api.example.com`
   - **WordPress Username**: Your WordPress admin or API username
   - **Application Password**: The generated Application Password
3. Click **SAVE & CONNECT WORDPRESS**.
4. The system will perform instant diagnostics:
   - WordPress REST API: ✅ CONNECTED
   - WooCommerce Store API: ✅ CONNECTED
   - Foodgo Connector Plugin: ✅ CONNECTED
5. Visit `https://your-frontend-domain.com/` — your live menu and food ordering storefront is ready!
