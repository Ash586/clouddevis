import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clouddevis.app',
  appName: 'CloudDevis',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Remote Server Mode — يعرض الموقع كاملاً (Landing + Dashboard) بتصميم mobile-first
    // غيّر هذا للتطوير المحلي: url: 'http://YOUR_IP:3000'
    url: 'https://clouddevis.vercel.app',
    cleartext: false,
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
