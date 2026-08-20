# aaPanel Deployment Guide

Deploying Foodgo on **aaPanel** (Nginx + PHP + MySQL):

---

## 1. Domain / Subdomain Setup
- **Storefront / Frontend**: `foodgo.yourdomain.com`
- **WordPress Backend**: `api.yourdomain.com`

## 2. WordPress Site Setup (aaPanel)
1. In aaPanel, create a new PHP site for `api.yourdomain.com` with PHP 7.4/8.1/8.2 + MySQL.
2. Install WordPress and WooCommerce.
3. Install and activate `wordpress-plugin/foodgo-headless-connector`.
4. In **Users → Profile → Application Passwords**, generate an Application Password for Foodgo.

## 3. Frontend Site Setup (aaPanel)
1. Create a website for `foodgo.yourdomain.com`.
2. Build the frontend:
   ```bash
   npm run build
   ```
3. Upload contents of `dist/` and `admin.php` to `/www/wwwroot/foodgo.yourdomain.com/`.
4. Open `https://foodgo.yourdomain.com/admin.php`, enter your WordPress URL (`https://api.yourdomain.com`), username, and Application Password.
5. Click **CONNECT WORDPRESS**. Your store is live!
