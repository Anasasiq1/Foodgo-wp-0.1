# 🔌 WordPress & WooCommerce Integration Guide

Foodgo acts as a lightning-fast, mobile-first headless interface on top of standard WordPress and WooCommerce.

---

## 📦 1. Connector Plugin Installation

The **Foodgo Headless Connector** plugin bridges WooCommerce REST APIs, Store API sessions, CORS authentication, and kitchen customization attributes.

### Download / Location:
- **Source Code**: Located in `wordpress-plugin/foodgo-headless-connector/`
- **Ready-to-Install ZIP**: Available directly at `foodgo-headless-connector.zip` on your domain or via the repository build script:
  ```bash
  npm run build:plugin
  ```

### Installation Steps in WordPress:
1. Log in to your WordPress Admin (`https://your-wp-site.com/wp-admin`).
2. Go to **Plugins** ➔ **Add New Plugin** ➔ **Upload Plugin**.
3. Choose `foodgo-headless-connector.zip` and click **Install Now**.
4. Click **Activate Plugin**.

---

## 🔑 2. Generating WooCommerce REST API Keys

1. In WordPress Admin, navigate to **WooCommerce** ➔ **Settings** ➔ **Advanced** tab ➔ **REST API**.
2. Click **Add Key** (or **Create an API key**).
3. Set the fields:
   - **Description**: `Foodgo Headless Storefront`
   - **User**: Select an Administrator account
   - **Permissions**: `Read/Write`
4. Click **Generate API Key**.
5. Copy the **Consumer Key (`ck_...`)** and **Consumer Secret (`cs_...`)** immediately.

---

## 🍽️ 3. Menu & Product Configuration

Foodgo automatically reads and transforms your WooCommerce product catalog:

### Product Attributes Supported:
- **Portions & Weights**: Single, Full, Half, Quarter, Family Pack, Large, Medium.
- **Spiciness Levels**: Mild, Medium, Hot, Extra Hot.
- **Salna & Gravy Addons**: Free portion, extra gravy, spoon count.
- **Cooking Notes / Kitchen Instructions**: Passed directly into WooCommerce Order Item metadata.

### Categories:
Create standard WooCommerce Product Categories (e.g. *Burgers*, *Biryani*, *Beverages*, *Snacks*, *Combos*). The frontend automatically generates dynamic category filter chips.

---

## 🛒 4. Orders & Fulfillment Workflow

When a customer completes an order in Foodgo:
1. An order is created in WooCommerce via `/wp-json/wc/v3/orders`.
2. Order status starts as `processing` (or `pending` for unpaid orders).
3. Payment details (UPI UTR / Transaction ID, Method: UPI / Card / COD) are saved in order notes and custom metadata.
4. You manage preparation and delivery status directly inside **WooCommerce ➔ Orders**.
