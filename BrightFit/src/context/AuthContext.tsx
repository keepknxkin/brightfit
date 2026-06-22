import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { hashPasswordLocal, hashUserIdLocal } from '@/utils/hash';
import { fetchCloudProgress, uploadCloudProgress } from '@/services/cloudSync';
import {
  STORAGE_KEYS,
  getJson,
  setJson,
  removeKey,
  userProgressKey,
} from '@/utils/storage';
import {
  deserializeProgress,
  mergeProgress,
  type SavedProgress,
} from '@/utils/progressStorage';

const SESSION_KEY = 'brightfit_auth_session';
const ACCOUNT_NOT_REGISTERED = 'Account not registered.';
const isExpoGo = Constants.executionEnvironment === 'storeClient';
const useCloudAuth = isSupabaseConfigured && !isExpoGo;

interface LocalUserRecord {
  userId: string;
  email: string;
  passwordHash: string;
}

interface AuthSession {
  userId: string;
  email: string;
  mode: 'supabase' | 'local';
}

interface AuthContextValue {
  user: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthSession>;
  signUp: (email: string, password: string) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  loadProgress: () => Promise<SavedProgress | null>;
  saveProgress: (progress: Omit<SavedProgress, 'updatedAt'>, userId?: string) => Promise<void>;
  markLoginPromptPending: () => Promise<void>;
  consumeLoginPrompt: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function readLocalUsers(): Promise<LocalUserRecord[]> {
  return (await getJson<LocalUserRecord[]>(STORAGE_KEYS.LOCAL_USERS)) ?? [];
}

async function writeLocalUsers(users: LocalUserRecord[]) {
  await setJson(STORAGE_KEYS.LOCAL_USERS, users);
}

async function readRegisteredEmails(): Promise<string[]> {
  return (await getJson<string[]>(STORAGE_KEYS.REGISTERED_EMAILS)) ?? [];
}

async function markEmailRegistered(email: string) {
  const normalized = normalizeEmail(email);
  const emails = await readRegisteredEmails();
  if (emails.includes(normalized)) return;
  await setJson(STORAGE_KEYS.REGISTERED_EMAILS, [...emails, normalized]);
}

async function isEmailRegistered(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const users = await readLocalUsers();
  if (users.some((u) => u.email === normalized)) return true;
  const emails = await readRegisteredEmails();
  return emails.includes(normalized);
}

async function readSession(): Promise<AuthSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  return raw ? (JSON.parse(raw) as AuthSession) : null;
}

