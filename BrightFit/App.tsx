import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync().catch(() => {});

import { WelcomeScreen, GenderScreen, AgeScreen, FitnessLevelScreen, HeightScreen, SocialProofScreen, FeatureOnboardingCarouselScreen, WorkoutsPerWeekScreen, WorkoutDurationScreen, EquipmentScreen, FitnessFocusScreen, CreatingPlanScreen, PlanSummaryScreen, HomeScreen } from '@/screens';
import { EMPTY_MEASUREMENTS } from '@/types/workout';
import { AuthProvider, useAuth, loadProgressForUser, type AuthSession } from '@/context/AuthContext';
import { WorkoutProvider, useWorkout } from '@/context/WorkoutContext';
import WorkoutSessionScreen, { SessionExercise } from '@/screens/WorkoutSessionScreen';
import { EXERCISE_POOL } from '@/screens/InstantWorkoutScreen';
import CountdownOverlay from '@/components/CountdownOverlay';
import LoginModal from '@/components/LoginModal';
import { STORAGE_KEYS, getJson, setJson } from '@/utils/storage';
import { mergeProgress, serializeProgress, type SavedProgress } from '@/utils/progressStorage';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

type AppExtra = {
  superwallIosApiKey?: string;
  superwallAndroidApiKey?: string;
};

const appExtra = Constants.expoConfig?.extra as AppExtra | undefined;
const superwallApiKeys = {
  ios:
    appExtra?.superwallIosApiKey ||
    process.env.EXPO_PUBLIC_SUPERWALL_IOS_API_KEY ||
    '',
  android:
    appExtra?.superwallAndroidApiKey ||
    process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_API_KEY ||
    process.env.EXPO_PUBLIC_SUPERWALL_IOS_API_KEY ||
    '',
};

