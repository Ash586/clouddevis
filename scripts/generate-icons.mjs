/**
 * CloudDevis — App Icon Generator
 * Generates ic_launcher, ic_launcher_round, ic_launcher_foreground
 * at every Android density from a single SVG master.
 *
 * Run: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..', 'android', 'app', 'src', 'main', 'res');

// ── Brand colours ──────────────────────────────────────────────
const BG     = '#0B3D2E';   // deep forest green (matches splash)
const BG2    = '#0F4A36';   // slightly lighter centre
const WHITE  = '#FFFFFF';
const PAPER  = '#F8FAFB';   // off-white document body
const FOLD   = '#E2E8EF';   // top-right fold
const LINE   = '#DDE3EC';   // content line colour
const GOLD   = '#C8963A';   // total / accent stripe
const BADGE  = '#1D6B4A';   // badge circle fill

// ── SVG helpers ────────────────────────────────────────────────

/** Full icon SVG — background + document, canvas 1024×1024 */
function fullIconSvg() {
  return /* xml */`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="70%">
      <stop offset="0%" stop-color="${BG2}"/>
      <stop offset="100%" stop-color="${BG}"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-8%" width="130%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#000" flood-opacity="0.28"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#bg)"/>

  <!-- Subtle diamond pattern overlay -->
  <rect width="1024" height="1024" fill="${BG}" opacity="0.2"/>

  <!-- Document shadow -->
  <rect x="295" y="190" width="456" height="588" rx="36" fill="#000" opacity="0.22" transform="translate(6,14)"/>

  <!-- Document body -->
  <rect x="295" y="190" width="456" height="588" rx="36" fill="${PAPER}"/>

  <!-- Top-right corner fold triangle (light) -->
  <polygon points="623,190 751,190 751,308" fill="${FOLD}"/>
  <!-- Fold crease (slightly darker) -->
  <polygon points="623,190 751,308 623,308" fill="#CBD5E0" opacity="0.55"/>

  <!-- Header accent stripe -->
  <rect x="295" y="190" width="328" height="6" rx="3" fill="${GOLD}" opacity="0.75"/>

  <!-- ── Document content lines ── -->
  <!-- Title bar -->
  <rect x="345" y="332" width="186" height="26" rx="13" fill="${LINE}"/>

  <!-- Three content rows -->
  <rect x="345" y="386" width="268" height="16" rx="8" fill="${LINE}" opacity="0.7"/>
  <rect x="345" y="416" width="236" height="16" rx="8" fill="${LINE}" opacity="0.5"/>
  <rect x="345" y="446" width="254" height="16" rx="8" fill="${LINE}" opacity="0.5"/>

  <!-- Divider -->
  <rect x="345" y="488" width="334" height="2" rx="1" fill="${LINE}"/>

  <!-- Item rows (two columns) -->
  <rect x="345" y="506" width="190" height="14" rx="7" fill="${LINE}" opacity="0.55"/>
  <rect x="595" y="506" width="84" height="14" rx="7" fill="${LINE}" opacity="0.7"/>

  <rect x="345" y="532" width="168" height="14" rx="7" fill="${LINE}" opacity="0.45"/>
  <rect x="595" y="532" width="84" height="14" rx="7" fill="${LINE}" opacity="0.6"/>

  <rect x="345" y="558" width="176" height="14" rx="7" fill="${LINE}" opacity="0.45"/>
  <rect x="595" y="558" width="84" height="14" rx="7" fill="${LINE}" opacity="0.6"/>

  <!-- Total divider -->
  <rect x="345" y="596" width="334" height="2" rx="1" fill="${LINE}"/>

  <!-- Total row — highlighted in gold -->
  <rect x="345" y="614" width="334" height="38" rx="10" fill="${GOLD}" opacity="0.12"/>
  <rect x="345" y="614" width="148" height="38" rx="10" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.4"/>
  <rect x="506" y="614" width="173" height="38" rx="10" fill="${GOLD}" opacity="0.18"/>

  <!-- Gold total label  -->
  <rect x="362" y="628" width="108" height="12" rx="6" fill="${GOLD}" opacity="0.55"/>
  <rect x="522" y="628" width="140" height="12" rx="6" fill="${GOLD}" opacity="0.7"/>

  <!-- ── Green badge (bottom-right of document) ── -->
  <circle cx="683" cy="726" r="74" fill="${BG}" opacity="0.15"/>
  <circle cx="683" cy="726" r="66" fill="${BADGE}"/>
  <circle cx="683" cy="726" r="58" fill="${BADGE}" opacity="0.5"/>

  <!-- Checkmark -->
  <polyline
    points="654,726 674,748 714,706"
    fill="none"
    stroke="${WHITE}"
    stroke-width="13"
    stroke-linecap="round"
    stroke-linejoin="round"/>
</svg>`;
}

