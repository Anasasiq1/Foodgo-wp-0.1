# Security & Hardening

1. **Zero Client-Side Secrets**:
   - WooCommerce Consumer Key & Secret are **never** bundled or exposed to the client.
   - Public operations use WooCommerce Store API with nonces and session cookies.

2. **Scoped CORS**:
   - `Access-Control-Allow-Origin` dynamically validates the configured frontend URL and whitelisted origins. Wildcard `*` with credentials is explicitly forbidden.

3. **Authentication & Data Isolation**:
   - Protected endpoints require Bearer token authorization signed by WordPress auth keys.
   - Customers can only access their own orders and profile data.
