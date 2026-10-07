#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'img', 'page-logo.svg');
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'og');

const PAGES = [
  { slug: 'home', title: 'StakeReloadXS', subtitle: 'Official preview card', concept: 'fallback' },
  { slug: 'products', title: 'Our Products', subtitle: 'Explore our gaming ecosystem', concept: 'casino' },
  { slug: 'order', title: 'Place Your Order', subtitle: 'Fast, streamlined checkout', concept: 'hex' },
  { slug: 'success', title: 'Order Confirmed', subtitle: 'Your request has been received', concept: 'skyline' },
  { slug: 'support', title: 'Support & Help', subtitle: 'We’re here when you need us', concept: 'speed' },
  { slug: 'team', title: 'Our Team', subtitle: 'Meet the people behind StakeReloadXS', concept: 'tech' },
  { slug: 'offers', title: 'Special Offers', subtitle: 'Exclusive deals and promotions', concept: 'velocity' }
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function textBlock(page, x, y, anchor = 'start') {
  return `
    <text x="${x}" y="${y}" text-anchor="${anchor}"
      font-size="44" font-family="Arial,Helvetica,sans-serif"
      font-weight="800" fill="#fff">${escapeXml(page.title)}</text>
    <text x="${x}" y="${y + 42}" text-anchor="${anchor}"
      font-size="22" font-family="Arial,Helvetica,sans-serif"
      fill="#ddd">${escapeXml(page.subtitle)}</text>
    <text x="${x}" y="${y + 76}" text-anchor="${anchor}"
      font-size="17" font-family="Arial,Helvetica,sans-serif"
      letter-spacing="1.6" fill="#888">stakereloadxs.com</text>
  `;
}

function chevrons(x, y, count = 3, scale = 1) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const ox = x + i * 72 * scale;
    out += `
      <polygon points="
        ${ox},${y + 55 * scale}
        ${ox + 48 * scale},${y}
        ${ox + 86 * scale},${y}
        ${ox + 38 * scale},${y + 55 * scale}
        ${ox + 86 * scale},${y + 110 * scale}
        ${ox + 48 * scale},${y + 110 * scale}"
        fill="#ef141f" opacity="${1 - i * 0.14}"/>
    `;
  }
  return out;
}

function hexGrid(startX, startY, cols, rows, size, opacity = 0.3) {
  const h = Math.sqrt(3) * size;
  let out = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = startX + c * size * 1.5 + (r % 2 ? size * 0.75 : 0);
      const cy = startY + r * h * 0.5;
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (60 * i - 30) * Math.PI / 180;
        pts.push(`${cx + size * Math.cos(a)},${cy + size * Math.sin(a)}`);
      }
      out += `<polygon points="${pts.join(' ')}" fill="#0b0b0d" stroke="#ef141f" stroke-opacity="${opacity}" stroke-width="2"/>`;
    }
  }
  return out;
}

function chip(cx, cy, r) {
  return `
    <g>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#b20c18"/>
      <circle cx="${cx}" cy="${cy}" r="${r * .82}" fill="#111"/>
      <circle cx="${cx}" cy="${cy}" r="${r * .98}" fill="none"
        stroke="#fff" stroke-width="${r * .15}" stroke-dasharray="${r * .32} ${r * .22}"/>
      <circle cx="${cx}" cy="${cy}" r="${r * .62}" fill="#181818"
        stroke="#ef141f" stroke-width="${r * .06}"/>
    </g>
  `;
}

