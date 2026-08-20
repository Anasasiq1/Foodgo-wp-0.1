# Frontend Connection & Auto-Discovery

## Runtime Connection Workflow

```
1. Frontend Startup (getInitialWpUrl / getRuntimeConfig)
   ├── Check window.__FOODGO_CONFIG__ (Server Injection)
   ├── Check localStorage ('foodgo_wp_url')
   ├── Check import.meta.env.VITE_WP_URL
   └── Fallback to current origin

2. Auto-Discovery Call (/wp-json/foodgo/v1/config)
   ├── Fetches active currency (e.g., INR, USD, EUR) & symbol
   ├── Fetches enabled WooCommerce payment methods
   ├── Fetches delivery slot configurations
   └── Updates runtime store state seamlessly

3. Catalog Sync (/wp-json/wc/store/v1/products)
   └── Hydrates storefront products, prices, stock, and variations
```
