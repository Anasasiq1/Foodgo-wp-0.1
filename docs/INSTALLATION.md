# Foodgo Installation Guide

This document outlines the setup and installation processes for Foodgo in both Development and Production environments.

---

## 1. Development Setup

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Steps
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Configure your WordPress backend endpoint in `.env`:
   ```env
   VITE_WP_URL=https://your-wordpress-site.com
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` to interact with the Foodgo storefront.

---

## 2. Production Build & Static Deployment

The Foodgo customer frontend compiles into a **100% static client-side Single Page Application (SPA)**. No Node.js process, PM2 daemon, or backend server is required on the web hosting server!

### Step 1: Build Locally
```bash
npm run build
```
This generates the `dist/` directory, which contains:
- `index.html` (Primary SPA entry point)
- `assets/` (Compiled JavaScript and CSS bundles, fonts, images)
- `foodgo-headless-connector.zip` (Pre-packaged WordPress connector plugin)

### Step 2: Upload to Web Hosting
Upload the **contents of `dist/`** directly into your web hosting document root (`public_html/` on cPanel or `/www/wwwroot/domain.com/` on aaPanel):
- `dist/index.html` → `public_html/index.html`
- `dist/assets/` → `public_html/assets/`
- `dist/foodgo-headless-connector.zip` → `public_html/foodgo-headless-connector.zip`
- Upload `admin.php`, `index.php`, and `.htaccess` to `public_html/`.

---

## 3. WordPress Backend Setup

1. In WordPress Admin (`/wp-admin`), navigate to **Plugins → Add New → Upload Plugin**.
2. Select and upload `foodgo-headless-connector.zip` (downloadable directly from `admin.php` or `dist/`).
3. Click **Activate Plugin**.
4. Ensure WooCommerce is active with sample or real food products.
5. In WordPress Admin, navigate to **Users → Profile → Application Passwords** and generate a new token for Foodgo.

---

## 4. Connecting via admin.php
1. Visit `https://your-domain.com/admin.php` in your browser.
2. Enter your WordPress URL, Username, and Application Password.
3. Click **SAVE & CONNECT WORDPRESS**.
4. The system will perform instant diagnostics:
   - WordPress Core REST API: ✅ CONNECTED
   - WooCommerce Store API: ✅ CONNECTED
   - Foodgo Connector Plugin: ✅ CONNECTED
5. Your live storefront is now fully operational at `https://your-domain.com/`!