async function writeSession(session: AuthSession | null) {
  if (!session) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

async function getCloudSupabase() {
  if (!useCloudAuth) return null;
  const { getSupabaseCloud } = await import('@/lib/supabaseCloud');
  return getSupabaseCloud();
}

async function loadProgressForUser(userId: string): Promise<SavedProgress | null> {
  const local = await getJson<SavedProgress>(userProgressKey(userId));
  const cloud = await fetchCloudProgress(userId);

  if (local && cloud) return mergeProgress(deserializeProgress(local), deserializeProgress(cloud));
  if (cloud) return deserializeProgress(cloud);
  if (local) return deserializeProgress(local);
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    async function bootstrap() {
      try {
        const supabase = await getCloudSupabase();
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            const authSession: AuthSession = {
              userId: session.user.id,
              email: session.user.email,
              mode: 'supabase',
            };
            await writeSession(authSession);
            if (!cancelled) setUser(authSession);
          } else if (!cancelled) {
            setUser(await readSession());
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user?.email) {
              const authSession: AuthSession = {
                userId: session.user.id,
                email: session.user.email,
                mode: 'supabase',
              };
              await writeSession(authSession);
              setUser(authSession);
              return;
            }
            if (_event === 'SIGNED_OUT') {
              await writeSession(null);
              setUser(null);
            }
          });
          unsubscribe = () => subscription.unsubscribe();
          return;
        }

        if (!cancelled) setUser(await readSession());
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const normalized = normalizeEmail(email);
    if (!normalized || password.length < 6) {
      throw new Error('Enter a valid email and a password with at least 6 characters.');
    }

    const supabase = await getCloudSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: normalized,
        password,
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Could not create account.');

      const session: AuthSession = {
        userId: data.user.id,
        email: normalized,
        mode: 'supabase',
      };
      await markEmailRegistered(normalized);
      await writeSession(session);
      setUser(session);
      return session;
    }

    const users = await readLocalUsers();
    if (users.some((u) => u.email === normalized)) {
      throw new Error('An account with this email already exists. Try logging in.');
    }

    const userId = hashUserIdLocal(normalized);
    const passwordHash = hashPasswordLocal(password, normalized);
    await writeLocalUsers([...users, { userId, email: normalized, passwordHash }]);

    const session: AuthSession = { userId, email: normalized, mode: 'local' };
    await markEmailRegistered(normalized);
    await writeSession(session);
    setUser(session);
    return session;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const normalized = normalizeEmail(email);
    if (!normalized || !password) {
      throw new Error('Enter your email and password.');
    }

    const supabase = await getCloudSupabase();
    if (supabase) {
      const registered = await isEmailRegistered(normalized);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalized,
        password,
      });

      if (error) {
        const invalidCredentials =
          error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('invalid credentials');

        if (!registered && invalidCredentials) {
          throw new Error(ACCOUNT_NOT_REGISTERED);
        }
        if (registered && invalidCredentials) {
          throw new Error('Incorrect password.');
        }
        throw new Error(error.message);
      }

      if (!data.user) throw new Error('Could not sign in.');

      const session: AuthSession = {
        userId: data.user.id,
        email: normalized,
        mode: 'supabase',
      };
      await markEmailRegistered(normalized);
      await writeSession(session);
      setUser(session);
      return session;
    }

    const users = await readLocalUsers();
    const record = users.find((u) => u.email === normalized);
    if (!record) throw new Error(ACCOUNT_NOT_REGISTERED);

    const passwordHash = hashPasswordLocal(password, normalized);
    if (passwordHash !== record.passwordHash) {
      throw new Error('Incorrect password.');
    }

    const session: AuthSession = {
      userId: record.userId,
      email: normalized,
      mode: 'local',
    };
    await writeSession(session);
    setUser(session);
    return session;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = await getCloudSupabase();
    if (supabase) await supabase.auth.signOut();
    await writeSession(null);
    setUser(null);
  }, []);

  const loadProgress = useCallback(async () => {
    if (!user) return null;
    return loadProgressForUser(user.userId);
  }, [user]);

  const saveProgress = useCallback(
    async (progress: Omit<SavedProgress, 'updatedAt'>, overrideUserId?: string) => {
      const { serializeProgress } = await import('@/utils/progressStorage');
      const payload = serializeProgress(progress);
      const targetUserId = overrideUserId ?? user?.userId;

      if (targetUserId) {
        await setJson(userProgressKey(targetUserId), payload);
        await uploadCloudProgress(targetUserId, payload);
        return;
      }

      await setJson(STORAGE_KEYS.GUEST_PROGRESS, payload);
    },
    [user],
  );

  const markLoginPromptPending = useCallback(async () => {
    await setJson(STORAGE_KEYS.SHOW_LOGIN_PROMPT, true);
  }, []);

  const consumeLoginPrompt = useCallback(async () => {
    const shouldShow = await getJson<boolean>(STORAGE_KEYS.SHOW_LOGIN_PROMPT);
    if (shouldShow) {
      await removeKey(STORAGE_KEYS.SHOW_LOGIN_PROMPT);
      return true;
    }
    return false;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      signIn,
      signUp,
      signOut,
      loadProgress,
      saveProgress,
      markLoginPromptPending,
      consumeLoginPrompt,
    }),
    [
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      loadProgress,
      saveProgress,
      markLoginPromptPending,
      consumeLoginPrompt,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export type { AuthSession };
export { loadProgressForUser };

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { isSupabaseConfigured };
