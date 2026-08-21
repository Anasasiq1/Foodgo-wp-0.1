# Production Deployment Guide

## Core Architectural Principle: 100% Static Deployment

The customer-facing Foodgo storefront is a pure client-side Single Page Application (SPA).
- **NO Node.js / Express** is required on your shared hosting or production web server.
- **NO PM2 process manager** is required for the storefront.
- **NO terminal or SSH access** is mandatory.

---

## Production Deployment Checklist

### Step 1: Run Local Build
```bash
npm install
npm run build
```
This produces the self-contained `dist/` directory.

### Step 2: Understand File Structure
Inside `dist/`:
```text
dist/
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
├── foodgo-headless-connector.zip
└── index.html
```

### Step 3: Direct Upload to Document Root
Using **aaPanel File Manager**, **cPanel File Manager**, or **FTP/SFTP**, copy the **contents of `dist/`** into your website document root:
- Copy `dist/index.html` → `/www/wwwroot/domain.com/index.html` or `public_html/index.html`
- Copy `dist/assets/` → `/www/wwwroot/domain.com/assets/` or `public_html/assets/`
- Copy `dist/foodgo-headless-connector.zip` → `/www/wwwroot/domain.com/foodgo-headless-connector.zip`
- Also upload `admin.php`, `index.php`, and `.htaccess` to the document root.

### Step 4: Web Server URL Rewriting
For Apache or LiteSpeed, the included `.htaccess` file handles fallback to `index.html` for SPA routing.
For Nginx (aaPanel), configure:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
location ~ \.php$ {
    include enable-php-81.conf;
}
```

### Step 5: Connect WordPress
Visit `https://your-domain.com/admin.php` and submit your WordPress API URL, Username, and Application Password to complete setup.
