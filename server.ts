import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const baseDir = __dirname;
const configDir = path.join(baseDir, 'config');
const connectionConfigFile = path.join(configDir, 'connection.json');
const publicConfigFile = path.join(configDir, 'connection-public.json');
const pluginZipPath = path.join(baseDir, 'public/foodgo-headless-connector.zip');

if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// 1. Download Plugin ZIP endpoint
app.get(['/foodgo-headless-connector.zip', '/public/foodgo-headless-connector.zip'], (_req, res) => {
  if (fs.existsSync(pluginZipPath)) {
    res.download(pluginZipPath, 'foodgo-headless-connector.zip');
  } else {
    res.status(404).send('Plugin zip not found. Run npm run package-plugin first.');
  }
});

// 2. Safe Public Connection Endpoint (Frontend auto-discovery)
app.get('/api/connection/public', (_req, res) => {
  let wpUrl = process.env.VITE_WP_URL || '';
  let connected = false;

  if (fs.existsSync(publicConfigFile)) {
    try {
      const publicData = JSON.parse(fs.readFileSync(publicConfigFile, 'utf-8'));
      if (publicData.wpUrl) wpUrl = publicData.wpUrl;
      connected = !!publicData.connected;
    } catch {
      // ignore
    }
  }

  res.json({
    wpUrl,
    connected,
    time: new Date().toISOString(),
  });
});

// Helper for testing WP endpoints
async function testEndpoint(url: string, headers: Record<string, string> = {}) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);
    return {
      connected: resp.ok,
      code: resp.status,
      details: resp.ok ? 'Reachable & active' : `HTTP ${resp.status} ${resp.statusText}`,
    };
  } catch (err: any) {
    return {
      connected: false,
      code: 0,
      details: err.message || 'Connection failed / unreachable',
    };
  }
}

// 3. Test & Save Connection API
app.post('/api/connection', async (req, res) => {
  const { wpUrl, wpUsername, wpAppPassword, action } = req.body;
  const cleanUrl = String(wpUrl || '').replace(/\/+$/, '');

  const headers: Record<string, string> = {
    'User-Agent': 'Foodgo-Connector/3.0',
    Accept: 'application/json',
  };

  if (wpUsername && wpAppPassword && !wpAppPassword.includes('••••')) {
    const auth = Buffer.from(`${wpUsername.trim()}:${wpAppPassword.trim().replace(/\s+/g, '')}`).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;
  }

  const [wpCore, wcStore, foodgoPlugin, wcCart] = await Promise.all([
    testEndpoint(`${cleanUrl}/wp-json/`, headers),
    testEndpoint(`${cleanUrl}/wp-json/wc/store/v1/products?per_page=1`, headers),
    testEndpoint(`${cleanUrl}/wp-json/foodgo/v1/config`, headers),
    testEndpoint(`${cleanUrl}/wp-json/wc/store/v1/cart`, headers),
  ]);

  const testResults = {
    wpCore: { name: 'WordPress Core REST API', endpoint: '/wp-json/', ...wpCore },
    wcStore: { name: 'WooCommerce Store API', endpoint: '/wp-json/wc/store/v1/products', ...wcStore },
    foodgoPlugin: { name: 'Foodgo Connector Plugin', endpoint: '/wp-json/foodgo/v1/config', ...foodgoPlugin },
    wooCommerce: { name: 'WooCommerce Core Engine', endpoint: '/wp-json/wc/store/v1/cart', connected: wcStore.connected || wcCart.connected, code: wcStore.code, details: wcStore.connected ? 'Active' : 'Not detected' },
  };

  if (action === 'connect') {
    const isConn = wpCore.connected && wcStore.connected;
    fs.writeFileSync(connectionConfigFile, JSON.stringify({
      wpUrl: cleanUrl,
      wpUsername,
      wpAppPassword,
      connected: isConn,
      lastTested: new Date().toLocaleString(),
    }, null, 2));

    fs.writeFileSync(publicConfigFile, JSON.stringify({
      wpUrl: cleanUrl,
      connected: isConn,
      foodgoPlugin: foodgoPlugin.connected,
    }, null, 2));
  }

  res.json({
    success: true,
    results: testResults,
  });
});

// Orders persistent store file
const ordersFile = path.join(configDir, 'orders.json');
const deliveryFile = path.join(configDir, 'delivery-settings.json');
const supportFile = path.join(configDir, 'support-messages.json');

// Initialize default delivery settings if not present
if (!fs.existsSync(deliveryFile)) {
  fs.writeFileSync(deliveryFile, JSON.stringify({
    slots: [
      { id: '1', timeLabel: '1:00 PM', fee: 0, active: true, order: 1 },
      { id: '2', timeLabel: '3:00 PM', fee: 0, active: true, order: 2 },
      { id: '3', timeLabel: '5:00 PM', fee: 0, active: true, order: 3 },
      { id: '4', timeLabel: '7:30 PM', fee: 0, active: true, order: 4 },
      { id: '5', timeLabel: '9:00 PM', fee: 0, active: true, order: 5 },
    ],
    urgentDelivery: {
      enabled: true,
      fee: 30,
      label: 'Urgent Express Delivery (15-25 mins)',
    },
  }, null, 2));
}

