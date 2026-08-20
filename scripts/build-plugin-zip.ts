import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createPluginZip(): Promise<string> {
  const sourceDir = path.resolve(__dirname, '../wordpress-plugin/foodgo-headless-connector');
  const publicDir = path.resolve(__dirname, '../public');
  const distDir = path.resolve(__dirname, '../dist');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const publicZipPath = path.join(publicDir, 'foodgo-headless-connector.zip');
  const distZipPath = path.join(distDir, 'foodgo-headless-connector.zip');

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(publicZipPath);
    const archive = new archiver.ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => {
      try {
        fs.copyFileSync(publicZipPath, distZipPath);
      } catch {
        // ignore if dist not ready
      }
      console.log(`[Plugin Builder] Created ${publicZipPath} (${archive.pointer()} total bytes)`);
      resolve(publicZipPath);
    });

    archive.on('error', (err: any) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceDir, 'foodgo-headless-connector');
    archive.finalize();
  });
}

createPluginZip()
  .then((filePath) => console.log(`WordPress Plugin packaged successfully at: ${filePath}`))
  .catch((err) => {
    console.error('Failed to package WordPress plugin:', err);
    process.exit(1);
  });
