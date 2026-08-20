# WordPress Connection Guide

This guide explains how to connect your Foodgo frontend with WordPress and WooCommerce via `admin.php`.

---

## Connection Flow (Step-by-Step)

### Step 1: Prepare WordPress & WooCommerce
1. Install **WordPress 6.0+** and **WooCommerce 8.0+** on your web server.
2. In WordPress Admin, ensure permalinks are set to **Post name** under **Settings → Permalinks**.

### Step 2: Install Foodgo Headless Connector
1. Download `foodgo-headless-connector.zip` from `https://domain.com/admin.php` or `wordpress-plugin/`.
2. In WordPress Admin, go to **Plugins → Add New → Upload Plugin**.
3. Select `foodgo-headless-connector.zip`, click **Install Now**, then **Activate**.

### Step 3: Create a WordPress Application Password
1. In WordPress Admin, navigate to **Users → Profile** (or edit your admin user).
2. Scroll down to **Application Passwords**.
3. Under **New Application Password Name**, type: `Foodgo Connector`.
4. Click **Add New Application Password**.
5. Copy the generated 24-character password (e.g. `abcd efgh ijkl mnop qrst uvwx`).
   > 🔒 **Security Notice:** Do NOT use your primary WordPress login password. Application Passwords are safer and can be revoked at any time.

### Step 4: Configure Connection in `admin.php`
1. Open `https://domain.com/admin.php` in your browser.
2. Fill in the connection form:
   - **WordPress Website URL**: `https://wordpress.yourdomain.com`
   - **WordPress Username**: `admin`
   - **WordPress Application Password**: Paste the generated application password.
3. Click **CONNECT WORDPRESS**.

### Step 5: Verify Connection Status
The diagnostics panel will verify:
- ● **WordPress Core REST API**: Connected
- ● **WooCommerce Core Engine**: Connected
- ● **WooCommerce Store API**: Connected
- ● **Foodgo Connector Plugin**: Connected

### Step 6: Launch Storefront
Open `https://domain.com/`. Your products, categories, active payment methods, and live stock from WooCommerce will appear automatically.
