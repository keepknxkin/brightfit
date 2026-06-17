import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { STORAGE_KEYS, getJson } from '@/utils/storage';
import type { OnboardingProfile, SavedProgress } from '@/utils/progressStorage';

export type {
  CompletedSet,
  CompletedExercise,
  ResumeExercise,
  ResumeSetRow,
  ResumeData,
  WorkoutRecord,
  Routine,
  BodyMeasurements,
  MeasurementLog,
  ProgressPhoto,
} from '@/types/workout';

export { EMPTY_MEASUREMENTS } from '@/types/workout';

import {
  EMPTY_MEASUREMENTS,
  type WorkoutRecord,
  type Routine,
  type MeasurementLog,
  type ProgressPhoto,
  type BodyMeasurements,
} from '@/types/workout';
import { deserializeProgress } from '@/utils/progressStorage';

interface WorkoutContextValue {
  history: WorkoutRecord[];
  addWorkout: (record: WorkoutRecord) => void;
  routines: Routine[];
  addRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  measurementLogs: MeasurementLog[];
  addMeasurementLog: (m: BodyMeasurements) => void;
  progressPhotos: ProgressPhoto[];
  addProgressPhoto: (uri: string, isDay1?: boolean) => void;
  profilePhotoUri: string | null;
  setProfilePhoto: (uri: string | null) => void;
  earnedAchievements: string[];
  addEarnedAchievements: (ids: string[]) => void;
  isHydrated: boolean;
  hydrateFromSaved: (saved: SavedProgress) => void;
}

// ── Context ───────────────────────────────────────────────────
const WorkoutContext = createContext<WorkoutContextValue>({
  history: [],
  addWorkout: () => {},
  routines: [],
  addRoutine: () => {},
  deleteRoutine: () => {},
  measurementLogs: [],
  addMeasurementLog: () => {},
  progressPhotos: [],
  addProgressPhoto: () => {},
  profilePhotoUri: null,
  setProfilePhoto: () => {},
  earnedAchievements: [],
  addEarnedAchievements: () => {},
  isHydrated: false,
  hydrateFromSaved: () => {},
});

