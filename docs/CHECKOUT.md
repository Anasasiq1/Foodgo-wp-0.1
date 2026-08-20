# Checkout Architecture

## 1. Checkout Lifecycle
1. Customer enters delivery address, name, phone, and optional kitchen notes.
2. Selects desired delivery time slot or urgent delivery option.
3. Chooses an active payment method auto-discovered from WooCommerce.
4. Submits order to WooCommerce Store API: `POST /wp-json/wc/store/v1/checkout`.
5. Order is saved with full line item metadata in WooCommerce.
6. Order appears in **WordPress Admin → WooCommerce → Orders**.