/** Foreground-only SVG — transparent bg, icon in safe zone (72/108 = 66.7%)
 *  Canvas 1080×1080, safe zone = central 720×720 */
function foregroundSvg() {
  // Scale all coordinates: the safe zone is 720px wide starting at x=180, y=180
  // Original icon was designed in 1024×1024. Scale = 720/1024 = 0.703
  // Offset: (1080-720)/2 = 180
  // So for coordinate (x,y) in original: newX = 180 + x*0.703
  const s = 720 / 1024;       // 0.703125
  const o = (1080 - 720) / 2; // 180

  function tx(x) { return (o + x * s).toFixed(1); }
  function ty(y) { return (o + y * s).toFixed(1); }
  function ts(v) { return (v * s).toFixed(1); }
  function tr(v) { return (v * s).toFixed(1); }

  return /* xml */`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <filter id="shd" x="-15%" y="-12%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${ts(10)}" stdDeviation="${ts(16)}" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Document shadow -->
  <rect x="${tx(301)}" y="${ty(204)}" width="${ts(456)}" height="${ts(588)}" rx="${tr(36)}"
        fill="#000" opacity="0.22" transform="translate(${ts(6)},${ts(14)})"/>

  <!-- Document body -->
  <rect x="${tx(295)}" y="${ty(190)}" width="${ts(456)}" height="${ts(588)}" rx="${tr(36)}" fill="${PAPER}"/>

  <!-- Fold -->
  <polygon points="
    ${tx(623)},${ty(190)}
    ${tx(751)},${ty(190)}
    ${tx(751)},${ty(308)}"
    fill="${FOLD}"/>
  <polygon points="
    ${tx(623)},${ty(190)}
    ${tx(751)},${ty(308)}
    ${tx(623)},${ty(308)}"
    fill="#CBD5E0" opacity="0.55"/>

  <!-- Gold header stripe -->
  <rect x="${tx(295)}" y="${ty(190)}" width="${ts(328)}" height="${ts(6)}" rx="${tr(3)}" fill="${GOLD}" opacity="0.75"/>

  <!-- Content lines -->
  <rect x="${tx(345)}" y="${ty(332)}" width="${ts(186)}" height="${ts(26)}" rx="${tr(13)}" fill="${LINE}"/>
  <rect x="${tx(345)}" y="${ty(386)}" width="${ts(268)}" height="${ts(16)}" rx="${tr(8)}" fill="${LINE}" opacity="0.7"/>
  <rect x="${tx(345)}" y="${ty(416)}" width="${ts(236)}" height="${ts(16)}" rx="${tr(8)}" fill="${LINE}" opacity="0.5"/>
  <rect x="${tx(345)}" y="${ty(446)}" width="${ts(254)}" height="${ts(16)}" rx="${tr(8)}" fill="${LINE}" opacity="0.5"/>

  <!-- Divider -->
  <rect x="${tx(345)}" y="${ty(488)}" width="${ts(334)}" height="${ts(2)}" rx="${tr(1)}" fill="${LINE}"/>

  <!-- Item rows -->
  <rect x="${tx(345)}" y="${ty(506)}" width="${ts(190)}" height="${ts(14)}" rx="${tr(7)}" fill="${LINE}" opacity="0.55"/>
  <rect x="${tx(595)}" y="${ty(506)}" width="${ts(84)}" height="${ts(14)}" rx="${tr(7)}" fill="${LINE}" opacity="0.7"/>
  <rect x="${tx(345)}" y="${ty(532)}" width="${ts(168)}" height="${ts(14)}" rx="${tr(7)}" fill="${LINE}" opacity="0.45"/>
  <rect x="${tx(595)}" y="${ty(532)}" width="${ts(84)}" height="${ts(14)}" rx="${tr(7)}" fill="${LINE}" opacity="0.6"/>
  <rect x="${tx(345)}" y="${ty(558)}" width="${ts(176)}" height="${ts(14)}" rx="${tr(7)}" fill="${LINE}" opacity="0.45"/>
  <rect x="${tx(595)}" y="${ty(558)}" width="${ts(84)}" height="${ts(14)}" rx="${tr(7)}" fill="${LINE}" opacity="0.6"/>

  <!-- Total divider -->
  <rect x="${tx(345)}" y="${ty(596)}" width="${ts(334)}" height="${ts(2)}" rx="${tr(1)}" fill="${LINE}"/>

  <!-- Total row -->
  <rect x="${tx(345)}" y="${ty(614)}" width="${ts(334)}" height="${ts(38)}" rx="${tr(10)}" fill="${GOLD}" opacity="0.12"/>
  <rect x="${tx(506)}" y="${ty(614)}" width="${ts(173)}" height="${ts(38)}" rx="${tr(10)}" fill="${GOLD}" opacity="0.18"/>
  <rect x="${tx(362)}" y="${ty(628)}" width="${ts(108)}" height="${ts(12)}" rx="${tr(6)}" fill="${GOLD}" opacity="0.55"/>
  <rect x="${tx(522)}" y="${ty(628)}" width="${ts(140)}" height="${ts(12)}" rx="${tr(6)}" fill="${GOLD}" opacity="0.7"/>

  <!-- Badge -->
  <circle cx="${tx(683)}" cy="${ty(726)}" r="${tr(66)}" fill="${BADGE}"/>
  <polyline
    points="${tx(654)},${ty(726)} ${tx(674)},${ty(748)} ${tx(714)},${ty(706)}"
    fill="none"
    stroke="${WHITE}"
    stroke-width="${ts(13)}"
    stroke-linecap="round"
    stroke-linejoin="round"/>
</svg>`;
}

