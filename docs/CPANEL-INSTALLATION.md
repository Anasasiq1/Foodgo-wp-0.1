# cPanel Production Deployment & Setup Guide

This guide details how to deploy the complete Foodgo production package to **cPanel** and connect it to your WordPress + WooCommerce store.

---

## 1. Local Build

On your development computer:
```bash
npm install
npm run build
```

This generates the complete standalone production directory `dist/`.

---

## 2. Upload `dist/` Contents to cPanel `public_html`

> ⚠️ **CRITICAL RULE**: Upload the **CONTENTS** of `dist/` directly into `public_html/`. Do NOT create `public_html/dist/`.

1. Log in to your **cPanel dashboard**.
2. Open **File Manager** and enter `public_html/` (or your subdomain document root).
3. If necessary, zip the contents of your local `dist/` folder, upload `dist.zip` into `public_html/`, and extract it.
4. Verify the root structure of `public_html/`:
   ```text
   public_html/
   ├── index.html                     # Customer storefront SPA entry point
   ├── admin.php                      # WordPress connection & diagnostic control panel
   ├── .htaccess                      # DirectoryIndex index.html & SPA Rewrite Rules
   ├── foodgo-headless-connector.zip  # WordPress plugin package
   ├── assets/                        # Compiled JS, CSS, and images
   └── config/                        # Protected server-side config directory
   ```
5. Ensure permissions:
   - `public_html/config/` directory: `755`
   - `.htaccess` and files: `644`

---

## 3. Configure PHP in cPanel

1. In cPanel, navigate to **Select PHP Version** or **MultiPHP Manager**.
2. Set your domain to use **PHP 8.1**, **PHP 8.2**, or **PHP 8.3**.
3. Under **PHP Extensions** (in PHP Selector), ensure the following are enabled:
   - `curl` (Crucial for `admin.php` WordPress communication)
   - `json` (Standard)
   - `openssl` (Required for HTTPS SSL verification)

---

## 4. Diagnostics & Testing

1. Open `https://yourdomain.com/admin.php?health=1` in your browser:
   - Verify **PHP Runtime**: Active
   - Verify **PHP Version**: 8.x
   - Verify **cURL**: Active
   - Verify **OpenSSL**: Active
   - Verify **Storage**: Writable
2. If `admin.php` downloads instead of executing:
   - Check **cPanel MultiPHP Manager** and ensure a valid PHP version is assigned to the domain handler.

---

## 5. Connecting WordPress & WooCommerce

1. Open `https://yourdomain.com/admin.php`.
2. Click **DOWNLOAD PLUGIN (.ZIP)** to download `foodgo-headless-connector.zip`.
3. In your WordPress site, install and activate the plugin via **Plugins → Add New → Upload Plugin**.
4. In WordPress Admin, navigate to **Users → Profile → Application Passwords** and generate a new Application Password.
5. In `admin.php`, enter your WordPress Site URL, Username, and Application Password, then click **CONNECT WORDPRESS**.
6. Visit `https://yourdomain.com/` — your live customer ordering storefront is active.
