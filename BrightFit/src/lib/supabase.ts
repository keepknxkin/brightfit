import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  authCloudEnabled?: boolean;
} | undefined;

const SUPABASE_URL =
  extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';

const SUPABASE_ANON_KEY =
  extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const isCloudAuthEnabled = extra?.authCloudEnabled ?? isSupabaseConfigured;

// Supabase JS pulls in @supabase/realtime-js websocket code that breaks Metro in Expo Go.
// Cloud auth is enabled only in production builds with keys set — see supabaseCloud.ts.
export function getSupabase(): null {
  return null;
}
