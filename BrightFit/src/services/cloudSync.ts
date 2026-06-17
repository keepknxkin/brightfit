import Constants from 'expo-constants';
import type { SavedProgress } from '@/utils/progressStorage';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

async function getCloudClient() {
  if (isExpoGo) return null;
  const { getSupabaseCloud } = await import('@/lib/supabaseCloud');
  return getSupabaseCloud();
}

export async function fetchCloudProgress(userId: string): Promise<SavedProgress | null> {
  const supabase = await getCloudClient();
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('user_progress')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[cloudSync] fetch failed:', error.message);
    return null;
  }
  if (!data?.data) return null;
  return data.data as SavedProgress;
}

export async function uploadCloudProgress(userId: string, progress: SavedProgress): Promise<void> {
  const supabase = await getCloudClient();
  if (!supabase) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { error } = await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      data: progress,
      updated_at: progress.updatedAt,
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.warn('[cloudSync] upload failed:', error.message);
  }
}
