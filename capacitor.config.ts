import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clouddevis.app',
  appName: 'CloudDevis',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Remote Server Mode — يفتح واجهة الهاتف /mobile مباشرةً (وليس صفحة التسويق)
    // غيّر هذا للتطوير المحلي: url: 'http://YOUR_IP:3000/mobile'
    url: 'https://clouddevis.vercel.app/mobile',
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
      // Light app background → light bar with dark icons/text
      style: 'LIGHT',
      backgroundColor: '#F3F6FC',
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
