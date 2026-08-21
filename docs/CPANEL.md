# cPanel Deployment Guide

## Quick Deployment Steps

1. **Build Locally**:
   ```bash
   npm install
   npm run build
   ```
2. **Open cPanel File Manager**:
   Navigate into `public_html/` (or your subdomain folder).
3. **Upload dist/ Contents**:
   Upload all files inside `dist/`:
   - `index.html`
   - `assets/`
   - `foodgo-headless-connector.zip`
4. **Upload Gateway Files**:
   Upload `admin.php`, `index.php`, and `.htaccess` into `public_html/`.
5. **Connect WordPress**:
   Open `https://yourdomain.com/admin.php` and submit your WordPress API credentials.
