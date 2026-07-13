import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rakmana.app',
  appName: 'رقمنة',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Remote Server Mode — يفتح مباشرة على شاشة تسجيل الدخول
    // غيّر هذا للتطوير المحلي: url: 'http://YOUR_IP:3000/app'
    url: 'https://clouddevis.vercel.app/app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
      backgroundColor: '#0d3d24',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0d3d24',
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
