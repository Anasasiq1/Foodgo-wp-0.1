import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createPluginZip } from './build-plugin-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

async function runProductionBuild() {
  console.log('====================================================');
  console.log('🔨 FOODGO PRODUCTION BUILD & PACKAGING PIPELINE');
  console.log('====================================================\n');

  // Step 1: Package WordPress Plugin
  console.log('📦 Step 1: Packaging WordPress Connector Plugin...');
  const zipPath = await createPluginZip();
  console.log(`✅ Plugin ZIP built: ${zipPath}\n`);

  // Step 2: Run Vite Static Build
  console.log('⚡ Step 2: Compiling React SPA with Vite...');
  execSync('npx vite build', { stdio: 'inherit', cwd: rootDir });
  console.log('✅ Vite compilation completed.\n');

  // Step 3: Copy Production Gateway & Server-side Files into dist/
  console.log('📋 Step 3: Copying production deployment gateways to dist/...');
  
  // 3a. admin.php
  const adminSrc = path.join(rootDir, 'admin.php');
  const adminDest = path.join(distDir, 'admin.php');
  if (fs.existsSync(adminSrc)) {
    fs.copyFileSync(adminSrc, adminDest);
    console.log('  → Copied: dist/admin.php');
  } else {
    throw new Error('admin.php is missing from repository root!');
  }

  // 3b. .htaccess
  const htaccessSrc = path.join(rootDir, '.htaccess');
  const htaccessDest = path.join(distDir, '.htaccess');
  if (fs.existsSync(htaccessSrc)) {
    fs.copyFileSync(htaccessSrc, htaccessDest);
    console.log('  → Copied: dist/.htaccess');
  }

  // 3c. foodgo-headless-connector.zip
  const publicZip = path.join(rootDir, 'public/foodgo-headless-connector.zip');
  const distZip = path.join(distDir, 'foodgo-headless-connector.zip');
  if (fs.existsSync(publicZip)) {
    fs.copyFileSync(publicZip, distZip);
    console.log('  → Copied: dist/foodgo-headless-connector.zip');
  }

  // 3d. Create config directory with security .htaccess inside dist
  const distConfigDir = path.join(distDir, 'config');
  if (!fs.existsSync(distConfigDir)) {
    fs.mkdirSync(distConfigDir, { recursive: true });
  }
  const configHtaccess = `# Protect sensitive configuration\n<Files "connection.json">\n    <IfModule mod_authz_core.c>\n        Require all denied\n    </IfModule>\n    <IfModule !mod_authz_core.c>\n        Deny from all\n    </IfModule>\n</Files>\n`;
  fs.writeFileSync(path.join(distConfigDir, '.htaccess'), configHtaccess, 'utf-8');
  console.log('  → Created: dist/config/.htaccess (Secured configuration storage)');

  // Step 4: Strict Production Verification
  console.log('\n🔍 Step 4: Performing automated production package validation...');
  const requiredFiles = [
    { path: path.join(distDir, 'index.html'), name: 'dist/index.html (Customer Frontend SPA Entry Point)', minSize: 100 },
    { path: path.join(distDir, 'admin.php'), name: 'dist/admin.php (WordPress Connection Gateway)', minSize: 1000 },
    { path: path.join(distDir, '.htaccess'), name: 'dist/.htaccess (SPA & Security Server Rules)', minSize: 50 },
    { path: path.join(distDir, 'foodgo-headless-connector.zip'), name: 'dist/foodgo-headless-connector.zip (WordPress Plugin)', minSize: 5000 },
  ];

  for (const item of requiredFiles) {
    if (!fs.existsSync(item.path)) {
      throw new Error(`CRITICAL BUILD FAILURE: Required production file [${item.name}] is missing from dist!`);
    }
    const stat = fs.statSync(item.path);
    if (stat.size < item.minSize) {
      throw new Error(`CRITICAL BUILD FAILURE: File [${item.name}] is undersized (${stat.size} bytes < ${item.minSize} required)!`);
    }
    console.log(`  ✓ Verified: ${item.name} (${(stat.size / 1024).toFixed(1)} KB)`);
  }

  // Verify assets
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    throw new Error('CRITICAL BUILD FAILURE: dist/assets directory was not created by Vite!');
  }
  const assetFiles = fs.readdirSync(assetsDir);
  const hasJs = assetFiles.some((f) => f.endsWith('.js'));
  const hasCss = assetFiles.some((f) => f.endsWith('.css'));

  if (!hasJs || !hasCss) {
    throw new Error(`CRITICAL BUILD FAILURE: dist/assets must contain both JS and CSS bundles (found: ${assetFiles.join(', ')})`);
  }
  console.log(`  ✓ Verified: dist/assets/ (${assetFiles.length} bundled files including JS & CSS)`);

  console.log('\n====================================================');
  console.log('🎉 PRODUCTION PACKAGE COMPLETE & VERIFIED!');
  console.log('====================================================');
  console.log('📁 Deployment Directory: dist/');
  console.log('📋 Deployment Instructions:');
  console.log('  1. Upload the CONTENTS of dist/ to your website document root:');
  console.log('     • cPanel: public_html/');
  console.log('     • aaPanel: /www/wwwroot/your-domain.com/');
  console.log('  2. Open https://your-domain.com/ (Customer Storefront)');
  console.log('  3. Open https://your-domain.com/admin.php (Connect to WordPress)');
  console.log('  4. No Node.js process, PM2, or SSH required on web hosting!');
  console.log('====================================================\n');
}

runProductionBuild().catch((err) => {
  console.error('\n❌ BUILD FAILED:', err.message);
  process.exit(1);
});
