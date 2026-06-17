import type {
  WorkoutRecord,
  Routine,
  MeasurementLog,
  ProgressPhoto,
  BodyMeasurements,
} from '@/types/workout';
import { EMPTY_MEASUREMENTS } from '@/types/workout';

export interface OnboardingProfile {
  name: string;
  fitnessLevel: string;
  workoutsPerWeek: string;
  workoutDuration: string;
  fitnessFocus: string;
  equipment: string[];
}

export interface SavedProgress {
  history: WorkoutRecord[];
  routines: Routine[];
  measurementLogs: MeasurementLog[];
  progressPhotos: ProgressPhoto[];
  earnedAchievements: string[];
  profilePhotoUri?: string;
  onboarding?: OnboardingProfile;
  updatedAt: string;
}

function reviveDates<T extends { date: Date | string }>(items: T[]): T[] {
  return items.map((item) => ({
    ...item,
    date: new Date(item.date),
  }));
}

export function serializeProgress(data: Omit<SavedProgress, 'updatedAt'>): SavedProgress {
  return {
    ...data,
    updatedAt: new Date().toISOString(),
  };
}

export function deserializeProgress(raw: SavedProgress): SavedProgress {
  return {
    ...raw,
    history: reviveDates(raw.history ?? []),
    routines: (raw.routines ?? []).map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt),
    })),
    measurementLogs: reviveDates(raw.measurementLogs ?? []).map((log) => ({
      ...log,
      measurements: {
        ...EMPTY_MEASUREMENTS,
        ...((log as MeasurementLog).measurements ?? {}),
      } as BodyMeasurements,
    })),
    progressPhotos: reviveDates(raw.progressPhotos ?? []),
    earnedAchievements: raw.earnedAchievements ?? [],
  };
}

export function mergeProgress(local: SavedProgress, remote: SavedProgress): SavedProgress {
  const pickNewer = <T extends { id: string; date?: Date | string; createdAt?: Date | string }>(
    a: T[],
    b: T[],
    dateKey: 'date' | 'createdAt' = 'date',
  ) => {
    const map = new Map<string, T>();
    [...a, ...b].forEach((item) => {
      const existing = map.get(item.id);
      if (!existing) {
        map.set(item.id, item);
        return;
      }
      const existingDate = new Date((existing as Record<string, unknown>)[dateKey] as string | Date).getTime();
      const itemDate = new Date((item as Record<string, unknown>)[dateKey] as string | Date).getTime();
      if (itemDate >= existingDate) map.set(item.id, item);
    });
    return Array.from(map.values());
  };

  return deserializeProgress({
    history: pickNewer(local.history ?? [], remote.history ?? []),
    routines: pickNewer(local.routines ?? [], remote.routines ?? [], 'createdAt'),
    measurementLogs: pickNewer(local.measurementLogs ?? [], remote.measurementLogs ?? []),
    progressPhotos: pickNewer(local.progressPhotos ?? [], remote.progressPhotos ?? []),
    earnedAchievements: Array.from(
      new Set([...(local.earnedAchievements ?? []), ...(remote.earnedAchievements ?? [])]),
    ),
    onboarding: remote.onboarding ?? local.onboarding,
    profilePhotoUri: remote.profilePhotoUri ?? local.profilePhotoUri,
    updatedAt: new Date().toISOString(),
  });
}
