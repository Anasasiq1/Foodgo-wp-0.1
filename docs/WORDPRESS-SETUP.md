# Foodgo Headless WooCommerce Setup Guide

This guide walks you through setting up WordPress, WooCommerce, and the Foodgo Headless Connector to connect to the React frontend.

---

## 1. WordPress & Server Preparation
- Install WordPress (version 6.0+) on your server, VPS, or aaPanel.
- Enable Pretty Permalinks under **Settings → Permalinks** (Select **Post name** `/%postname%/`).

## 2. Install & Configure WooCommerce
1. In WordPress Admin, navigate to **Plugins → Add New**.
2. Search for **WooCommerce**, install and activate it.
3. Complete the basic store setup (currency, store location, address).
4. Enable your desired payment methods under **WooCommerce → Settings → Payments** (e.g. Cash on Delivery, Stripe, Razorpay).

## 3. Install Foodgo Headless Connector
1. Copy the `wordpress-plugin/foodgo-headless-connector` folder to your WordPress plugins directory (`wp-content/plugins/`).
2. Go to **WordPress Admin → Plugins** and click **Activate** for **Foodgo Headless Connector**.
3. Navigate to **Settings → Foodgo Connector**:
   - In **Frontend Website URL**, enter your deployed frontend URL (e.g. `https://foodgo.yourdomain.com` or `http://localhost:3000` for development).
   - Click **Save Settings**.

## 4. Frontend Connection
In your React frontend root directory, configure `.env`:
```env
VITE_WP_URL=https://api.yourdomain.com
```
Once configured, the frontend automatically discovers products, categories, stock, prices, payment methods, and store currency!