// ── Density configs ─────────────────────────────────────────────

const DENSITIES = [
  { folder: 'mipmap-mdpi',    legacy: 48,  foreground: 108 },
  { folder: 'mipmap-hdpi',    legacy: 72,  foreground: 162 },
  { folder: 'mipmap-xhdpi',   legacy: 96,  foreground: 216 },
  { folder: 'mipmap-xxhdpi',  legacy: 144, foreground: 324 },
  { folder: 'mipmap-xxxhdpi', legacy: 192, foreground: 432 },
];

// ── Round mask generator (circle crop) ────────────────────────

function circleMaskSvg(size) {
  const r = size / 2;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
       <circle cx="${r}" cy="${r}" r="${r}" fill="white"/>
     </svg>`
  );
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  const fullSvgBuf = Buffer.from(fullIconSvg());
  const fgSvgBuf   = Buffer.from(foregroundSvg());

  let generated = 0;

  for (const { folder, legacy, foreground } of DENSITIES) {
    const dir = join(ROOT, folder);

    // 1. ic_launcher.png — legacy full icon (square)
    await sharp(fullSvgBuf)
      .resize(legacy, legacy)
      .png({ compressionLevel: 9, palette: false })
      .toFile(join(dir, 'ic_launcher.png'));
    console.log(`✓ ${folder}/ic_launcher.png  (${legacy}px)`);

    // 2. ic_launcher_round.png — legacy round icon (circle-masked)
    const roundPng = await sharp(fullSvgBuf)
      .resize(legacy, legacy)
      .png()
      .toBuffer();

    await sharp(roundPng)
      .composite([{
        input: circleMaskSvg(legacy),
        blend: 'dest-in',
      }])
      .png({ compressionLevel: 9 })
      .toFile(join(dir, 'ic_launcher_round.png'));
    console.log(`✓ ${folder}/ic_launcher_round.png  (${legacy}px)`);

    // 3. ic_launcher_foreground.png — adaptive foreground (transparent bg)
    await sharp(fgSvgBuf)
      .resize(foreground, foreground)
      .png({ compressionLevel: 9 })
      .toFile(join(dir, 'ic_launcher_foreground.png'));
    console.log(`✓ ${folder}/ic_launcher_foreground.png  (${foreground}px)`);

    generated += 3;
  }

  console.log(`\n✅ ${generated} files generated.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
