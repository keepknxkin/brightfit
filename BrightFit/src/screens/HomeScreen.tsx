import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';
import { colors } from '@/constants';
import ProgressScreen from './ProgressScreen';
import InstantWorkoutScreen from './InstantWorkoutScreen';
import WorkoutSessionScreen, { SessionExercise } from './WorkoutSessionScreen';
import CreateRoutineScreen from './CreateRoutineScreen';
import EmptyWorkoutScreen from './EmptyWorkoutScreen';
import ExploreRoutinesScreen from './ExploreRoutinesScreen';
import AllAchievementsScreen from './AllAchievementsScreen';
import CountdownOverlay from '../components/CountdownOverlay';
import NamePromptModal from '../components/NamePromptModal';
import YouScreen from './YouScreen';
import {
  WorkoutRecord, ResumeData, ResumeSetRow, useWorkout,
  calculateStreak, bestStreak, weeklyWorkoutCount, getThisWeekWorkoutDays,
} from '../context/WorkoutContext';
import {
  ACHIEVEMENTS, computeNewAchievements, getCurrentRank,
} from '../data/achievements';
import AchievementIcon from '../components/AchievementIcon';
import AchievementToast from '../components/AchievementToast';
import type { AchievementDef } from '../data/achievements';

const { width } = Dimensions.get('window');

const TABS = ['Find', 'Planned', 'Quick ✦'];

const CATEGORIES = [
  { id: 'muscle', label: 'Muscle Gain' },
  { id: 'fat',    label: 'Fat Loss'    },
  { id: 'push',   label: 'Push/Pull'  },
  { id: 'abs',    label: 'Abs'        },
  { id: 'cardio', label: 'Cardio'     },
];

function CategorySvgIcon({ id, color, size = 28 }: { id: string; color: string; size?: number }) {
  switch (id) {
    case 'muscle':
      // Trophy
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M6 3h12v8a6 6 0 01-12 0V3z" fill={color} />
          <Path
            d="M6 5H3.5a2.5 2.5 0 000 5H6M18 5h2.5a2.5 2.5 0 010 5H18"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <Rect x="10" y="17" width="4" height="3" rx="0.5" fill={color} />
          <Rect x="8"  y="20" width="8" height="2" rx="1"   fill={color} />
        </Svg>
      );
    case 'fat':
      // Flame
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 2C10 6 7 9.5 7 13.5C7 17.09 9.24 20 12 20C14.76 20 17 17.09 17 13.5C17 9.5 14 6 12 2Z"
            fill={color}
          />
          <Path
            d="M12 9.5C11 11.5 10.5 12.5 10.5 14.5C10.5 16.43 11.17 18 12 18C12.83 18 13.5 16.43 13.5 14.5C13.5 12.5 13 11.5 12 9.5Z"
            fill="#0B0B0F"
            opacity={0.4}
          />
        </Svg>
      );
    case 'push':
      // Opposing arrows (push ← | → pull)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 8L1 12l3 4M1 12h10"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M20 8l3 4-3 4M23 12H13"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'abs':
      // Lightning bolt
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M13 2L4 14H11L10 22L20 10H13L13 2Z" fill={color} />
        </Svg>
      );
    case 'cardio':
      // Heartbeat / pulse
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M2 12h3.5l2-6.5 4.5 13 2.5-8.5L17 12h5"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    default:
      return null;
  }
}

const BOTTOM_TABS = [
  { label: 'You'      },
  { label: 'Workout'  },
  { label: 'Progress' },
];

function BottomTabIcon({ index, color, size = 24 }: { index: number; color: string; size?: number }) {
  switch (index) {
    case 0: // You — person silhouette
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
          <Path
            d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      );
    case 1: // Workout — dumbbell
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="1"    y="9"    width="3"   height="7"  rx="1.5" fill={color} />
          <Rect x="4"    y="10.5" width="2.5" height="4"  rx="0.5" fill={color} />
          <Rect x="6.5"  y="11.5" width="11"  height="2"  rx="1"   fill={color} />
          <Rect x="17.5" y="10.5" width="2.5" height="4"  rx="0.5" fill={color} />
          <Rect x="20"   y="9"    width="3"   height="7"  rx="1.5" fill={color} />
        </Svg>
      );
    case 2: // Progress — trending up
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M2 18L7 12L11 15.5L17 7L22 11"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M17 7h5v5"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    default:
      return null;
  }
}

