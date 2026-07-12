#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Rakmana — Capacitor Dev/Prod switcher
//
// Usage:
//   node scripts/cap-dev.mjs dev    → pointe vers http://LOCAL_IP:3000/app
//   node scripts/cap-dev.mjs prod   → pointe vers https://clouddevis.vercel.app/app
//
// Called via:
//   npm run mobile:dev-device   (= node scripts/cap-dev.mjs dev && cap sync)
//   npm run mobile:prod         (= node scripts/cap-dev.mjs prod && cap sync)
// ─────────────────────────────────────────────────────────────

import { networkInterfaces } from 'os';
import { writeFileSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const CONFIG_PATH = join(ROOT, 'capacitor.config.ts');

const PROD_URL = 'https://clouddevis.vercel.app/app';
const PORT = process.env.PORT ?? 3000;

// ── Detect local IP ──────────────────────────────────────────
function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  throw new Error('Impossible de détecter l\'adresse IP locale. Connectez-vous au Wi-Fi.');
}

// ── Write capacitor.config.ts ─────────────────────────────────
function writeConfig(serverUrl) {
  const content = `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clouddevis.app',
  appName: 'CloudDevis',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: '${serverUrl}',
    cleartext: ${serverUrl.startsWith('http://') ? 'true' : 'false'},
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
      backgroundColor: '#F3F6FC',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#F3F6FC',
    },
    Preferences: {
      group: 'clouddevis',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
`;
  writeFileSync(CONFIG_PATH, content, 'utf8');
}

// ── Main ─────────────────────────────────────────────────────
const mode = process.argv[2] ?? 'prod';

if (mode === 'dev') {
  const ip = getLocalIP();
  const url = `http://${ip}:${PORT}/app`;
  console.log(`\n📱 Mode développement — URL: ${url}`);
  console.log('   Assurez-vous que "npm run dev" tourne sur ce PC.\n');
  writeConfig(url);
} else {
  console.log(`\n🚀 Mode production — URL: ${PROD_URL}\n`);
  writeConfig(PROD_URL);
}

// ── Run cap sync ─────────────────────────────────────────────
console.log('⚙️  Synchronisation Capacitor...');
execSync('npx cap sync android', { stdio: 'inherit', cwd: ROOT });
console.log('\n✅ Prêt. Ouvrez Android Studio pour builder.\n');
