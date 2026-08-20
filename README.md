# Foodgo — Decoupled Headless WooCommerce Frontend

Foodgo is a high-performance, mobile-first food ordering web application built with React 19, TypeScript, and Tailwind CSS, powered by a standard headless WordPress + WooCommerce backend through the **Foodgo Headless Connector** plugin.

---

## 🚀 Architecture Highlights

- **Single Source of Truth**: Products, pricing, tax, stock, variations, coupons, payment gateways, and orders live exclusively in WordPress & WooCommerce.
- **Zero Custom Database**: No separate backend database (no MongoDB, SQLite, Supabase, or Firebase) — everything is stored directly in WordPress MySQL/MariaDB.
- **Native WooCommerce Administration**: Manage your entire kitchen catalog, orders, and payment methods from standard WordPress & WooCommerce Admin (`/wp-admin`).
- **Dynamic Feature Auto-Discovery**: Frontend auto-discovers currency, payment gateways, coupons, and delivery configurations at runtime.
- **Food Customization Engine**: Spiciness sliders, portions, salna/curry addons, and kitchen instructions survive all the way to WooCommerce order items.

---

## 📁 Repository Structure

```
Foodgo/
│
├── src/
│   ├── components/         # Mobile-first storefront screens
│   ├── context/            # React state & WooCommerce synchronization
│   ├── config/             # Runtime dynamic backend configuration
│   ├── services/           # Decoupled API service layer
│   │   ├── auth/           # WordPress customer authentication
│   │   ├── woocommerce/    # Store API (products, cart, checkout, orders)
│   │   ├── foodgo/         # Kitchen & delivery logistics
│   │   ├── payments/       # Dynamic payment adapters
│   │   └── apiClient.ts    # Unified fetch client with Store API nonce support
│   └── types/              # TypeScript schema & WooCommerce interfaces
│
├── wordpress-plugin/
│   └── foodgo-headless-connector/   # Production-ready WordPress bridge plugin
│       ├── foodgo-headless-connector.php
│       ├── includes/       # Dynamic config, CORS, auth, products, orders
│       ├── admin/          # Minimal connection settings page
│       └── readme.txt
│
└── docs/                   # Complete architecture & deployment manuals
    ├── ARCHITECTURE.md
    ├── WORDPRESS-SETUP.md
    ├── WOOCOMMERCE-SETUP.md
    ├── PLUGIN-INSTALLATION.md
    ├── WOOCOMMERCE-PLUGIN-COMPATIBILITY.md
    ├── FRONTEND-CONNECTION.md
    ├── API.md
    ├── SECURITY.md
    ├── AAPANEL.md
    └── DEPLOYMENT.md
```

---

## ⚡ Quick Start

### 1. WordPress & WooCommerce Setup
1. Install WordPress 6.0+ and WooCommerce 8.0+.
2. Upload `wordpress-plugin/foodgo-headless-connector` into `wp-content/plugins/`.
3. Activate the plugin in **WordPress Admin → Plugins**.
4. Set your frontend URL in **Settings → Foodgo Connector**.

### 2. Frontend Launch
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set your WordPress API URL in `.env`:
   ```env
   VITE_WP_URL=https://your-wp-domain.com
   ```
3. Run dev server or build for production:
   ```bash
   npm run dev
   npm run build
   ```