const STREAK_DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function StreakWidget({ history, workoutsPerWeek }: { history: WorkoutRecord[]; workoutsPerWeek: string }) {
  const streak = calculateStreak(history);
  const best = bestStreak(history);
  const weekCount = weeklyWorkoutCount(history);
  const weekGoal = parseInt(workoutsPerWeek, 10) || 3;
  const weekDays = getThisWeekWorkoutDays(history);
  const today = new Date().getDay();
  const weekProgress = Math.min(weekCount / weekGoal, 1);

  return (
    <View style={styles.streakWidget}>
      <View style={styles.streakWidgetGlow} />

      {/* Top row: flame + streak + weekly fraction */}
      <View style={styles.streakWidgetTop}>
        <View style={styles.streakWidgetLeft}>
          <Svg width={28} height={28} viewBox="0 0 24 24">
            <Path d="M12 2C10 6 7 9.5 7 13.5C7 17.09 9.24 20 12 20C14.76 20 17 17.09 17 13.5C17 9.5 14 6 12 2Z" fill={colors.primaryGold} />
            <Path d="M12 9.5C11 11.5 10.5 12.5 10.5 14.5C10.5 16.43 11.17 18 12 18C12.83 18 13.5 16.43 13.5 14.5C13.5 12.5 13 11.5 12 9.5Z" fill="#0B0B0F" opacity={0.4} />
          </Svg>
          <Text style={styles.streakWidgetNum}>{streak}</Text>
          <Text style={styles.streakWidgetLabel}>day streak</Text>
          {best > 0 && streak === best && (
            <View style={styles.streakWidgetBest}>
              <Text style={styles.streakWidgetBestText}>BEST</Text>
            </View>
          )}
        </View>
        <View style={styles.streakWidgetRight}>
          <Text style={styles.streakWidgetWeekNum}>{weekCount}<Text style={styles.streakWidgetWeekGoal}>/{weekGoal}</Text></Text>
          <Text style={styles.streakWidgetWeekLabel}>this week</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.streakProgressTrack}>
        <View style={[styles.streakProgressFill, { width: `${weekProgress * 100}%` }]} />
      </View>

      {/* Day dots */}
      <View style={styles.streakDayRow}>
        {STREAK_DAY_LABELS.map((d, i) => {
          const isToday = i === today;
          const done = weekDays[i];
          const isFuture = i > today;
          return (
            <View key={i} style={styles.streakDayCol}>
              <Text style={[styles.streakDayLabel, isToday && { color: colors.primaryGold }]}>{d}</Text>
              <View style={[
                styles.streakDayDot,
                done && styles.streakDayDotDone,
                isToday && !done && styles.streakDayDotToday,
                isFuture && { opacity: 0.35 },
              ]}>
                {done && (
                  <Svg width={8} height={8} viewBox="0 0 24 24" fill="none">
                    <Path d="M5 12l5 5L19 7" stroke="#0B0B0F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const FOCUS_LABELS: Record<string, string> = {
  muscle_gain:          'Muscle Gain',
  strength_training:    'Strength',
  fat_loss:             'Fat Loss',
  stay_fit:             'Stay Fit',
  athletic_performance: 'Athletic',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const DAYS_LABELS: Record<string, string> = {
  '1': '1 Day/Wk',
  '2': '2 Days/Wk',
  '3': '3 Days/Wk',
  '4': '4 Days/Wk',
  '5': '5 Days/Wk',
  '6': '6 Days/Wk',
  '7': 'Every Day',
};

interface HomeScreenProps {
  name?: string;
  onNameChange?: (name: string) => void;
  onSignIn?: () => void;
  allowNamePrompt?: boolean;
  onGetStarted?: () => void;
  fitnessLevel?: string;
  workoutsPerWeek?: string;
  fitnessFocus?: string;
}

export default function HomeScreen({ name = '', onNameChange, onSignIn, allowNamePrompt = true, onGetStarted, fitnessLevel = '', workoutsPerWeek = '', fitnessFocus = '' }: HomeScreenProps) {
  const displayName = name.trim();
  const showNamePrompt = allowNamePrompt && !displayName;
  const [activeTab, setActiveTab] = useState(0);
  const [activeBottomTab, setActiveBottomTab] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [plannedView, setPlannedView] = useState<'landing' | 'create-routine' | 'empty-workout' | 'explore-routines'>('landing');
  const [activeSession, setActiveSession] = useState<{
    exercises: SessionExercise[];
    title: string;
    initialSetData?: ResumeSetRow[][];
    initialExIdx?: number;
    initialElapsed?: number;
  } | null>(null);
  const [pendingSession, setPendingSession] = useState<{
    exercises: SessionExercise[];
    title: string;
  } | null>(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const { history, routines, deleteRoutine, earnedAchievements, addEarnedAchievements } = useWorkout();

  const [toastQueue, setToastQueue] = useState<AchievementDef[]>([]);
  const currentToast = toastQueue[0] ?? null;

  const handleToastDone = () => setToastQueue(prev => prev.slice(1));

  // Derived rank info for Achievements section
  const completedCount = history.filter(r => r.completed).length;
  const { rank: currentRank, next: nextRank, progress: rankProgress } = getCurrentRank(completedCount);

  const pagerRef = useRef<ScrollView>(null);

  const syncTabFromPager = useCallback((offsetX: number) => {
    const clamped = Math.max(0, Math.min(TABS.length - 1, Math.round(offsetX / width)));
    setActiveTab(clamped);
    if (clamped !== 1) setPlannedView('landing');
  }, []);

  const handlePagerScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncTabFromPager(e.nativeEvent.contentOffset.x);
  }, [syncTabFromPager]);

  const handleTopTabPress = useCallback((index: number) => {
    setActiveTab(index);
    if (index !== 1) setPlannedView('landing');
    pagerRef.current?.scrollTo({ x: index * width, animated: true });
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      pagerRef.current?.scrollTo({ x: activeTab * width, animated: false });
    });
  }, []);

  // Spring-scale the active top tab whenever it changes
  const tabScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    tabScale.setValue(0.85);
    Animated.spring(tabScale, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabScale]);

  const namePrompt = (
    <NamePromptModal
      visible={showNamePrompt}
      onSubmit={(value) => onNameChange?.(value)}
      onSignIn={onSignIn}
    />
  );

  // ── Active workout session — full screen takeover ─────────
  if (activeSession) {
    return (
      <WorkoutSessionScreen
        exercises={activeSession.exercises}
        title={activeSession.title}
        initialSetData={activeSession.initialSetData}
        initialExIdx={activeSession.initialExIdx}
        initialElapsed={activeSession.initialElapsed}
        onExit={() => setActiveSession(null)}
        onFinished={(_record: WorkoutRecord) => {
          const updatedHistory = [_record, ...history];
          const newOnes = computeNewAchievements(updatedHistory, earnedAchievements);
          if (newOnes.length > 0) {
            addEarnedAchievements(newOnes.map(a => a.id));
            setToastQueue(newOnes);
          }
          setActiveSession(null);
          setActiveBottomTab(2);
        }}
      />
    );
  }

  // ── Planned-tab sub-views — full screen takeover ──────────
  if (activeTab === 1 && plannedView === 'explore-routines') {
    return (
      <ExploreRoutinesScreen
        onBack={() => setPlannedView('landing')}
        onStart={(exercises, title) => {
          setPlannedView('landing');
          setPendingSession({ exercises, title });
        }}
      />
    );
  }

  if (activeTab === 1 && plannedView === 'create-routine') {
    return <CreateRoutineScreen onCancel={() => setPlannedView('landing')} onSave={() => setPlannedView('landing')} />;
  }
  if (activeTab === 1 && plannedView === 'empty-workout') {
    return (
      <EmptyWorkoutScreen
        onExit={() => setPlannedView('landing')}
        onFinish={() => setPlannedView('landing')}
        onStartWorkout={(exercises, title) => {
          setPlannedView('landing');
          setPendingSession({ exercises, title });
        }}
      />
    );
  }

  if (showAllAchievements) {
    return <AllAchievementsScreen onBack={() => setShowAllAchievements(false)} />;
  }

  const bottomBar = (
    <View style={styles.bottomBar}>
      {BOTTOM_TABS.map((tab, i) => {
        const isActive = i === activeBottomTab;
        return (
          <TouchableOpacity
            key={i}
            style={styles.bottomTab}
            activeOpacity={0.7}
            onPress={() => setActiveBottomTab(i)}
          >
            <BottomTabIcon index={i} color={isActive ? colors.primaryGold : '#555568'} size={24} />
            <Text style={[styles.bottomLabel, isActive && styles.bottomLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (activeBottomTab === 0) {
    return (
      <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
        <YouScreen
          name={name}
          workoutsPerWeek={workoutsPerWeek}
          fitnessLevel={fitnessLevel}
          fitnessFocus={fitnessFocus}
        />
        {bottomBar}
      </SafeAreaView>
      {namePrompt}
      </>
    );
  }

  if (activeBottomTab === 2) {
    return (
      <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
        <ProgressScreen
          name={displayName}
          workoutsPerWeek={workoutsPerWeek}
          onResumeWorkout={(data: ResumeData) => {
            setActiveSession({
              exercises: data.exercises,
              title: data.title,
              initialSetData: data.setData,
              initialExIdx: data.exIdx,
              initialElapsed: data.elapsed,
            });
          }}
        />
        {bottomBar}
      </SafeAreaView>
      {namePrompt}
      </>
    );
  }

  return (
    <View style={{ flex: 1 }}>
    <SafeAreaView style={styles.container}>

      {/* ── Header ─────────────────────────────────── */}
      {activeTab !== 2 && (
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.tagline}>
              {displayName ? `Let's get moving ${displayName}!` : "Let's get moving!"}
            </Text>
          </View>
        </View>
      )}

      {/* ── Top tabs ───────────────────────────────── */}
      <View style={styles.tabRowWrap}>
      <View style={styles.tabRow}>
        {TABS.map((tab, i) => {
          const isActive = i === activeTab;
          return (
            <TouchableOpacity
              key={i}
              style={styles.tabItem}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 10, right: 10 }}
              onPress={() => handleTopTabPress(i)}
            >
              <Animated.Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                  isActive && { transform: [{ scale: tabScale }] },
                ]}
              >
                {tab}
              </Animated.Text>
              {isActive && (
                <Animated.View
                  style={[styles.tabUnderline, { transform: [{ scaleX: tabScale }] }]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      </View>

      {/* ── Tab content (swipeable pages) ───────────── */}
      <View style={styles.tabContent}>
        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handlePagerScrollEnd}
          onScrollEndDrag={handlePagerScrollEnd}
          style={styles.tabPager}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {/* ── Find ─────────────────────────────────── */}
          <View style={[styles.tabPage, { width }]}>
            <ScrollView
              style={styles.tabScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scroll}
              nestedScrollEnabled
            >

        {/* ── For You ────────────────────────────────── */}
        <Text style={styles.sectionTitle}>For You</Text>

        {/* Hero plan card */}
        <View style={styles.heroCard}>
          {/* Decorative muscular arms */}
          <View style={styles.heroDumbbell1}>
            <Svg width={170} height={120} viewBox="0 0 80 56">
              {/* Arm silhouette — fist left, bicep peak top-right */}
              <Path
                d="M 14 17 C 16 15 19 14 21 16 L 40 18 C 44 13 51 7 59 5 C 65 3 71 8 75 17 C 79 26 77 37 71 44 C 65 51 54 55 44 53 L 28 51 C 21 49 17 47 14 46 L 6 46 C 2 46 0 44 0 40 L 0 26 C 0 22 2 18 6 16 C 9 15 11 15 14 17 Z"
                fill={colors.primaryGold}
              />
              {/* Muscle groove — bicep inner curve */}
              <Path
                d="M 22 28 C 26 22 32 18 40 18"
                stroke="#C07800"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                opacity={0.55}
              />
              {/* Forearm shadow line */}
              <Path
                d="M 21 40 C 28 42 34 43 40 42"
                stroke="#C07800"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                opacity={0.4}
              />
            </Svg>
          </View>
          <View style={styles.heroDumbbell2}>
            <Svg width={112} height={80} viewBox="0 0 80 56">
              {/* Mirrored arm — fist right, bicep peak top-left */}
              <G transform="translate(80, 0) scale(-1, 1)">
                <Path
                  d="M 14 17 C 16 15 19 14 21 16 L 40 18 C 44 13 51 7 59 5 C 65 3 71 8 75 17 C 79 26 77 37 71 44 C 65 51 54 55 44 53 L 28 51 C 21 49 17 47 14 46 L 6 46 C 2 46 0 44 0 40 L 0 26 C 0 22 2 18 6 16 C 9 15 11 15 14 17 Z"
                  fill={colors.primaryGold}
                />
                <Path
                  d="M 22 28 C 26 22 32 18 40 18"
                  stroke="#C07800"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.55}
                />
                <Path
                  d="M 21 40 C 28 42 34 43 40 42"
                  stroke="#C07800"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.4}
                />
              </G>
            </Svg>
          </View>

          <Text style={styles.heroBadge}>My Plan</Text>
          <Text style={styles.heroTitle}>Your Fitness Plan</Text>
          <Text style={styles.heroSubtitle}>Personalized program built for you</Text>

          {/* Stats row */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{FOCUS_LABELS[fitnessFocus] ?? 'Your Goal'}</Text>
              <Text style={styles.heroStatLabel}>Goal</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{DAYS_LABELS[workoutsPerWeek] ?? 'Days/Wk'}</Text>
              <Text style={styles.heroStatLabel}>Frequency</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{LEVEL_LABELS[fitnessLevel] ?? 'Level'}</Text>
              <Text style={styles.heroStatLabel}>Level</Text>
            </View>
          </View>

          {/* Get Started button */}
          <TouchableOpacity style={styles.heroButton} activeOpacity={0.85} onPress={onGetStarted}>
            <Text style={styles.heroButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        {/* ── Streak widget ───────────────────────────── */}
        <StreakWidget history={history} workoutsPerWeek={workoutsPerWeek} />

        {/* ── Achievements ────────────────────────────── */}
        <View style={styles.achieveHeaderRow}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setShowAllAchievements(true)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Rank card */}
        <View style={[styles.rankCard, { borderColor: currentRank.color + '50' }]}>
          {/* Glow blob */}
          <View style={[styles.rankGlow, { backgroundColor: currentRank.color }]} />

          <View style={[styles.rankIconRing, { borderColor: currentRank.color, backgroundColor: currentRank.color + '18' }]}>
            <AchievementIcon iconKey={currentRank.iconKey} color={currentRank.color} size={42} />
          </View>

          <View style={styles.rankInfo}>
            <Text style={styles.rankLabel}>CURRENT RANK</Text>
            <Text style={[styles.rankName, { color: currentRank.color }]}>
              {currentRank.name.toUpperCase()}
            </Text>
            {nextRank ? (
              <>
                <Text style={styles.rankSubtitle}>
                  {nextRank.minWorkouts - completedCount} workouts to{' '}
                  <Text style={{ color: nextRank.color }}>{nextRank.name}</Text>
                </Text>
                <View style={styles.rankProgressTrack}>
                  <View
                    style={[
                      styles.rankProgressFill,
                      { width: `${rankProgress * 100}%`, backgroundColor: currentRank.color },
                    ]}
                  />
                </View>
                <Text style={styles.rankProgressLabel}>
                  {completedCount - currentRank.minWorkouts}/{nextRank.minWorkouts - currentRank.minWorkouts} workouts
                </Text>
              </>
            ) : (
              <Text style={styles.rankSubtitle}>Legendary status achieved ✦</Text>
            )}
          </View>
        </View>

        {/* Achievement badges — horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgesScroll}
          nestedScrollEnabled
        >
          {ACHIEVEMENTS.map(achievement => {
            const isEarned = earnedAchievements.includes(achievement.id);
            return (
              <View key={achievement.id} style={styles.badgeItem}>
                <View
                  style={[
                    styles.badgeCircle,
                    isEarned
                      ? { borderColor: achievement.color, backgroundColor: achievement.color + '18' }
                      : { borderColor: '#252530', backgroundColor: '#111116' },
                  ]}
                >
                  <AchievementIcon
                    iconKey={achievement.iconKey}
                    color={isEarned ? achievement.color : '#3A3A4A'}
                    size={26}
                  />
                  {!isEarned && (
                    <View style={styles.badgeLock}>
                      <Svg width={8} height={8} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M8 11V7a4 4 0 018 0v4"
                          stroke="#555568"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <Path d="M4 11h16v11a1 1 0 01-1 1H5a1 1 0 01-1-1V11z" fill="#555568" />
                      </Svg>
                    </View>
                  )}
                  {isEarned && (
                    <View style={[styles.badgeEarnedDot, { backgroundColor: achievement.color }]} />
                  )}
                </View>
                <Text
                  style={[styles.badgeLabel, isEarned && { color: '#CCCCDD' }]}
                  numberOfLines={2}
                >
                  {achievement.title}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={{ height: 28 }} />
            </ScrollView>
          </View>

          {/* ── Planned ──────────────────────────────── */}
          <View style={[styles.tabPage, { width }]}>
        <ScrollView
          style={styles.tabScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          nestedScrollEnabled
        >
          <View style={styles.workoutHeader}>
            <Text style={styles.workoutTitle}>Workout</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.workoutChevron} hitSlop={10}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M6 9l6 6 6-6"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.startEmptyButton}
            activeOpacity={0.85}
            onPress={() => setPlannedView('empty-workout')}
          >
            <Text style={styles.startEmptyPlus}>+</Text>
            <Text style={styles.startEmptyText}>Start Empty Workout</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Routines</Text>

          <View style={styles.routineRow}>
            <TouchableOpacity
              style={styles.routineCard}
              activeOpacity={0.85}
              onPress={() => setPlannedView('create-routine')}
            >
              <View style={styles.routineIconWrap}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 4h6a1 1 0 011 1v1h1.5A1.5 1.5 0 0119 7.5v13A1.5 1.5 0 0117.5 22h-11A1.5 1.5 0 015 20.5v-13A1.5 1.5 0 016.5 6H8V5a1 1 0 011-1z"
                    stroke={colors.primaryGold}
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M9 11h6M9 15h4"
                    stroke={colors.primaryGold}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
              <Text style={styles.routineCardLabel}>New Routine</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.routineCard} activeOpacity={0.85} onPress={() => setPlannedView('explore-routines')}>
              <View style={styles.routineIconWrap}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Circle cx="11" cy="11" r="6" stroke={colors.primaryGold} strokeWidth="1.8" />
                  <Path
                    d="M16 16l4 4"
                    stroke={colors.primaryGold}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
              <Text style={styles.routineCardLabel}>Explore Routines</Text>
            </TouchableOpacity>
          </View>

          {/* Saved Routines */}
          {routines.length > 0 && (
            <View style={{ marginTop: 28 }}>
              <View style={styles.savedHeader}>
                <Text style={styles.sectionTitle}>My Routines</Text>
                <Text style={styles.savedCount}>{routines.length}</Text>
              </View>
              {routines.map((r) => {
                const setsTotal = r.exercises.reduce((s, ex) => s + ex.sets, 0);
                const muscles = [
                  ...new Set(
                    r.exercises.flatMap((ex) => ex.muscles),
                  ),
                ].slice(0, 3);
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.savedRoutineCard}
                    activeOpacity={0.85}
                    onPress={() =>
                      setPendingSession({
                        exercises: r.exercises as SessionExercise[],
                        title: r.title,
                      })
                    }
                    onLongPress={() => deleteRoutine(r.id)}
                  >
                    <View style={styles.savedRoutineIcon}>
                      <Svg width={22} height={22} viewBox="0 0 24 24">
                        <Rect x="1"  y="8"  width="3"  height="8" rx="1.5" fill={colors.primaryGold} />
                        <Rect x="4"  y="10" width="3"  height="4" rx="0.5" fill={colors.primaryGold} />
                        <Rect x="7"  y="11" width="10" height="2" rx="1"   fill={colors.primaryGold} />
                        <Rect x="17" y="10" width="3"  height="4" rx="0.5" fill={colors.primaryGold} />
                        <Rect x="20" y="8"  width="3"  height="8" rx="1.5" fill={colors.primaryGold} />
                      </Svg>
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={styles.savedRoutineTitle} numberOfLines={1}>
                        {r.title}
                      </Text>
                      <Text style={styles.savedRoutineMeta} numberOfLines={1}>
                        {r.exercises.length} ex · {setsTotal} sets
                        {muscles.length > 0 ? ` · ${muscles.join(', ')}` : ''}
                      </Text>
                    </View>
                    <View style={styles.savedRoutinePlay}>
                      <Svg width={14} height={14} viewBox="0 0 24 24">
                        <Path d="M8 5v14l11-7L8 5z" fill="#0B0B0F" />
                      </Svg>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <Text style={styles.savedHint}>Long-press a routine to delete it.</Text>
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
          </View>

          {/* ── Quick ────────────────────────────────── */}
          <View style={[styles.tabPage, { width }]}>
            <InstantWorkoutScreen
              onStartWorkout={(exercises, title) =>
                setActiveSession({ exercises, title })
              }
            />
          </View>
        </ScrollView>
      </View>

      {/* ── Bottom tab bar ─────────────────────────── */}
      {bottomBar}

    </SafeAreaView>

    {/* ── 3-2-1 countdown before any non-instant workout ── */}
    {pendingSession && (
      <CountdownOverlay
        onDone={() => {
          setActiveSession(pendingSession);
          setPendingSession(null);
        }}
      />
    )}

    {/* ── Achievement toast overlay ── */}
    {currentToast && (
      <AchievementToast
        key={currentToast.id}
        achievement={currentToast}
        onDone={handleToastDone}
      />
    )}

    {namePrompt}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },

  // ── Header ─────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#0B0B0F',
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9999AA',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  // ── Top tabs ────────────────────────────────────
  tabRowWrap: {
    zIndex: 10,
    elevation: 10,
    backgroundColor: '#0B0B0F',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#0B0B0F',
    borderBottomWidth: 1,
    borderBottomColor: '#252530',
    gap: 36,
  },
  tabContent: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  tabPager: {
    flex: 1,
  },
  tabPage: {
    flex: 1,
    minHeight: 0,
  },
  tabScroll: {
    flex: 1,
  },
  tabItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#555568',
    letterSpacing: -0.2,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    right: 4,
    height: 3,
    backgroundColor: colors.primaryGold,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // ── Scroll ──────────────────────────────────────
  scroll: {
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 28,
  },

  // ── Hero card ───────────────────────────────────
  heroCard: {
    width: '100%',
    backgroundColor: '#141418',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#252530',
    padding: 24,
    overflow: 'hidden',
    marginBottom: 28,
    gap: 6,
  },
  heroDumbbell1: {
    position: 'absolute',
    top: -18,
    right: -30,
    opacity: 0.2,
    transform: [{ rotate: '-28deg' }],
  },
  heroDumbbell2: {
    position: 'absolute',
    bottom: -20,
    left: -22,
    opacity: 0.14,
    transform: [{ rotate: '22deg' }],
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryGold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9999AA',
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  heroStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: '#555568',
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#252530',
  },
  heroButton: {
    backgroundColor: colors.primaryGold,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
  },
  heroButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B0B0F',
    letterSpacing: 0.2,
  },

  // ── Planned tab — Workout / Routines ───────────
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  workoutChevron: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#141418',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#252530',
  },
  startEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#141418',
    borderWidth: 1,
    borderColor: '#252530',
    paddingVertical: 16,
    borderRadius: 14,
  },
  startEmptyPlus: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryGold,
    lineHeight: 20,
  },
  startEmptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  routineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  routineCard: {
    flex: 1,
    backgroundColor: '#141418',
    borderWidth: 1,
    borderColor: '#252530',
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  routineIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,184,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineCardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  savedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  savedCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9999AA',
    backgroundColor: '#1C1C22',
    borderWidth: 1,
    borderColor: '#252530',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  savedRoutineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#141418',
    borderWidth: 1,
    borderColor: '#252530',
    marginBottom: 10,
  },
  savedRoutineIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,184,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.25)',
  },
  savedRoutineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  savedRoutineMeta: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9999AA',
  },
  savedRoutinePlay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedHint: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '500',
    color: '#555568',
    textAlign: 'center',
  },

  // ── Streak widget ────────────────────────────────
  streakWidget: {
    backgroundColor: '#141418',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.25)',
    padding: 16,
    marginBottom: 28,
    overflow: 'hidden',
  },
  streakWidgetGlow: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: colors.primaryGold, opacity: 0.05,
    top: -60, right: -30,
  },
  streakWidgetTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  streakWidgetLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakWidgetNum: { fontSize: 32, fontWeight: '900', color: colors.primaryGold, letterSpacing: -1 },
  streakWidgetLabel: { fontSize: 12, fontWeight: '600', color: '#9999AA' },
  streakWidgetBest: {
    backgroundColor: 'rgba(255,184,0,0.15)', borderRadius: 5,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(255,184,0,0.3)',
  },
  streakWidgetBestText: { fontSize: 9, fontWeight: '800', color: colors.primaryGold, letterSpacing: 0.8 },
  streakWidgetRight: { alignItems: 'flex-end' },
  streakWidgetWeekNum: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  streakWidgetWeekGoal: { fontSize: 16, fontWeight: '500', color: '#555568' },
  streakWidgetWeekLabel: { fontSize: 11, fontWeight: '500', color: '#555568' },
  streakProgressTrack: {
    height: 5, backgroundColor: '#252530',
    borderRadius: 3, overflow: 'hidden', marginBottom: 14,
  },
  streakProgressFill: {
    height: '100%', backgroundColor: colors.primaryGold,
    borderRadius: 3, minWidth: 6,
  },
  streakDayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  streakDayCol: { alignItems: 'center', gap: 5 },
  streakDayLabel: { fontSize: 10, fontWeight: '700', color: '#555568' },
  streakDayDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#252530',
    alignItems: 'center', justifyContent: 'center',
  },
  streakDayDotDone: { backgroundColor: colors.primaryGold },
  streakDayDotToday: { borderWidth: 2, borderColor: colors.primaryGold, backgroundColor: 'transparent' },

  // ── Achievements ─────────────────────────────────
  achieveHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryGold,
  },

  // Rank card
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141418',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  rankGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -50,
    right: -40,
    opacity: 0.07,
  },
  rankIconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankInfo: {
    flex: 1,
    gap: 3,
  },
  rankLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#555568',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  rankName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 1,
  },
  rankSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#9999AA',
    marginTop: 2,
  },
  rankProgressTrack: {
    height: 5,
    backgroundColor: '#252530',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  rankProgressFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 6,
  },
  rankProgressLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#555568',
    marginTop: 4,
  },

  // Achievement badge scroll
  badgesScroll: {
    paddingBottom: 4,
    paddingRight: 8,
    gap: 10,
  },
  badgeItem: {
    width: 68,
    alignItems: 'center',
    gap: 7,
  },
  badgeCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLock: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1C1C22',
    borderWidth: 1,
    borderColor: '#252530',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEarnedDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 2,
    borderColor: '#0B0B0F',
  },
  badgeLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#444455',
    textAlign: 'center',
    lineHeight: 13,
  },

  // ── Bottom bar ──────────────────────────────────
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#111116',
    borderTopWidth: 1,
    borderTopColor: '#252530',
    paddingBottom: 8,
    paddingTop: 10,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  bottomLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#555568',
  },
  bottomLabelActive: {
    fontWeight: '700',
    color: colors.primaryGold,
  },
});