// ── Provider ──────────────────────────────────────────────────
export function WorkoutProvider({
  children,
  getProfileData,
}: {
  children: React.ReactNode;
  getProfileData?: () => OnboardingProfile | undefined;
}) {
  const { user, isLoading: authLoading, loadProgress, saveProgress } = useAuth();
  const [history, setHistory] = useState<WorkoutRecord[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [measurementLogs, setMeasurementLogs] = useState<MeasurementLog[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [earnedAchievements, setEarnedAchievements] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(false);

  const hydrateFromSaved = useCallback((saved: SavedProgress) => {
    skipNextSave.current = true;
    const normalized = deserializeProgress(saved);
    setHistory(normalized.history ?? []);
    setRoutines(normalized.routines ?? []);
    setMeasurementLogs(normalizeMeasurementLogs(normalized.measurementLogs));
    setProgressPhotos(normalized.progressPhotos ?? []);
    setProfilePhotoUri(normalized.profilePhotoUri ?? null);
    setEarnedAchievements(normalized.earnedAchievements ?? []);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    (async () => {
      const raw = user ? await loadProgress() : await getJson<SavedProgress>(STORAGE_KEYS.GUEST_PROGRESS);
      if (cancelled) return;
      if (raw) hydrateFromSaved(raw);
      setIsHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.userId, loadProgress, hydrateFromSaved]);

  useEffect(() => {
    if (!isHydrated || authLoading) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProgress({
        history,
        routines,
        measurementLogs,
        progressPhotos,
        profilePhotoUri: profilePhotoUri ?? undefined,
        earnedAchievements,
        onboarding: getProfileData?.(),
      });
    }, 500);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [
    history,
    routines,
    measurementLogs,
    progressPhotos,
    profilePhotoUri,
    earnedAchievements,
    getProfileData,
    isHydrated,
    authLoading,
    saveProgress,
  ]);

  const addWorkout = useCallback((record: WorkoutRecord) => {
    setHistory((prev) => [record, ...prev]);
  }, []);

  const addRoutine = useCallback((routine: Routine) => {
    setRoutines((prev) => [routine, ...prev]);
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines((prev) => prev.filter(r => r.id !== id));
  }, []);

  const addMeasurementLog = useCallback((m: BodyMeasurements) => {
    const entry: MeasurementLog = {
      id: Date.now().toString(),
      date: new Date(),
      measurements: m,
    };
    setMeasurementLogs((prev) => [...prev, entry]);
  }, []);

  const addEarnedAchievements = useCallback((ids: string[]) => {
    setEarnedAchievements(prev => {
      const existing = new Set(prev);
      const newIds = ids.filter(id => !existing.has(id));
      return newIds.length > 0 ? [...prev, ...newIds] : prev;
    });
  }, []);

  const setProfilePhoto = useCallback((uri: string | null) => {
    setProfilePhotoUri(uri);
  }, []);

  const addProgressPhoto = useCallback((uri: string, isDay1 = false) => {
    const photo: ProgressPhoto = {
      id: Date.now().toString(),
      date: new Date(),
      uri,
      isDay1,
    };
    setProgressPhotos((prev) =>
      isDay1
        ? [photo, ...prev.filter(p => !p.isDay1)]
        : [...prev, photo],
    );
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        history,
        addWorkout,
        routines,
        addRoutine,
        deleteRoutine,
        measurementLogs,
        addMeasurementLog,
        progressPhotos,
        addProgressPhoto,
        profilePhotoUri,
        setProfilePhoto,
        earnedAchievements,
        addEarnedAchievements,
        isHydrated,
        hydrateFromSaved,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useWorkout() {
  return useContext(WorkoutContext);
}

// ── Helpers ───────────────────────────────────────────────────

/** Map exercise muscle IDs → SVG muscle keys used in ProgressScreen body diagram */
export const MUSCLE_TO_SVG: Record<string, string[]> = {
  chest:      ['chest'],
  upperBack:  ['traps', 'lats', 'rearDeltoid'],
  lowerBack:  ['lowerBack'],
  shoulders:  ['deltoids', 'rearDeltoid'],
  biceps:     ['biceps'],
  triceps:    ['triceps'],
  forearms:   ['forearms'],
  core:       ['abs'],
  obliques:   ['obliques'],
  quads:      ['quads'],
  hamstrings: ['hamstrings'],
  glutes:     ['glutes'],
  calves:     ['calves'],
  hipFlexors: ['hipFlexors'],
  fullBody: [
    'chest', 'traps', 'lats', 'rearDeltoid', 'deltoids',
    'biceps', 'triceps', 'abs', 'obliques',
    'quads', 'hamstrings', 'glutes', 'calves',
  ],
};

export type MuscleStatus = 'fresh' | 'fatigued' | 'improved';

/**
 * Compute per-muscle status based on the priority chain:
 *   Improved (24 h) > Fatigued (48 h) > Fresh
 *
 * - Fatigued: muscle was trained within the last 48 hours.
 * - Improved: user beat their previous performance (weight, reps, or
 *   volume) for that exercise within the last 24 hours.  Overrides Fatigued.
 * - Fresh: not trained in the last 48 hours.
 *
 * Keys in the returned map are SVG body-diagram slugs (via MUSCLE_TO_SVG).
 * Missing keys are implicitly Fresh.
 */
export function buildMuscleStatusMap(
  history: WorkoutRecord[],
): Record<string, MuscleStatus> {
  const now = Date.now();
  const MS_48H = 48 * 3_600_000;
  const MS_24H = 24 * 3_600_000;

  // Newest-first so we always compare against the most recent prior attempt
  const sorted = [...history]
    .filter(r => r?.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const map: Record<string, MuscleStatus> = {};

  // ── Phase 1: mark Fatigued (trained within 48 h) ─────────────
  for (const record of sorted) {
    const age = now - new Date(record.date).getTime();
    if (age > MS_48H) continue;

    for (const muscle of record.musclesWorked ?? []) {
      for (const svgKey of MUSCLE_TO_SVG[muscle] ?? []) {
        if (!map[svgKey]) map[svgKey] = 'fatigued';
      }
    }
  }

  // ── Phase 2: upgrade to Improved where performance increased ──
  // Only workouts completed within the last 24 h can grant Improved.
  for (const record of sorted) {
    const age = now - new Date(record.date).getTime();
    if (age > MS_24H) break; // sorted newest-first; everything after is older

    for (const exercise of record.exercises ?? []) {
      if (!exercise.sets?.length) continue;

      // Find the most recent *previous* completed workout containing this exercise
      const prevRecord = sorted.find(
        r =>
          r.id !== record.id &&
          new Date(r.date).getTime() < new Date(record.date).getTime() &&
          (r.exercises ?? []).some(e => e.name === exercise.name && (e.sets?.length ?? 0) > 0),
      );
      if (!prevRecord) continue;

      const prevEx = (prevRecord.exercises ?? []).find(
        e => e.name === exercise.name && (e.sets?.length ?? 0) > 0,
      );
      if (!prevEx) continue;

      const curMaxWeight  = Math.max(...exercise.sets.map(s => s.weight));
      const prevMaxWeight = Math.max(...prevEx.sets.map(s => s.weight));
      const curReps       = exercise.sets.reduce((n, s) => n + s.reps, 0);
      const prevReps      = prevEx.sets.reduce((n, s) => n + s.reps, 0);
      const curVolume     = exercise.sets.reduce((n, s) => n + s.weight * s.reps, 0);
      const prevVolume    = prevEx.sets.reduce((n, s) => n + s.weight * s.reps, 0);

      const isImproved =
        curMaxWeight > prevMaxWeight ||
        curReps      > prevReps      ||
        curVolume    > prevVolume;

      if (isImproved) {
        for (const muscle of exercise.muscles ?? []) {
          for (const svgKey of MUSCLE_TO_SVG[muscle] ?? []) {
            map[svgKey] = 'improved'; // overrides fatigued
          }
        }
      }
    }
  }

  return map;
}

/** Sum volume lifted this week (Mon–Sun) */
export function weeklyVolume(history: WorkoutRecord[]): number {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Sunday
  weekStart.setHours(0, 0, 0, 0);
  return history
    .filter((r) => new Date(r.date) >= weekStart)
    .reduce((sum, r) => sum + r.totalVolume, 0);
}

/** Sum workout time this week in minutes */
export function weeklyMinutes(history: WorkoutRecord[]): number {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return Math.round(
    history
      .filter((r) => new Date(r.date) >= weekStart)
      .reduce((sum, r) => sum + r.durationSeconds, 0) / 60,
  );
}

/** Set of date strings (YYYY-MM-DD) that have completed workouts */
export function workoutDates(history: WorkoutRecord[]): Set<string> {
  return new Set(
    history.map((r) => {
      const d = new Date(r.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }),
  );
}

/** Total Star Points (10 pts per completed workout, 2 pts per abandoned) */
export function totalIronPoints(history: WorkoutRecord[]): number {
  return history.reduce((sum, r) => sum + (r.completed ? 10 : 2), 0);
}

function normalizeMeasurementLogs(logs: MeasurementLog[] | undefined): MeasurementLog[] {
  if (!Array.isArray(logs)) return [];
  return logs.map((log) => ({
    ...log,
    date: log.date instanceof Date ? log.date : new Date(log.date),
    measurements: {
      ...EMPTY_MEASUREMENTS,
      ...(log.measurements ?? {}),
    },
  }));
}

/** Get the most recent logged measurements, or empty defaults */
export function getCurrentMeasurements(logs: MeasurementLog[] | undefined): BodyMeasurements {
  const safeLogs = normalizeMeasurementLogs(logs);
  if (safeLogs.length === 0) return EMPTY_MEASUREMENTS;
  return safeLogs[safeLogs.length - 1].measurements;
}

/** Consecutive days with at least one completed workout (today or yesterday must be included) */
export function calculateStreak(history: WorkoutRecord[]): number {
  const completedTs = new Set(
    history
      .filter(r => r.completed)
      .map(r => {
        const d = new Date(r.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }),
  );
  if (completedTs.size === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (!completedTs.has(today.getTime()) && !completedTs.has(yesterday.getTime())) return 0;

  let streak = 0;
  const cursor = completedTs.has(today.getTime()) ? new Date(today) : new Date(yesterday);
  while (completedTs.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Best (longest) streak ever recorded */
export function bestStreak(history: WorkoutRecord[]): number {
  const days = [
    ...new Set(
      history
        .filter(r => r.completed)
        .map(r => {
          const d = new Date(r.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        }),
    ),
  ].sort((a, b) => a - b);

  let best = 0;
  let current = 0;
  const DAY = 86_400_000;
  for (let i = 0; i < days.length; i++) {
    if (i === 0 || days[i] - days[i - 1] === DAY) {
      current++;
    } else {
      current = 1;
    }
    if (current > best) best = current;
  }
  return best;
}

/** Number of completed workouts in the current Sun–Sat week */
export function weeklyWorkoutCount(history: WorkoutRecord[]): number {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return history.filter(r => r.completed && new Date(r.date) >= weekStart).length;
}

/** 7-element boolean array (Sun=0…Sat=6) — true if that day had a completed workout */
export function getThisWeekWorkoutDays(history: WorkoutRecord[]): boolean[] {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const completedTs = new Set(
    history
      .filter(r => r.completed)
      .map(r => {
        const d = new Date(r.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }),
  );

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return completedTs.has(day.getTime());
  });
}
