#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'img', 'page-logo.svg');
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'og');

const PAGES = [
  { slug: 'home', title: 'StakeReloadXS', subtitle: 'Xtremely simple reloads' },
  { slug: 'products', title: 'Our Products', subtitle: 'Explore the StakeReloadXS ecosystem' },
  { slug: 'order', title: 'Place Your Order', subtitle: 'Fast, streamlined ordering' },
  { slug: 'success', title: 'Order Confirmed', subtitle: 'Your request has been received' },
  { slug: 'support', title: 'Support & Help', subtitle: 'Help when you need it' },
  { slug: 'team', title: 'Our Team', subtitle: 'The people behind StakeReloadXS' },
  { slug: 'offers', title: 'Special Offers', subtitle: 'Current StakeReloadXS promotions' }
];

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function buildAssets() {
  if (!fs.existsSync(LOGO_PATH)) {
    throw new Error(`Missing canonical brand artwork: ${LOGO_PATH}`);
  }

  const background = await sharp(LOGO_PATH, { density: 192 })
    .resize({
      width: WIDTH,
      height: HEIGHT,
      fit: 'cover',
      position: 'centre'
    })
    .blur(24)
    .modulate({ brightness: 0.42, saturation: 0.82 })
    .png()
    .toBuffer();

  const hero = await sharp(LOGO_PATH, { density: 192 })
    .resize({
      width: 560,
      height: 430,
      fit: 'contain',
      position: 'centre',
      withoutEnlargement: false
    })
    .png()
    .toBuffer();

  return { background, hero };
}

function buildChrome(page) {
  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wash" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#050505" stop-opacity=".78"/>
          <stop offset="50%" stop-color="#050505" stop-opacity=".42"/>
          <stop offset="100%" stop-color="#050505" stop-opacity=".68"/>
        </linearGradient>

        <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0b0b0d" stop-opacity=".90"/>
          <stop offset="100%" stop-color="#18181b" stop-opacity=".72"/>
        </linearGradient>

        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ef233c"/>
          <stop offset="100%" stop-color="#8d0b18"/>
        </linearGradient>

        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#000" flood-opacity=".45"/>
        </filter>
      </defs>

      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wash)"/>

      <rect
        x="52"
        y="52"
        width="520"
        height="526"
        rx="32"
        fill="url(#panel)"
        stroke="#ffffff"
        stroke-opacity=".10"
        filter="url(#shadow)"
      />

      <rect x="84" y="92" width="82" height="5" rx="2.5" fill="url(#accent)"/>

      <text
        x="84"
        y="146"
        font-size="20"
        font-family="Arial, Helvetica, sans-serif"
        font-weight="700"
        letter-spacing="3.2"
        fill="#c9c9cf"
      >STAKERELOADXS.COM</text>

      <text
        x="84"
        y="286"
        font-size="58"
        font-family="Arial, Helvetica, sans-serif"
        font-weight="800"
        fill="#ffffff"
      >${escapeXml(page.title)}</text>

      <text
        x="84"
        y="344"
        font-size="26"
        font-family="Arial, Helvetica, sans-serif"
        font-weight="400"
        fill="#c9c9cf"
      >${escapeXml(page.subtitle)}</text>

      <line
        x1="84"
        y1="402"
        x2="522"
        y2="402"
        stroke="#ffffff"
        stroke-opacity=".10"
      />

      <text
        x="84"
        y="458"
        font-size="18"
        font-family="Arial, Helvetica, sans-serif"
        font-weight="700"
        letter-spacing="2.4"
        fill="#ef233c"
      >STAKE RELOAD XS</text>

      <text
        x="84"
        y="500"
        font-size="20"
        font-family="Arial, Helvetica, sans-serif"
        fill="#9d9da4"
      >Official social preview</text>

      <rect
        x="610"
        y="76"
        width="538"
        height="478"
        rx="36"
        fill="#070708"
        fill-opacity=".42"
        stroke="#ffffff"
        stroke-opacity=".10"
      />

      <rect x="610" y="76" width="6" height="478" rx="3" fill="url(#accent)"/>
    </svg>
  `);
}

async function generateOGImage(page, assets) {
  const outputPath = path.join(OUTPUT_DIR, `${page.slug}.png`);

  await sharp(assets.background)
    .composite([
      { input: buildChrome(page), top: 0, left: 0, blend: 'over' },
      { input: assets.hero, top: 100, left: 604, blend: 'over' }
    ])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);

  console.log(`Generated: ${page.slug}.png (${WIDTH}x${HEIGHT})`);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Generating professional Open Graph cards from assets/img/page-logo.svg...');
  const assets = await buildAssets();

  for (const page of PAGES) {
    await generateOGImage(page, assets);
  }

  console.log('All Open Graph images generated successfully.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
