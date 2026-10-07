#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const WIDTH = 1200;
const HEIGHT = 630;
const SCRIM_HEIGHT = 190;
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'img', 'page-logo.svg');
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'og');

const PAGES = [
  { slug: 'home', title: 'StakeReloadXS' },
  { slug: 'products', title: 'Our Products' },
  { slug: 'order', title: 'Place Your Order' },
  { slug: 'success', title: 'Order Confirmed' },
  { slug: 'support', title: 'Support & Help' },
  { slug: 'team', title: 'Our Team' },
  { slug: 'offers', title: 'Special Offers' }
];

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function buildBrandBase() {
  if (!fs.existsSync(LOGO_PATH)) {
    throw new Error(`Missing canonical brand artwork: ${LOGO_PATH}`);
  }

  return sharp(LOGO_PATH, { density: 192 })
    .resize({
      width: WIDTH,
      height: HEIGHT,
      fit: 'cover',
      position: 'centre'
    })
    .png()
    .toBuffer();
}

function buildOverlay(page) {
  const scrimTop = HEIGHT - SCRIM_HEIGHT;

  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000" stop-opacity="0"/>
          <stop offset="38%" stop-color="#000" stop-opacity=".20"/>
          <stop offset="100%" stop-color="#000" stop-opacity=".58"/>
        </linearGradient>
      </defs>

      <rect
        x="0"
        y="${scrimTop}"
        width="${WIDTH}"
        height="${SCRIM_HEIGHT}"
        fill="url(#scrim)"
      />

      <text
        x="64"
        y="${HEIGHT - 76}"
        font-size="48"
        font-family="Arial, Helvetica, sans-serif"
        font-weight="700"
        fill="#ffffff"
      >${escapeXml(page.title)}</text>

      <text
        x="64"
        y="${HEIGHT - 34}"
        font-size="23"
        font-family="Arial, Helvetica, sans-serif"
        font-weight="600"
        letter-spacing="2"
        fill="#d7d7d7"
      >STAKERELOADXS.COM</text>
    </svg>
  `);
}

async function generateOGImage(page, brandBase) {
  const outputPath = path.join(OUTPUT_DIR, `${page.slug}.png`);

  await sharp(brandBase)
    .composite([{ input: buildOverlay(page), blend: 'over' }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);

  console.log(`Generated: ${page.slug}.png (${WIDTH}x${HEIGHT})`);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Generating Open Graph images from assets/img/page-logo.svg...');
  const brandBase = await buildBrandBase();

  for (const page of PAGES) {
    await generateOGImage(page, brandBase);
  }

  console.log('All Open Graph images generated successfully.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
