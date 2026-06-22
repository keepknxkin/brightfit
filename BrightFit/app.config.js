// Production/TestFlight builds read secrets from EAS env or .env (local only, not committed).
// Set EXPO_PUBLIC_* variables before building.

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const superwallIosApiKey = process.env.EXPO_PUBLIC_SUPERWALL_IOS_API_KEY ?? '';
const superwallAndroidApiKey =
  process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_API_KEY ?? superwallIosApiKey;

export default {
  expo: {
    name: 'BrightFit',
    slug: 'brightfit',
    scheme: 'brightfit',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    plugins: [
      'expo-secure-store',
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '15.1',
          },
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'BrightFit uses your photo library so you can set a profile photo and track progress pictures.',
          cameraPermission:
            'BrightFit uses your camera so you can take profile and progress photos.',
          microphonePermission: false,
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/splash-icon.png',
          resizeMode: 'contain',
          backgroundColor: '#000000',
          imageWidth: 220,
        },
      ],
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.brightfit.app',
      icon: './assets/icon.png',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.brightfit.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    extra: {
      eas: {
        projectId: '10886ea8-a9fd-4ab7-9fd5-60664550bbb0',
      },
      supabaseUrl,
      supabaseAnonKey,
      superwallIosApiKey,
      superwallAndroidApiKey,
      // Lets the app know cloud sync is baked into this build
      authCloudEnabled: Boolean(supabaseUrl && supabaseAnonKey),
    },
  },
};
