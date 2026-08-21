# Foodgo Local Development Guide

## Overview
Foodgo is built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**. It communicates directly with WooCommerce via the Store API (`/wp-json/wc/store/v1`) and the Foodgo Connector Plugin (`/wp-json/foodgo/v1`).

---

## Local Development Workflow

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local Environment
Create or copy `.env.example` to `.env`:
```env
VITE_WP_URL=https://your-wordpress-site.com
```

### 3. Start Development Server
```bash
npm run dev
```
The application will boot at `http://localhost:3000`.

### 4. Available Scripts
- `npm run dev`: Boots the local Vite dev server with host `0.0.0.0` and port `3000`.
- `npm run build`: Packages the WordPress connector plugin into `public/foodgo-headless-connector.zip` and builds static assets into `dist/`.
- `npm run lint`: Runs TypeScript type checking (`tsc --noEmit`).
- `npm run package-plugin`: Builds the WordPress plugin ZIP package.
- `npm run preview`: Previews the compiled `dist/` production build locally.
