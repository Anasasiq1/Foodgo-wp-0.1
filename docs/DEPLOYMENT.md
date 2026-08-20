# Deployment Guide

## 1. Static Production Build
```bash
npm run build
```
This outputs the compiled SPA assets into the `dist/` directory.

## 2. Deploy to Nginx / aaPanel / Cloudflare Pages / Vercel
Deploy the `dist/` folder with standard SPA fallback rules:

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name foodgo.yourdomain.com;
    root /www/wwwroot/foodgo.yourdomain.com/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
