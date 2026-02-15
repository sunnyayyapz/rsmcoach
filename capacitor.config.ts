import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.rsmcoach',
  appName: 'rsmcoach',
  webDir: 'dist',
  server: {
    url: 'https://2b51f180-7c7a-4845-aef7-2655651d7e47.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
