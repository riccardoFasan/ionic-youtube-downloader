import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'downloader',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    hostname: 'localhost:4200',
    allowNavigation: ['localhost:4200'],
    cleartext: true,
  },
};

export default config;