function backgroundFor(page) {
  const defs = `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#030303"/>
        <stop offset="55%" stop-color="#09090b"/>
        <stop offset="100%" stop-color="#180006"/>
      </linearGradient>
      <linearGradient id="red" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#6d0009"/>
        <stop offset="55%" stop-color="#ef141f"/>
        <stop offset="100%" stop-color="#ff3540"/>
      </linearGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  `;

  switch (page.concept) {
    case 'casino':
      return defs + `
        <path d="M0 70 L330 0 H520 L160 630 H0Z" fill="#150006"/>
        <path d="M1200 0 H930 L760 630 H1200Z" fill="#100003"/>
        <circle cx="985" cy="245" r="160" fill="none" stroke="#ef141f" stroke-opacity=".35" stroke-width="5"/>
        ${chip(895, 405, 58)}
        ${chip(975, 350, 68)}
        ${chip(1060, 420, 86)}
        ${chip(970, 475, 62)}
        <rect x="40" y="440" width="500" height="150" rx="22" fill="#000" fill-opacity=".60"/>
      `;

    case 'hex':
      return defs + `
        ${hexGrid(25, 60, 11, 11, 38, .28)}
        ${chevrons(760, 165, 3, 1.1)}
        <rect x="38" y="438" width="545" height="150" rx="22" fill="#000" fill-opacity=".62"/>
      `;

    case 'skyline':
      return defs + `
        <circle cx="600" cy="210" r="155" fill="#ef141f" opacity=".92"/>
        <g fill="#070707" stroke="#ef141f" stroke-opacity=".75" stroke-width="2">
          <rect x="40" y="355" width="45" height="190"/><rect x="105" y="310" width="58" height="235"/>
          <rect x="190" y="345" width="42" height="200"/><rect x="255" y="260" width="70" height="285"/>
          <rect x="355" y="320" width="48" height="225"/><rect x="440" y="225" width="64" height="320"/>
          <rect x="535" y="305" width="50" height="240"/><rect x="620" y="188" width="72" height="357"/>
          <rect x="720" y="294" width="48" height="251"/><rect x="800" y="250" width="62" height="295"/>
          <rect x="890" y="315" width="52" height="230"/><rect x="970" y="278" width="64" height="267"/>
          <rect x="1065" y="330" width="48" height="215"/>
        </g>
        <rect y="545" width="1200" height="85" fill="#020202"/>
        <rect x="250" y="445" width="700" height="140" rx="24" fill="#000" fill-opacity=".58"/>
      `;

    case 'speed':
      return defs + `
        <g fill="none" stroke-linecap="round">
          <path d="M610 650 Q860 480 1220 300" stroke="#7b000b" stroke-width="110"/>
          <path d="M625 650 Q865 485 1210 310" stroke="#ef141f" stroke-width="74"/>
          <path d="M640 650 Q880 500 1200 335" stroke="#fff" stroke-width="21"/>
          <path d="M680 650 Q900 520 1200 365" stroke="#ef141f" stroke-width="6" stroke-dasharray="1 15"/>
        </g>
        ${chevrons(965, 425, 2, .72)}
        <rect x="38" y="438" width="520" height="150" rx="22" fill="#000" fill-opacity=".66"/>
      `;

    case 'tech':
      return defs + `
        ${hexGrid(55, 120, 3, 9, 38, .38)}
        ${hexGrid(1000, 120, 3, 9, 38, .38)}
        <g fill="none" stroke="#ef141f" stroke-width="8">
          <path d="M35 65 H210 L285 140 V485 L210 565 H35"/>
          <path d="M1165 65 H990 L915 140 V485 L990 565 H1165"/>
          <path d="M310 42 H890"/><path d="M310 590 H890"/>
        </g>
        <rect x="250" y="438" width="700" height="135" rx="22" fill="#000" fill-opacity=".55"/>
      `;

    case 'velocity':
      return defs + `
        <polygon points="0,0 180,0 0,250" fill="#ef141f"/>
        <polygon points="120,0 330,0 0,500" fill="#350006"/>
        <polygon points="1200,0 980,0 1200,270" fill="#ef141f"/>
        <polygon points="1200,170 1200,630 835,630" fill="#6b000b"/>
        <g stroke="#ef141f" stroke-width="5" opacity=".85">
          <line x1="0" y1="130" x2="470" y2="630"/><line x1="110" y1="0" x2="630" y2="630"/>
          <line x1="250" y1="0" x2="760" y2="630"/><line x1="1040" y1="0" x2="590" y2="630"/>
        </g>
        <rect x="38" y="438" width="565" height="150" rx="22" fill="#000" fill-opacity=".62"/>
      `;

    case 'fallback':
    default:
      return defs + `
        <g stroke="#ef141f" stroke-width="3" opacity=".26">
          <line x1="0" y1="100" x2="470" y2="630"/><line x1="120" y1="0" x2="650" y2="630"/>
          <line x1="1080" y1="0" x2="570" y2="630"/><line x1="1200" y1="120" x2="760" y2="630"/>
        </g>
        <g fill="none" stroke="#ef141f" stroke-width="7">
          <path d="M40 68 H220 L280 128"/><path d="M1160 68 H980 L920 128"/>
          <path d="M40 560 H310"/><path d="M1160 560 H890"/>
        </g>
        <rect x="310" y="438" width="580" height="135" rx="22" fill="#000" fill-opacity=".56"/>
      `;
  }
}

function layoutFor(page) {
  switch (page.concept) {
    case 'casino':
      return { logo: { left: 42, top: 48, width: 740, height: 370 }, text: { x: 64, y: 500, anchor: 'start' } };
    case 'hex':
      return { logo: { left: 46, top: 52, width: 735, height: 360 }, text: { x: 64, y: 500, anchor: 'start' } };
    case 'skyline':
      return { logo: { left: 260, top: 110, width: 680, height: 315 }, text: { x: 600, y: 510, anchor: 'middle' } };
    case 'speed':
      return { logo: { left: 45, top: 58, width: 770, height: 365 }, text: { x: 64, y: 500, anchor: 'start' } };
    case 'tech':
      return { logo: { left: 235, top: 75, width: 730, height: 345 }, text: { x: 600, y: 500, anchor: 'middle' } };
    case 'velocity':
      return { logo: { left: 52, top: 58, width: 780, height: 365 }, text: { x: 64, y: 500, anchor: 'start' } };
    default:
      return { logo: { left: 220, top: 60, width: 760, height: 365 }, text: { x: 600, y: 500, anchor: 'middle' } };
  }
}

async function logoBuffer(width, height) {
  if (!fs.existsSync(LOGO_PATH)) throw new Error(`Missing brand source: ${LOGO_PATH}`);
  return sharp(LOGO_PATH, { density: 256 })
    .resize({ width, height, fit: 'contain', position: 'centre' })
    .png()
    .toBuffer();
}

async function generateOGImage(page) {
  const layout = layoutFor(page);
  const bg = backgroundFor(page);
  const copy = textBlock(page, layout.text.x, layout.text.y, layout.text.anchor);
  const svg = Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">${bg}${copy}</svg>`);
  const logo = await logoBuffer(layout.logo.width, layout.logo.height);

  await sharp(svg)
    .composite([{ input: logo, left: layout.logo.left, top: layout.logo.top }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(OUTPUT_DIR, `${page.slug}.png`));

  console.log(`Generated ${page.slug}.png (${WIDTH}x${HEIGHT})`);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  for (const page of PAGES) await generateOGImage(page);
  console.log('All endpoint-specific OG images generated.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
