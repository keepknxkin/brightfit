import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  GUEST_PROGRESS: '@brightfit/guest_progress',
  ONBOARDING: '@brightfit/onboarding',
  ONBOARDING_COMPLETE: '@brightfit/onboarding_complete',
  SHOW_LOGIN_PROMPT: '@brightfit/show_login_prompt',
  LOCAL_USERS: '@brightfit/local_users',
  REGISTERED_EMAILS: '@brightfit/registered_emails',
  APP_REVIEW: '@brightfit/app_review',
  APP_REVIEW_DISMISSED: '@brightfit/app_review_dismissed',
} as const;

export function userProgressKey(userId: string) {
  return `@brightfit/progress_${userId}`;
}

export async function getJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