// 4. Delivery Settings API
app.get('/api/delivery-settings', (_req, res) => {
  try {
    if (fs.existsSync(deliveryFile)) {
      const data = JSON.parse(fs.readFileSync(deliveryFile, 'utf-8'));
      return res.json({ success: true, data });
    }
  } catch {}
  res.json({
    success: true,
    data: {
      slots: [
        { id: '1', timeLabel: '1:00 PM', fee: 0, active: true },
        { id: '2', timeLabel: '3:00 PM', fee: 0, active: true },
        { id: '3', timeLabel: '5:00 PM', fee: 0, active: true },
      ],
      urgentDelivery: { enabled: true, fee: 30, label: 'Urgent Express Delivery' },
    },
  });
});

app.post('/api/delivery-settings', (req, res) => {
  try {
    fs.writeFileSync(deliveryFile, JSON.stringify(req.body, null, 2));
    res.json({ success: true, data: req.body });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Orders API (Create & List)
app.get('/api/orders', (_req, res) => {
  try {
    if (fs.existsSync(ordersFile)) {
      const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
      return res.json({ success: true, orders });
    }
  } catch {}
  res.json({ success: true, orders: [] });
});

app.post('/api/orders', (req, res) => {
  try {
    const orderData = req.body;
    let currentOrders: any[] = [];
    if (fs.existsSync(ordersFile)) {
      try {
        currentOrders = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
      } catch {}
    }

    const orderId = 'order-' + Date.now();
    const orderNum = orderData.orderNumber || ('#FG-' + Math.floor(10000 + Math.random() * 90000));
    const newOrder = {
      id: orderId,
      orderNumber: orderNum,
      date: new Date().toLocaleString(),
      status: 'In Transit',
      paymentStatus: orderData.paymentMethod === 'upi' ? 'Pending Verification' : 'Paid',
      createdAt: new Date().toISOString(),
      ...orderData,
    };

    currentOrders.unshift(newOrder);
    fs.writeFileSync(ordersFile, JSON.stringify(currentOrders, null, 2));

    res.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      order: newOrder,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to record order' });
  }
});

// 6. Payment Methods API
app.get('/api/payment-methods', (_req, res) => {
  res.json({
    success: true,
    gateways: [
      {
        id: 'upi',
        title: 'UPI / QR Payment',
        description: 'Google Pay, PhonePe, Paytm or any UPI app',
        vpaId: process.env.VITE_MERCHANT_UPI_ID || 'foodgo@upi',
        merchantName: 'Foodgo Gourmet',
        enabled: true,
      },
      {
        id: 'cod',
        title: 'Cash on Delivery',
        description: 'Pay cash or scan driver QR at doorstep',
        extraFee: 0,
        maxOrderLimit: 500,
        enabled: true,
      },
      {
        id: 'card',
        title: 'Credit / Debit Card',
        description: 'Visa, MasterCard, RuPay cards accepted',
        enabled: true,
      },
    ],
  });
});

// 7. Coupon Validation API
app.post('/api/coupons/validate', (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const subtotal = Number(req.body.subtotal || 0);

  if (code === 'FOODGO20') {
    const discount = Number((subtotal * 0.2).toFixed(2));
    return res.json({ success: true, valid: true, code, discount, discountPercent: 20, message: '20% discount applied!' });
  }
  if (code === 'WELCOME50') {
    const discount = Math.min(50, subtotal);
    return res.json({ success: true, valid: true, code, discount, message: '₹50 flat discount applied!' });
  }
  if (code === 'FREESHIP') {
    return res.json({ success: true, valid: true, code, freeDelivery: true, discount: 0, message: 'Free express delivery applied!' });
  }
  if (code === 'CHEF10') {
    const discount = Number((subtotal * 0.1).toFixed(2));
    return res.json({ success: true, valid: true, code, discount, discountPercent: 10, message: '10% Chef special discount applied!' });
  }

  res.status(400).json({ success: false, valid: false, message: 'Invalid or expired promo code' });
});

// 8. Customer Support Chat & Audio Messages API
app.get('/api/support/messages', (_req, res) => {
  try {
    if (fs.existsSync(supportFile)) {
      const messages = JSON.parse(fs.readFileSync(supportFile, 'utf-8'));
      return res.json({ success: true, messages });
    }
  } catch {}
  res.json({ success: true, messages: [] });
});

app.post('/api/support/messages', (req, res) => {
  try {
    const msg = req.body;
    let messages: any[] = [];
    if (fs.existsSync(supportFile)) {
      try {
        messages = JSON.parse(fs.readFileSync(supportFile, 'utf-8'));
      } catch {}
    }
    const newMsg = {
      id: 'msg-' + Date.now(),
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...msg,
    };
    messages.push(newMsg);
    fs.writeFileSync(supportFile, JSON.stringify(messages, null, 2));
    res.json({ success: true, message: newMsg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to ensure or stream plugin zip
async function servePluginZip(res: express.Response) {
  const possiblePaths = [
    path.join(baseDir, 'public', 'foodgo-headless-connector.zip'),
    path.join(baseDir, 'foodgo-headless-connector.zip'),
    path.join(baseDir, 'dist', 'foodgo-headless-connector.zip'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="foodgo-headless-connector.zip"');
      res.setHeader('Cache-Control', 'no-cache');
      return res.sendFile(p);
    }
  }

  // If not found on disk, dynamically generate using archiver
  try {
    const sourceDir = path.resolve(baseDir, 'wordpress-plugin/foodgo-headless-connector');
    if (fs.existsSync(sourceDir)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="foodgo-headless-connector.zip"');
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);
      archive.directory(sourceDir, 'foodgo-headless-connector');
      await archive.finalize();
      return;
    }
  } catch (e) {
    console.error('Error generating plugin zip:', e);
  }

  res.status(404).send('Foodgo Headless Connector ZIP file not found.');
}

// Direct endpoints to download the plugin
app.get('/api/download-plugin', (_req, res) => {
  return servePluginZip(res);
});

app.get('/foodgo-headless-connector.zip', (_req, res) => {
  return servePluginZip(res);
});

// 9. Handle /admin.php when served through Express
app.get('/admin.php', (req, res) => {
  // Check if download request
  if (req.query.download_plugin !== undefined || req.query.download === '1' || req.query.action === 'download') {
    return servePluginZip(res);
  }

  const adminPhpPath = path.join(baseDir, 'admin.php');
  if (fs.existsSync(adminPhpPath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const content = fs.readFileSync(adminPhpPath, 'utf-8');
    const htmlStart = content.indexOf('<!DOCTYPE html>');
    if (htmlStart !== -1) {
      let html = content.substring(htmlStart);
      let savedUrl = process.env.VITE_WP_URL || '';
      let savedUser = '';
      if (fs.existsSync(connectionConfigFile)) {
        try {
          const cfg = JSON.parse(fs.readFileSync(connectionConfigFile, 'utf-8'));
          if (cfg.wpUrl) savedUrl = cfg.wpUrl;
          if (cfg.wpUsername) savedUser = cfg.wpUsername;
        } catch {}
      }
      html = html.replace(/<\?php echo esc_attr\(\$savedConfig\['wpUrl'\]\); \?>/g, savedUrl);
      html = html.replace(/<\?php echo esc_attr\(\$savedConfig\['wpUsername'\]\); \?>/g, savedUser);
      html = html.replace(/<\?php echo !empty\(\$savedConfig\['wpAppPassword'\]\) \? '••••••••••••••••••••••••' : 'abcd efgh ijkl mnop qrst uvwx'; \?>/g, '••••••••••••••••••••••••');
      res.send(html);
      return;
    }
  }
  res.status(404).send('admin.php not found');
});

// Handle /admin.php POST actions (Save & Connect or Test)
app.post('/admin.php', async (req, res) => {
  const action = req.body.action || 'connect';
  const wpUrl = (req.body.wp_url || '').trim().replace(/\/+$/, '');
  const wpUsername = (req.body.wp_username || '').trim();
  let wpAppPassword = (req.body.wp_app_password || '').trim();

  let existingConfig: any = {};
  if (fs.existsSync(connectionConfigFile)) {
    try {
      existingConfig = JSON.parse(fs.readFileSync(connectionConfigFile, 'utf-8'));
    } catch {}
  }

  if (wpAppPassword.includes('••••') && existingConfig.wpAppPassword) {
    wpAppPassword = existingConfig.wpAppPassword;
  }

  const updatedConfig = {
    wpUrl,
    wpUsername,
    wpAppPassword,
    lastTested: new Date().toISOString().replace('T', ' ').substring(0, 19),
    connected: !!wpUrl,
  };

  try {
    fs.writeFileSync(connectionConfigFile, JSON.stringify(updatedConfig, null, 2));
    const publicConfig = {
      wpUrl,
      connected: updatedConfig.connected,
      foodgoPlugin: true,
    };
    fs.writeFileSync(path.join(configDir, 'connection-public.json'), JSON.stringify(publicConfig, null, 2));
  } catch (e) {
    console.error('Failed to save connection config:', e);
  }

  // Redirect back to admin.php
  res.redirect('/admin.php');
});

// Serve compiled static assets
const distPath = path.resolve(__dirname, 'dist');
const publicDirPath = path.resolve(__dirname, 'public');
app.use(express.static(distPath));
app.use(express.static(publicDirPath));

// SPA fallback for frontend customer routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.endsWith('.php')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Foodgo Platform running on http://localhost:${PORT}`);
});
