import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, type Plugin } from 'vite';

function foodgoAdminPlugin(): Plugin {
  return {
    name: 'foodgo-admin-handler',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const parsedUrl = new URL(url, 'http://localhost:3000');
        const pathname = parsedUrl.pathname;
        const searchParams = parsedUrl.searchParams;

        // Check if plugin download is requested
        if (
          pathname === '/foodgo-headless-connector.zip' ||
          pathname === '/public/foodgo-headless-connector.zip' ||
          pathname === '/api/download-plugin' ||
          (pathname === '/admin.php' && (searchParams.has('download_plugin') || searchParams.has('download')))
        ) {
          const zipPaths = [
            path.resolve(__dirname, 'public/foodgo-headless-connector.zip'),
            path.resolve(__dirname, 'foodgo-headless-connector.zip'),
            path.resolve(__dirname, 'dist/foodgo-headless-connector.zip'),
          ];

          for (const zipFile of zipPaths) {
            if (fs.existsSync(zipFile)) {
              const stat = fs.statSync(zipFile);
              res.writeHead(200, {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="foodgo-headless-connector.zip"',
                'Content-Length': stat.size,
                'Cache-Control': 'no-cache',
              });
              const stream = fs.createReadStream(zipFile);
              stream.pipe(res);
              return;
            }
          }
        }

        // Render admin.php nicely if accessed in dev server
        if (pathname === '/admin.php') {
          const adminPath = path.resolve(__dirname, 'admin.php');
          if (fs.existsSync(adminPath)) {
            let content = fs.readFileSync(adminPath, 'utf-8');
            const htmlStart = content.indexOf('<!DOCTYPE html>');
            if (htmlStart !== -1) {
              let html = content.substring(htmlStart);
              let savedUrl = process.env.VITE_WP_URL || '';
              let savedUser = '';
              const connectionFile = path.resolve(__dirname, 'config/connection.json');
              if (fs.existsSync(connectionFile)) {
                try {
                  const cfg = JSON.parse(fs.readFileSync(connectionFile, 'utf-8'));
                  if (cfg.wpUrl) savedUrl = cfg.wpUrl;
                  if (cfg.wpUsername) savedUser = cfg.wpUsername;
                } catch {}
              }
              html = html.replace(/<\?php echo esc_attr\(\$savedConfig\['wpUrl'\]\); \?>/g, savedUrl);
              html = html.replace(/<\?php echo esc_attr\(\$savedConfig\['wpUsername'\]\); \?>/g, savedUser);
              html = html.replace(/<\?php echo !empty\(\$savedConfig\['wpAppPassword'\]\) \? '••••••••••••••••••••••••' : 'abcd efgh ijkl mnop qrst uvwx'; \?>/g, '••••••••••••••••••••••••');
              
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end(html);
              return;
            }
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), foodgoAdminPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
      },
    },
    server: {
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
