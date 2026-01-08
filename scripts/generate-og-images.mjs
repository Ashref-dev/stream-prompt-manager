import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const svgPath = path.resolve(process.cwd(), 'public', 'og-image.svg');
const pngPath = path.resolve(process.cwd(), 'public', 'og-image.png');
const webpPath = path.resolve(process.cwd(), 'public', 'og-image.webp');

async function main() {
  try {
    const svg = await fs.readFile(svgPath);
    // Use higher density for crisp text rendering from SVG
    const image = sharp(svg, { density: 300 });

    await image
      .resize(1200, 630, { fit: 'cover' })
      .png({ quality: 90 })
      .toFile(pngPath);

    await image
      .resize(1200, 630, { fit: 'cover' })
      .webp({ quality: 90 })
      .toFile(webpPath);

    console.log('OG images generated:', pngPath, webpPath);
  } catch (err) {
    console.error('Failed to generate OG images:', err);
    process.exit(1);
  }
}

main();
