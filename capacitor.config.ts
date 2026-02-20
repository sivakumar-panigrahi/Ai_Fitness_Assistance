import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.33b7a2ac9c834dc7a7a9e43fd3985ff7',
  appName: 'FitCoach AI',
  webDir: 'dist',
  server: {
    url: 'https://33b7a2ac-9c83-4dc7-a7a9-e43fd3985ff7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    // Pedometer plugin config
    CapacitorPedometer: {
      // Enable background step counting
      backgroundDelivery: true
    }
  },
  // iOS specific config for background modes
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#000000'
  },
  // Android specific config
  android: {
    backgroundColor: '#000000'
  }
};

export default config;
