# Foodgo Architecture Specification

## 1. High-Level Architecture Overview

Foodgo operates as a decoupled, headless commerce system with zero custom database requirements:

```text
               CUSTOMER (Web / Mobile)
                         │
                         ▼
              https://domain.com/
           [Foodgo React Frontend]
                         │
                         ▼
         WooCommerce Store API / REST API
                         │
                         ▼
              [WordPress + WooCommerce]
                         │
                         ▼
             WordPress MySQL Database


         CONNECTION & INTEGRATION CONTROL:
           https://domain.com/admin.php
                         │
                         │ (WP URL + Username + Application Password)
                         ▼
              WordPress REST Engine
```

---

## 2. Component Responsibilities

### A. Customer Frontend (`src/`) — React / TypeScript
- Renders customer UI, product browsing, search, food customizers (spice levels, curry portions, toppings), cart drawer, dynamic checkout, customer orders, and live customer support.
- Communicates directly with the WooCommerce Store API for authoritative cart totals, taxes, discounts, and checkout.
- Never stores or transmits WordPress administrative passwords.

### B. WordPress Connection Control (`admin.php`)
- Dedicated connection control panel at `https://domain.com/admin.php`.
- Purpose: Connect the Foodgo storefront to WordPress + WooCommerce.
- Features: Configures WordPress URL, Username, and WordPress Application Password; runs real-time diagnostics; provides direct download for `foodgo-headless-connector.zip`.
- **Not a commerce management panel**: Products, inventory, coupons, orders, and gateways are managed directly in `/wp-admin`.

### C. WordPress + WooCommerce
- Core commerce engine managing products, variations, prices, inventory, shipping zones, tax calculations, coupons, customers, and order lifecycle.

### D. Foodgo Headless Connector Plugin (`wordpress-plugin/foodgo-headless-connector`)
- Exposes `/wp-json/foodgo/v1/config` for runtime store capability auto-discovery.
- Bridges Store API line item customization (spice level, portion count, salna/curry addons).
- Configures secure CORS headers for authorized storefront origins.
