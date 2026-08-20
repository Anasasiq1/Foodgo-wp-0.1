# Plugin Installation Guide

## Foodgo Headless Connector

The **Foodgo Headless Connector** is a lightweight, zero-configuration WordPress bridge plugin that powers the decoupled Foodgo React storefront.

### Installation Steps

1. **Upload Plugin**:
   - Option A: Upload the `foodgo-headless-connector` folder to `/wp-content/plugins/`.
   - Option B: Zip the `foodgo-headless-connector` folder and upload via **WordPress Admin → Plugins → Add New → Upload Plugin**.

2. **Activate Plugin**:
   - In WordPress Admin, click **Activate** under **Foodgo Headless Connector**.

3. **Verify Endpoints**:
   - Open `https://your-wp-domain.com/wp-json/foodgo/v1/config` in your browser.
   - You should receive a JSON response containing site configuration, currency, features, and active payment gateways.

4. **CORS & Origin Setup**:
   - Go to **Settings → Foodgo Connector**.
   - Input your React storefront domain into **Frontend Website URL** to allow safe cross-origin requests.
