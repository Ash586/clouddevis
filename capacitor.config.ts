import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clouddevis.app',
  appName: 'CloudDevis',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Remote Server Mode — /app يعرض MobileShell كامل الشاشة (بلا إطار المعاينة).
    // ملاحظة: /mobile هو غلاف معاينة للمتصفح فقط — لا تستعمله في الإنتاج.
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
