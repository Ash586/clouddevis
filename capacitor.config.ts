import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clouddevis.app',
  appName: 'CloudDevis',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Remote Server Mode — يفتح الموقع المنشور
    // غيّر هذا للتطوير المحلي: url: 'http://YOUR_IP:3000'
    url: 'https://clouddevis.vercel.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
      backgroundColor: '#0B3D2E',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0B3D2E',
    },
    Preferences: {
      group: 'clouddevis',
    },
    PushNotifications: {
      // Notification options when app is in foreground
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
