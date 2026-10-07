#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// OG Image dimensions (standard for social media)
const WIDTH = 1200;
const HEIGHT = 630;

// Brand colors
const COLORS = {
  bg: '#0a0e27',      // Dark background
  accent: '#00d4ff',  // Cyan accent
  text: '#ffffff',    // White text
  secondary: '#888888' // Gray text
};

// Pages to generate OG images for
const PAGES = [
  {
    slug: 'home',
    title: 'StakeReloadXS',
    description: 'Gaming Skill MCP Platform',
    icon: '🎮'
  },
  {
    slug: 'products',
    title: 'Our Products',
    description: 'Explore our gaming ecosystem',
    icon: '📦'
  },
  {
    slug: 'order',
    title: 'Place Your Order',
    description: 'Secure checkout experience',
    icon: '🛒'
  },
  {
    slug: 'success',
    title: 'Order Confirmed',
    description: 'Thank you for your purchase',
    icon: '✅'
  },
  {
    slug: 'support',
    title: 'Support & Help',
    description: 'We\'re here to help',
    icon: '🤝'
  },
  {
    slug: 'team',
    title: 'Our Team',
    description: 'Meet the people behind StakeReloadXS',
    icon: '👥'
  },
  {
    slug: 'offers',
    title: 'Special Offers',
    description: 'Exclusive deals just for you',
    icon: '⭐'
  }
];

async function generateOGImage(page) {
  try {
    // Create SVG with text overlay
    const svg = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.bg}"/>

        <!-- Gradient accent bar -->
        <defs>
          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${COLORS.accent};stop-opacity:0" />
            <stop offset="50%" style="stop-color:${COLORS.accent};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.accent};stop-opacity:0" />
          </linearGradient>
        </defs>
        <rect width="${WIDTH}" height="4" y="0" fill="url(#accentGrad)"/>
        <rect width="${WIDTH}" height="4" y="${HEIGHT - 4}" fill="url(#accentGrad)"/>

        <!-- Icon -->
        <text x="60" y="150" font-size="80" font-family="system-ui, -apple-system, sans-serif" fill="${COLORS.accent}">
          ${page.icon}
        </text>

        <!-- Brand name (top right) -->
        <text x="${WIDTH - 60}" y="100" font-size="28" font-family="system-ui, -apple-system, sans-serif" font-weight="600" fill="${COLORS.secondary}" text-anchor="end">
          StakeReloadXS
        </text>

        <!-- Title -->
        <text x="60" y="320" font-size="72" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" fill="${COLORS.text}">
          ${escapeXml(page.title)}
        </text>

        <!-- Description -->
        <text x="60" y="420" font-size="42" font-family="system-ui, -apple-system, sans-serif" fill="${COLORS.secondary}">
          ${escapeXml(page.description)}
        </text>

        <!-- Footer domain -->
        <text x="60" y="${HEIGHT - 40}" font-size="24" font-family="monospace" fill="${COLORS.secondary}">
          stakereloadxs.com
        </text>
      </svg>
    `;

    // Convert SVG to PNG
    const outputPath = path.join(__dirname, '..', 'assets', 'og', `${page.slug}.png`);

    await sharp(Buffer.from(svg))
      .png({ quality: 90 })
      .toFile(outputPath);

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
  console.log('🎨 Generating OG images...\n');

  for (const page of PAGES) {
    await generateOGImage(page);
  }

  console.log('\n✨ All OG images generated successfully!');
}

main();
