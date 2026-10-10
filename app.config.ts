import type { ExpoConfig } from 'expo/config';

// Native identifiers and keys. Secrets come from the environment (EAS secrets / .env), never from git.
const BUNDLE_ID = 'app.halalhabits.mobile';
const LOCATION_PROMPT = 'Halal Habit uses your location to find the nearest musollah, masjid and halal food while the app is open.';

const config: ExpoConfig = {
  name: 'Halal Habit',
  slug: 'halal-habits',
  owner: 'brahmasta',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'halalhabits',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',
  ios: {
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: false,
    usesAppleSignIn: true,
    infoPlist: {
      NSLocationWhenInUseUsageDescription: LOCATION_PROMPT,
      ITSAppUsesNonExemptEncryption: false,
    },
    // Apple Maps is used unless a Google key is provided.
    config: process.env.GOOGLE_MAPS_IOS_KEY ? { googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_KEY } : undefined,
  },
  android: {
    package: BUNDLE_ID,
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#FAFAF7',
    },
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    // react-native-maps on Android needs a Google Maps key (Maps SDK for Android).
    config: { googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_KEY ?? '' } },
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          { scheme: 'https', host: 'www.halalhabits.app', pathPrefix: '/auth' },
          { scheme: 'https', host: 'halalhabits.app', pathPrefix: '/auth' },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: { bundler: 'metro', output: 'single', favicon: './assets/favicon.png' },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-web-browser',
    'expo-apple-authentication',
    ['expo-location', { locationWhenInUsePermission: LOCATION_PROMPT }],
    ['expo-splash-screen', { image: './assets/splash-icon.png', imageWidth: 180, resizeMode: 'contain', backgroundColor: '#FAFAF7', dark: { backgroundColor: '#111311' } }],
  ],
  experiments: { typedRoutes: true },
  extra: {
    eas: { projectId: 'eb978102-ff9f-4544-a1f6-80874e293f83' },
  },
};

export default config;
