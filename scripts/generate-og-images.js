#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// OG Image dimensions (standard for social media)
const WIDTH = 1200;
const HEIGHT = 630;

// Pages to generate OG images for
const PAGES = [
  { slug: 'home', title: 'StakeReloadXS' },
  { slug: 'products', title: 'Our Products' },
  { slug: 'order', title: 'Place Your Order' },
  { slug: 'success', title: 'Order Confirmed' },
  { slug: 'support', title: 'Support & Help' },
  { slug: 'team', title: 'Our Team' },
  { slug: 'offers', title: 'Special Offers' }
];

async function generateOGImage(page) {
  try {
    const logoPath = path.join(__dirname, '..', 'assets', 'img', 'page-logo.svg');

    // Load and resize the SVG logo to fit the OG canvas
    const logoBuffer = await sharp(logoPath, { density: 192 })
      .resize(WIDTH, HEIGHT, {
        fit: 'cover',
        position: 'centre'
      })
      .png()
      .toBuffer();

    // Create an overlay SVG with page title and domain at the bottom
    const overlayHeight = 150;
    const overlay = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <!-- Semi-transparent dark scrim at bottom -->
        <defs>
          <linearGradient id="scrimGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#000000;stop-opacity:0" />
            <stop offset="50%" style="stop-color:#000000;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0.5" />
          </linearGradient>
        </defs>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#scrimGradient)" />

        <!-- Page title -->
        <text x="60" y="${HEIGHT - 70}" font-size="48" font-family="system-ui, -apple-system, sans-serif" font-weight="600" fill="#ffffff">
          ${escapeXml(page.title)}
        </text>

        <!-- Domain -->
        <text x="60" y="${HEIGHT - 30}" font-size="24" font-family="monospace" fill="#888888">
          stakereloadxs.com
        </text>
      </svg>
    `;

    // Composite the overlay onto the logo
    const overlayBuffer = Buffer.from(overlay);
    const composited = await sharp(logoBuffer)
      .composite([{ input: overlayBuffer, blend: 'over' }])
      .png()
      .toBuffer();

    // Save the final image
    const outputPath = path.join(__dirname, '..', 'assets', 'og', `${page.slug}.png`);
    await fs.promises.writeFile(outputPath, composited);

    console.log(`✅ Generated: ${page.slug}.png`);
  } catch (error) {
    console.error(`❌ Error generating ${page.slug}.png:`, error.message);
  }
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  console.log('🎨 Generating OG images from page-logo.svg...\n');

  for (const page of PAGES) {
    await generateOGImage(page);
  }

  console.log('\n✨ All OG images generated successfully!');
}

main();