// expo-superwall requires native modules — skip entirely in Expo Go
let SuperwallProvider: React.ComponentType<{ apiKeys: { ios: string; android: string }; children: React.ReactNode }>;
type PlacementCallbacks = {
  onDismiss?: (info: unknown, result: { type: string }) => void;
  onError?: (error: string) => void;
};
let usePlacement: (callbacks?: PlacementCallbacks) => {
  registerPlacement: (opts: {
    placement: string;
    params?: Record<string, unknown>;
    feature?: () => void;
  }) => Promise<void>;
};
let useUser: () => {
  update: (attrs: Record<string, unknown>) => Promise<void>;
  identify: (userId: string, options?: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
};

if (isExpoGo) {
  SuperwallProvider = ({ children }) => <>{children}</>;
  usePlacement = () => ({ registerPlacement: async ({ feature }) => feature?.() });
  useUser = () => ({ update: async () => {}, identify: async () => {}, signOut: async () => {} });
} else {
  try {
    const sw = require('expo-superwall');
    if (!sw.SuperwallProvider) throw new Error('Native module not ready');
    SuperwallProvider = sw.SuperwallProvider;
    usePlacement = sw.usePlacement as typeof usePlacement;
    useUser = sw.useUser;
  } catch {
    SuperwallProvider = ({ children }) => <>{children}</>;
    usePlacement = () => ({
      registerPlacement: async () => {
        throw new Error('Superwall native module not ready');
      },
    });
    useUser = () => ({ update: async () => {}, identify: async () => {}, signOut: async () => {} });
  }
}

type Screen =
  | 'welcome' | 'gender' | 'age' | 'fitnessLevel' | 'height' | 'socialProof' | 'featureCarousel'
  | 'workoutsPerWeek' | 'workoutDuration' | 'equipment' | 'fitnessFocus'
  | 'creatingPlan' | 'planSummary' | 'planWorkoutCountdown' | 'planWorkoutSession' | 'home';

interface OnboardingData {
  name: string;
  fitnessLevel: string;
  workoutsPerWeek: string;
  workoutDuration: string;
  fitnessFocus: string;
  equipment: string[];
}

function AppContent() {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    saveProgress,
    markLoginPromptPending,
    consumeLoginPrompt,
  } = useAuth();
  const {
    hydrateFromSaved,
    history,
    routines,
    measurementLogs,
    progressPhotos,
    profilePhotoUri,
    earnedAchievements,
    isHydrated,
    addMeasurementLog,
  } = useWorkout();
  const [screen, setScreen] = useState<Screen>('welcome');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginGatePassed, setLoginGatePassed] = useState(false);
  const [loginModalSource, setLoginModalSource] = useState<'welcome' | 'home'>('welcome');
  const [editingFromSummary, setEditingFromSummary] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingData>({
    name: '',
    fitnessLevel: '',
    workoutsPerWeek: '',
    workoutDuration: '',
    fitnessFocus: '',
    equipment: [],
  });

  useEffect(() => {
    onboardingProfileRef.current = onboarding;
  }, [onboarding]);

  useEffect(() => {
    if (!isHydrated) return;

    let cancelled = false;
    (async () => {
      const raw = user
        ? await loadProgressForUser(user.userId)
        : await getJson<SavedProgress>(STORAGE_KEYS.GUEST_PROGRESS);
      const savedName = raw?.onboarding?.name?.trim();
      if (cancelled || !savedName) return;
      setOnboarding((prev) => (prev.name.trim() ? prev : { ...prev, name: savedName }));
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, user?.userId]);

  const handleNameChange = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const updated = { ...onboarding, name: trimmed };
    setOnboarding(updated);
    saveProgress({
      history,
      routines,
      measurementLogs,
      progressPhotos,
      profilePhotoUri: profilePhotoUri ?? undefined,
      earnedAchievements,
      onboarding: updated,
    });
  }, [
    onboarding,
    saveProgress,
    history,
    routines,
    measurementLogs,
    progressPhotos,
    profilePhotoUri,
    earnedAchievements,
  ]);

  const [planWorkoutData, setPlanWorkoutData] = useState<{
    exercises: SessionExercise[];
    title: string;
  } | null>(null);
  const [paywallLoading, setPaywallLoading] = useState(false);
  const onboardingNavigated = useRef(false);

  useEffect(() => {
    if (!authLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [authLoading]);

  const goHome = async () => {
    await markLoginPromptPending();
    setScreen('home');
  };

  const finishOnboardingAndGoHome = async () => {
    if (onboardingNavigated.current) return;
    onboardingNavigated.current = true;
    setPaywallLoading(false);
    await setJson(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    await goHome();
  };

  const { registerPlacement } = usePlacement({
    onPresent: () => setPaywallLoading(false),
    onDismiss: (_info, result) => {
      if (result.type === 'declined') {
        onboardingNavigated.current = false;
        setPaywallLoading(false);
      }
    },
    onError: (error) => {
      console.error('[Superwall] Paywall error:', error);
      onboardingNavigated.current = false;
      setPaywallLoading(false);
    },
  });
  const { update: updateUser, identify: identifyUser } = useUser();

  const openLogin = (source: 'welcome' | 'home') => {
    setLoginModalSource(source);
    setShowLoginModal(true);
  };

  const handleLoginSuccess = async (session: AuthSession) => {
    const guest = await getJson<SavedProgress>(STORAGE_KEYS.GUEST_PROGRESS);
    const account = await loadProgressForUser(session.userId);

    const currentSession = serializeProgress({
      history,
      routines,
      measurementLogs,
      progressPhotos,
      profilePhotoUri: profilePhotoUri ?? undefined,
      earnedAchievements,
      onboarding,
    });

    let merged = currentSession;
    if (guest) merged = mergeProgress(merged, guest);
    if (account) merged = mergeProgress(merged, account);

    hydrateFromSaved(merged);
    if (merged.onboarding) setOnboarding(merged.onboarding);

    await identifyUser(session.userId, { email: session.email });

    await saveProgress({
      history: merged.history,
      routines: merged.routines,
      measurementLogs: merged.measurementLogs,
      progressPhotos: merged.progressPhotos,
      profilePhotoUri: merged.profilePhotoUri,
      earnedAchievements: merged.earnedAchievements,
      onboarding: merged.onboarding ?? onboarding,
    });

    await setJson(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    if (loginModalSource === 'welcome') {
      setScreen('home');
    }
  };

  useEffect(() => {
    if (!user || authLoading) return;
    identifyUser(user.userId, { email: user.email }).catch(() => {});
  }, [user?.userId, authLoading, identifyUser]);

  useEffect(() => {
    if (screen !== 'home' || authLoading) return;

    if (isAuthenticated) {
      setLoginGatePassed(true);
      return;
    }

    consumeLoginPrompt().then((shouldShow) => {
      if (shouldShow) {
        setLoginModalSource('home');
        setShowLoginModal(true);
        setLoginGatePassed(false);
      } else {
        setLoginGatePassed(true);
      }
    });
  }, [screen, authLoading, isAuthenticated, consumeLoginPrompt]);

  useEffect(() => {
    if (screen !== 'home') {
      setLoginGatePassed(false);
    }
  }, [screen]);

  const handleLoginModalClose = useCallback(() => {
    setShowLoginModal(false);
    setLoginGatePassed(true);
  }, []);

  const handleOnboardingComplete = async () => {
    setPaywallLoading(true);
    onboardingNavigated.current = false;
    try {
      await updateUser({
        fitnessLevel: onboarding.fitnessLevel,
        workoutsPerWeek: onboarding.workoutsPerWeek,
        workoutDuration: onboarding.workoutDuration,
        fitnessFocus: onboarding.fitnessFocus,
        equipment: onboarding.equipment.join(', '),
      });

      await registerPlacement({
        placement: 'onboarding_complete',
        params: {
          fitnessLevel: onboarding.fitnessLevel,
          workoutsPerWeek: onboarding.workoutsPerWeek,
          workoutDuration: onboarding.workoutDuration,
          fitnessFocus: onboarding.fitnessFocus,
        },
        feature: () => {
          void finishOnboardingAndGoHome();
        },
      });
    } catch (err) {
      console.error('[Superwall] Onboarding paywall failed:', err);
      onboardingNavigated.current = false;
      setPaywallLoading(false);
    }
  };

  // Navigate to an edit screen from planSummary
  const editFrom = (dest: Screen) => {
    setEditingFromSummary(true);
    setScreen(dest);
  };

  // After saving an edit, return to planSummary
  const doneEditing = () => {
    setEditingFromSummary(false);
    setScreen('planSummary');
  };

  // Build a workout from the user's 5 onboarding selections
  function generatePlanWorkout(): { exercises: SessionExercise[]; title: string } {
    const { fitnessFocus, workoutDuration, fitnessLevel, equipment } = onboarding;

    // ── Exercise count by session duration ───────────────────────
    const countMap: Record<string, number> = {
      '30min': 5, '45min': 7, '1hr': 10, '1hr30min': 14,
    };
    const count = countMap[workoutDuration] ?? 7;

    // ── Rep & set targets driven by focus + level ─────────────────
    // [sets, reps] — compounds use these directly; isolations keep defaults
    const volumeMap: Record<string, Record<string, [number, string]>> = {
      strength_training:    { beginner: [3, '6'],  intermediate: [4, '5'],  advanced: [5, '4']  },
      muscle_gain:          { beginner: [3, '12'], intermediate: [4, '10'], advanced: [4, '8']  },
      fat_loss:             { beginner: [3, '15'], intermediate: [3, '15'], advanced: [4, '15'] },
      stay_fit:             { beginner: [3, '12'], intermediate: [3, '12'], advanced: [4, '12'] },
      athletic_performance: { beginner: [3, '8'],  intermediate: [4, '8'],  advanced: [5, '6']  },
    };
    const [targetSets, targetReps] = volumeMap[fitnessFocus]?.[fitnessLevel] ?? [3, '10'];

    // ── Classify exercises ────────────────────────────────────────
    const COMPOUND = new Set([
      'Barbell Bench Press', 'Incline Dumbbell Press', 'Dumbbell Floor Press',
      'Push-Up (Wide Grip)', 'Push-Up to Side Plank', 'Decline Bench Press',
      'Deadlift', 'Pull-Up', 'Lat Pulldown', 'Dumbbell Bent-Over Row (Palms In)',
      'Seated Cable Row', 'T-Bar Row', 'TRX Row',
      'Overhead Barbell Press', 'Arnold Press',
      'Barbell Back Squat', 'Leg Press', 'Romanian Deadlift',
      'Reverse Lunge Crossover', 'Bulgarian Split Squat', 'Hip Thrust', 'Hack Squat',
      'Kettlebell Swing', 'Burpee', 'Dumbbell Thrusters', 'Box Jump',
      'Battle Rope Waves', 'Sandbag Clean & Press',
    ]);

    // Explosive / HIIT-style (great for fat loss & athletic performance)
    const EXPLOSIVE = new Set([
      'Kettlebell Swing', 'Box Jump', 'Burpee',
      'Dumbbell Thrusters', 'Battle Rope Waves', 'Sandbag Clean & Press',
    ]);

    // ── Step 1: Filter pool by equipment ─────────────────────────
    let pool = [...EXERCISE_POOL];
    if (equipment.length > 0) {
      const withEquip = pool.filter(
        (e) => e.equipment.length === 0 || e.equipment.some((eq) => equipment.includes(eq)),
      );
      if (withEquip.length >= Math.min(count, 3)) pool = withEquip;
    } else {
      const bw = pool.filter((e) => e.equipment.length === 0);
      if (bw.length >= 3) pool = bw;
    }

    // ── Step 2: Focus-specific muscle & exercise selection ────────
    let selected: SessionExercise[] = [];

    if (fitnessFocus === 'strength_training') {
      // Only the big compound lifts — no isolation
      const compPool = pool.filter((e) => COMPOUND.has(e.name));
      const usable = compPool.length >= count ? compPool : pool;
      selected = usable.sort(() => 0.5 - Math.random()).slice(0, count);

    } else if (fitnessFocus === 'muscle_gain') {
      // 60% compounds for growth stimulus, 40% isolation for detail work
      // Target all major muscle groups
      const musclePriority = ['chest', 'upperBack', 'shoulders', 'quads', 'glutes', 'hamstrings', 'biceps', 'triceps'];
      const focusPool = pool.filter((e) => e.muscles.some((m) => musclePriority.includes(m)));
      const usable = focusPool.length >= count ? focusPool : pool;
      const compounds = usable.filter((e) => COMPOUND.has(e.name)).sort(() => 0.5 - Math.random());
      const isolation = usable.filter((e) => !COMPOUND.has(e.name)).sort(() => 0.5 - Math.random());
      const compCount = Math.ceil(count * 0.6);
      selected = [...compounds.slice(0, compCount), ...isolation.slice(0, count - compCount)];

    } else if (fitnessFocus === 'fat_loss') {
      // Explosive / full-body first, then compound multi-joint, avoid pure isolation
      const musclePriority = ['fullBody', 'quads', 'glutes', 'chest', 'upperBack', 'core'];
      const focusPool = pool.filter((e) => e.muscles.some((m) => musclePriority.includes(m)));
      const usable = focusPool.length >= count ? focusPool : pool;
      const explosive = usable.filter((e) => EXPLOSIVE.has(e.name)).sort(() => 0.5 - Math.random());
      const compounds = usable.filter((e) => COMPOUND.has(e.name) && !EXPLOSIVE.has(e.name)).sort(() => 0.5 - Math.random());
      const other = usable.filter((e) => !COMPOUND.has(e.name)).sort(() => 0.5 - Math.random());
      selected = [...explosive, ...compounds, ...other].slice(0, count);

    } else if (fitnessFocus === 'athletic_performance') {
      // Explosive power first, then compound strength, then accessory
      const musclePriority = ['fullBody', 'quads', 'glutes', 'core', 'upperBack', 'shoulders'];
      const focusPool = pool.filter((e) => e.muscles.some((m) => musclePriority.includes(m)));
      const usable = focusPool.length >= count ? focusPool : pool;
      const explosive = usable.filter((e) => EXPLOSIVE.has(e.name)).sort(() => 0.5 - Math.random());
      const compounds = usable.filter((e) => COMPOUND.has(e.name) && !EXPLOSIVE.has(e.name)).sort(() => 0.5 - Math.random());
      const other = usable.filter((e) => !COMPOUND.has(e.name)).sort(() => 0.5 - Math.random());
      selected = [...explosive, ...compounds, ...other].slice(0, count);

    } else {
      // stay_fit: balanced — 50% compound, 50% accessory, all muscle groups
      const compounds = pool.filter((e) => COMPOUND.has(e.name)).sort(() => 0.5 - Math.random());
      const other = pool.filter((e) => !COMPOUND.has(e.name)).sort(() => 0.5 - Math.random());
      const compCount = Math.ceil(count * 0.5);
      selected = [...compounds.slice(0, compCount), ...other.slice(0, count - compCount)];
    }

    // Fallback if selection came up short
    if (selected.length < count) {
      const extras = pool
        .filter((e) => !selected.some((s) => s.name === e.name))
        .sort(() => 0.5 - Math.random());
      selected = [...selected, ...extras].slice(0, count);
    }

    // ── Step 4: Apply focus + level volume + suggested weights ───
    // Weights are a 2D lookup: [level][focus] → { equipment type → lbs }
    // Higher reps (fat loss) = lighter weight. Lower reps (strength) = heavier weight.
    type WeightSet = { Barbell: number; Dumbbells: number; Kettlebell: number; machine: number };
    const weightTable: Record<string, Record<string, WeightSet>> = {
      beginner: {
        strength_training:    { Barbell: 45,  Dumbbells: 20, Kettlebell: 26, machine: 30 },
        muscle_gain:          { Barbell: 45,  Dumbbells: 15, Kettlebell: 20, machine: 25 },
        fat_loss:             { Barbell: 35,  Dumbbells: 10, Kettlebell: 15, machine: 20 },
        stay_fit:             { Barbell: 45,  Dumbbells: 15, Kettlebell: 18, machine: 25 },
        athletic_performance: { Barbell: 45,  Dumbbells: 15, Kettlebell: 20, machine: 25 },
      },
      intermediate: {
        strength_training:    { Barbell: 135, Dumbbells: 40, Kettlebell: 44, machine: 55 },
        muscle_gain:          { Barbell: 95,  Dumbbells: 30, Kettlebell: 35, machine: 45 },
        fat_loss:             { Barbell: 65,  Dumbbells: 20, Kettlebell: 26, machine: 30 },
        stay_fit:             { Barbell: 85,  Dumbbells: 25, Kettlebell: 30, machine: 40 },
        athletic_performance: { Barbell: 115, Dumbbells: 35, Kettlebell: 40, machine: 50 },
      },
      advanced: {
        strength_training:    { Barbell: 185, Dumbbells: 60, Kettlebell: 62, machine: 90 },
        muscle_gain:          { Barbell: 155, Dumbbells: 50, Kettlebell: 53, machine: 70 },
        fat_loss:             { Barbell: 95,  Dumbbells: 30, Kettlebell: 35, machine: 50 },
        stay_fit:             { Barbell: 135, Dumbbells: 40, Kettlebell: 44, machine: 60 },
        athletic_performance: { Barbell: 165, Dumbbells: 55, Kettlebell: 57, machine: 80 },
      },
    };
    const wt: WeightSet = weightTable[fitnessLevel]?.[fitnessFocus] ?? weightTable.intermediate.muscle_gain;

    function suggestedWeight(e: SessionExercise): number | undefined {
      if (e.equipment.length === 0) return undefined; // bodyweight — no weight
      if (e.equipment.some((eq) => eq === 'Barbell')) return wt.Barbell;
      if (e.equipment.some((eq) => eq === 'Dumbbells')) return wt.Dumbbells;
      if (e.equipment.some((eq) => eq === 'Kettlebell')) return wt.Kettlebell;
      return wt.machine; // any other machine/cable
    }

    const exercises: SessionExercise[] = selected.map((e) => ({
      ...e,
      sets: targetSets,
      reps: COMPOUND.has(e.name) ? targetReps : String(Math.min(15, parseInt(targetReps) + 3) || targetReps),
      suggestedWeight: suggestedWeight(e),
    }));

    // ── Step 5: Build title ───────────────────────────────────────
    const focusTitleMap: Record<string, string> = {
      muscle_gain:          'Muscle Gain',
      strength_training:    'Strength',
      fat_loss:             'Fat Loss',
      stay_fit:             'Fitness',
      athletic_performance: 'Athletic',
    };
    const durationTitleMap: Record<string, string> = {
      '30min': '30 Min', '45min': '45 Min', '1hr': '60 Min', '1hr30min': '90 Min',
    };
    const title = `${durationTitleMap[workoutDuration] ?? ''} ${focusTitleMap[fitnessFocus] ?? 'Plan'} Workout`.trim();
    return { exercises, title };
  }

  return (
    <>
      <StatusBar style={
        screen === 'planSummary' || screen === 'planWorkoutCountdown' || screen === 'planWorkoutSession'
          ? 'light'
          : 'dark'
      } />

      {screen === 'welcome' && (
        <WelcomeScreen
          onGetStarted={() => setScreen('gender')}
          onSkipToHome={() => goHome()}
          onLogin={() => openLogin('welcome')}
        />
      )}

      {screen === 'gender' && (
        <GenderScreen
          onBack={() => setScreen('welcome')}
          onContinue={() => setScreen('age')}
        />
      )}

      {screen === 'age' && (
        <AgeScreen
          onBack={() => setScreen('gender')}
          onContinue={() => setScreen('fitnessLevel')}
        />
      )}

      {screen === 'fitnessLevel' && (
        <FitnessLevelScreen
          onBack={editingFromSummary ? doneEditing : () => setScreen('age')}
          onContinue={(level) => {
            setOnboarding(prev => ({ ...prev, fitnessLevel: level }));
            editingFromSummary ? doneEditing() : setScreen('height');
          }}
        />
      )}

      {screen === 'height' && (
        <HeightScreen
          onBack={() => setScreen('fitnessLevel')}
          onContinue={(heightCm) => {
            addMeasurementLog({ ...EMPTY_MEASUREMENTS, height: String(heightCm) });
            setScreen('socialProof');
          }}
        />
      )}

      {screen === 'socialProof' && (
        <SocialProofScreen
          onBack={() => setScreen('height')}
          onContinue={() => setScreen('featureCarousel')}
        />
      )}

      {screen === 'featureCarousel' && (
        <FeatureOnboardingCarouselScreen
          onBack={() => setScreen('socialProof')}
          onContinue={() => setScreen('workoutsPerWeek')}
        />
      )}

      {screen === 'workoutsPerWeek' && (
        <WorkoutsPerWeekScreen
          onBack={editingFromSummary ? doneEditing : () => setScreen('featureCarousel')}
          onContinue={(days) => {
            setOnboarding(prev => ({ ...prev, workoutsPerWeek: days }));
            editingFromSummary ? doneEditing() : setScreen('workoutDuration');
          }}
        />
      )}

      {screen === 'workoutDuration' && (
        <WorkoutDurationScreen
          onBack={editingFromSummary ? doneEditing : () => setScreen('workoutsPerWeek')}
          onContinue={(duration) => {
            setOnboarding(prev => ({ ...prev, workoutDuration: duration }));
            editingFromSummary ? doneEditing() : setScreen('equipment');
          }}
        />
      )}

      {screen === 'equipment' && (
        <EquipmentScreen
          initialSelected={onboarding.equipment}
          onBack={editingFromSummary ? doneEditing : () => setScreen('workoutDuration')}
          onContinue={(eq) => {
            setOnboarding(prev => ({ ...prev, equipment: eq }));
            editingFromSummary ? doneEditing() : setScreen('fitnessFocus');
          }}
        />
      )}

      {screen === 'fitnessFocus' && (
        <FitnessFocusScreen
          onBack={editingFromSummary ? doneEditing : () => setScreen('equipment')}
          onContinue={(focus) => {
            setOnboarding(prev => ({ ...prev, fitnessFocus: focus }));
            editingFromSummary ? doneEditing() : setScreen('creatingPlan');
          }}
        />
      )}

      {screen === 'creatingPlan' && (
        <CreatingPlanScreen
          onBack={() => setScreen('fitnessFocus')}
          onContinue={handleOnboardingComplete}
          isContinuing={paywallLoading}
        />
      )}

      {screen === 'planSummary' && (
        <PlanSummaryScreen
          fitnessLevel={onboarding.fitnessLevel}
          workoutsPerWeek={onboarding.workoutsPerWeek}
          workoutDuration={onboarding.workoutDuration}
          fitnessFocus={onboarding.fitnessFocus}
          equipment={onboarding.equipment}
          onClose={() => goHome()}
          onDone={() => {
            const workout = generatePlanWorkout();
            setPlanWorkoutData(workout);
            setScreen('planWorkoutCountdown');
          }}
          onEditFitnessLevel={() => editFrom('fitnessLevel')}
          onEditDays={() => editFrom('workoutsPerWeek')}
          onEditDuration={() => editFrom('workoutDuration')}
          onEditFocus={() => editFrom('fitnessFocus')}
          onEditEquipment={() => editFrom('equipment')}
        />
      )}

      {screen === 'planWorkoutCountdown' && planWorkoutData && (
        <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
          <CountdownOverlay onDone={() => setScreen('planWorkoutSession')} />
        </View>
      )}

      {screen === 'planWorkoutSession' && planWorkoutData && (
        <WorkoutSessionScreen
          exercises={planWorkoutData.exercises}
          title={planWorkoutData.title}
          onExit={() => { setPlanWorkoutData(null); goHome(); }}
          onFinished={() => { setPlanWorkoutData(null); goHome(); }}
        />
      )}

      {screen === 'home' && (
        <HomeScreen
          name={onboarding.name}
          onNameChange={handleNameChange}
          allowNamePrompt={loginGatePassed}
          fitnessLevel={onboarding.fitnessLevel}
          workoutsPerWeek={onboarding.workoutsPerWeek}
          fitnessFocus={onboarding.fitnessFocus}
          onGetStarted={() => setScreen('planSummary')}
        />
      )}

      <LoginModal
        visible={showLoginModal}
        onClose={handleLoginModalClose}
        onSuccess={handleLoginSuccess}
        title={loginModalSource === 'home' ? 'Keep your progress safe' : 'Welcome back'}
        subtitle={
          loginModalSource === 'home'
            ? 'Create an account or log in so your workouts, streaks, and achievements stay saved across devices.'
            : 'Log in to pick up right where you left off.'
        }
        allowDismiss
      />
    </>
  );
}

const onboardingProfileRef: { current: OnboardingData | undefined } = { current: undefined };

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WorkoutProvider getProfileData={() => onboardingProfileRef.current}>
          <SuperwallProvider apiKeys={superwallApiKeys}>
            <AppContent />
          </SuperwallProvider>
        </WorkoutProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
