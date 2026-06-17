import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  DevSettings,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import Body, { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';
import ExerciseIcon from '../components/ExerciseIcon';
import {
  useWorkout,
  buildMuscleStatusMap,
  MuscleStatus,
  weeklyVolume,
  weeklyMinutes,
  workoutDates,
  totalIronPoints,
  getCurrentMeasurements,
  calculateStreak,
  weeklyWorkoutCount,
  ResumeData,
  BodyMeasurements,
} from '../context/WorkoutContext';
import ProgressIndexScreen from './ProgressIndexScreen';
import VolumeDetailScreen from './VolumeDetailScreen';
import WorkoutTimeDetailScreen from './WorkoutTimeDetailScreen';
import { EMPTY_MEASUREMENTS } from '@/types/workout';
import { getJson, setJson, STORAGE_KEYS } from '@/utils/storage';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Color tokens ─────────────────────────────────────────────
const C = {
  bg: '#0B0B0F',
  surface: '#141418',
  surfaceRaised: '#1C1C22',
  border: '#252530',
  gold: '#FFB800',
  goldDeep: '#D89200',
  goldDim: 'rgba(255,184,0,0.12)',
  goldDimMid: 'rgba(255,184,0,0.22)',
  white: '#FFFFFF',
  muted: '#9999AA',
  dimmed: '#555568',
  green: '#4CAF7D',
  // anatomy
  bodyBase: '#252535',
  muscleDefault: '#42425A',
  muscleFatigued: '#B87800',   // BrightFit yellow (muted for body fill)
  muscleImproved: '#1A5C35',   // green for improvement
  muscleLine: '#18181F',
};

const TABS = ['Overview', 'Body', 'Activity'] as const;
type Tab = typeof TABS[number];

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const today = new Date();
const todayDate = today.getDate();

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

interface MuscleMap { [key: string]: MuscleStatus }

// Map our internal muscle keys → library slugs (front view)
const FRONT_SLUG_MAP: Record<string, Slug> = {
  deltoids:   'deltoids',
  chest:      'chest',
  biceps:     'biceps',
  forearms:   'forearm',
  abs:        'abs',
  obliques:   'obliques',
  hipFlexors: 'adductors',
  quads:      'quadriceps',
  calves:     'tibialis',
};

// Map our internal muscle keys → library slugs (back view)
const BACK_SLUG_MAP: Record<string, Slug> = {
  traps:       'trapezius',
  rearDeltoid: 'deltoids',
  triceps:     'triceps',
  forearms:    'forearm',
  lats:        'upper-back',
  lowerBack:   'lower-back',
  glutes:      'gluteal',
  hamstrings:  'hamstring',
  calves:      'calves',
};

function buildBodyData(
  muscles: MuscleMap,
  slugMap: Record<string, Slug>,
): ExtendedBodyPart[] {
  const data: ExtendedBodyPart[] = [];
  for (const [key, state] of Object.entries(muscles)) {
    const slug = slugMap[key];
    if (!slug || state === 'fresh') continue;
    // intensity 1 = fatigued (yellow), intensity 2 = improved (green)
    data.push({ slug, intensity: state === 'improved' ? 2 : 1 });
  }
  return data;
}

// ─────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────
interface ProgressScreenProps {
  name?: string;
  onResumeWorkout?: (data: ResumeData) => void;
  workoutsPerWeek?: string;
}

export default function ProgressScreen({ name = '', onResumeWorkout, workoutsPerWeek = '' }: ProgressScreenProps) {
  const displayName = name.trim() || 'brightfit';
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [showReviewBanner, setShowReviewBanner] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewDescription, setReviewDescription] = useState('');
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [showProgressIndex, setShowProgressIndex] = useState(false);
  const [showVolumeDetail, setShowVolumeDetail] = useState(false);
  const [showWorkoutTimeDetail, setShowWorkoutTimeDetail] = useState(false);
  const [draft, setDraft] = useState<BodyMeasurements>(EMPTY_MEASUREMENTS);

  // ── Live stats from WorkoutContext ────────────────────────
  const { history, measurementLogs, addMeasurementLog, profilePhotoUri, setProfilePhoto } = useWorkout();

  const pickProfilePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to set your profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0].uri);
    }
  }, [setProfilePhoto]);

  const takeProfilePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take a profile photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0].uri);
    }
  }, [setProfilePhoto]);

  const promptChangeProfilePhoto = useCallback(() => {
    const options: { text: string; style?: 'cancel' | 'destructive' | 'default'; onPress?: () => void }[] = [
      { text: 'Take Photo', onPress: () => { void takeProfilePhoto(); } },
      { text: 'Choose from Library', onPress: () => { void pickProfilePhoto(); } },
    ];
    if (profilePhotoUri) {
      options.push({
        text: 'Remove Photo',
        style: 'destructive',
        onPress: () => setProfilePhoto(null),
      });
    }
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Profile Photo', 'Update your profile picture.', options);
  }, [profilePhotoUri, pickProfilePhoto, takeProfilePhoto, setProfilePhoto]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [savedReview, dismissed] = await Promise.all([
        getJson<{ rating: number; description: string }>(STORAGE_KEYS.APP_REVIEW),
        getJson<boolean>(STORAGE_KEYS.APP_REVIEW_DISMISSED),
      ]);
      if (active && !savedReview && !dismissed) {
        setShowReviewBanner(true);
      }
    })();
    return () => { active = false; };
  }, []);

  const dismissReviewBanner = useCallback(async () => {
    setShowReviewBanner(false);
    await setJson(STORAGE_KEYS.APP_REVIEW_DISMISSED, true);
  }, []);

  const openRateModal = useCallback(() => {
    setRating(0);
    setReviewDescription('');
    setShowRateModal(true);
  }, []);

  const submitReview = useCallback(async () => {
    if (rating === 0) {
      Alert.alert('Pick a rating', 'Please tap a star before submitting.');
      return;
    }
    if (!reviewDescription.trim()) {
      Alert.alert('Add a note', 'Please write a short description of your experience.');
      return;
    }
    await setJson(STORAGE_KEYS.APP_REVIEW, {
      rating,
      description: reviewDescription.trim(),
      submittedAt: new Date().toISOString(),
    });
    setShowRateModal(false);
    setShowReviewBanner(false);
    Alert.alert('Thank you!', 'Your feedback helps us make BrightFit better.');
  }, [rating, reviewDescription]);

  const handleRefresh = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
    } else {
      DevSettings.reload();
    }
  }, []);
  const measurements = getCurrentMeasurements(measurementLogs);
  const muscles: MuscleMap = buildMuscleStatusMap(history);

  // ── Composition calculations ───────────────────────────
  const _h = parseFloat(measurements.height); // cm
  const _w = parseFloat(measurements.weight); // kg
  const _age = parseFloat(measurements.age);
  const _gender = (measurements.gender ?? '').toLowerCase();

  const bmiValue = (_h > 0 && _w > 0) ? _w / ((_h / 100) ** 2) : null;
  const bmiDisplay = bmiValue !== null ? bmiValue.toFixed(1) : '—';

  // Deurenberg formula: BF% = (1.20 × BMI) + (0.23 × age) − offset
  const bfOffset = _gender.startsWith('f') ? 5.4 : 16.2;
  const bodyFatValue = (bmiValue !== null && _age > 0)
    ? Math.max(0, 1.20 * bmiValue + 0.23 * _age - bfOffset)
    : null;
  const bodyFatDisplay = bodyFatValue !== null ? `${bodyFatValue.toFixed(1)}%` : '—';

  const leanMassValue = (_w > 0 && bodyFatValue !== null)
    ? _w * (1 - bodyFatValue / 100)
    : null;
  const leanMassDisplay = leanMassValue !== null ? `${leanMassValue.toFixed(1)} kg` : '—';

  // Map BMI to a 0–100% bar position
  // Zones: Underweight <18.5 (flex 2), Normal 18.5–25 (flex 3), Overweight 25–30 (flex 2.5), Obese 30+ (flex 2.5)
  function bmiToBarPercent(bmi: number): number {
    if (bmi < 18.5) return Math.max(0, (bmi / 18.5) * 20);
    if (bmi < 25)   return 20 + ((bmi - 18.5) / 6.5) * 30;
    if (bmi < 30)   return 50 + ((bmi - 25) / 5) * 25;
    return Math.min(100, 75 + ((bmi - 30) / 10) * 25);
  }
  const bmiMarkerLeft = bmiValue !== null ? `${bmiToBarPercent(bmiValue).toFixed(1)}%` : '50%';
  const volThisWeek = weeklyVolume(history);
  const minThisWeek = weeklyMinutes(history);
  const weekCount = weeklyWorkoutCount(history);
  const weekGoal = parseInt(workoutsPerWeek, 10) || 5;
  const indexScore = Math.min(100, Math.round((weekCount / weekGoal) * 100));
  const progressBarPercent = Math.min(100, weekCount * 20);
  const datesWithWorkouts = workoutDates(history);
  const starPoints = totalIronPoints(history);
  const streak = calculateStreak(history);

  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const dayLabel = today.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  const calendarCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Body data for the highlighter library.
  // Always include neck with head-matching color (#bebebe) so the two grey
  // neck segments blend with the skull instead of showing the library default.
  const frontData = buildBodyData(muscles, FRONT_SLUG_MAP);
  const backData: ExtendedBodyPart[] = [
    ...buildBodyData(muscles, BACK_SLUG_MAP),
    { slug: 'neck', color: '#bebebe' },
  ];

  // Library renders at width = 200 * scale, height = 400 * scale.
  // Card inner ≈ SCREEN_W - 40 (screen padding) - 36 (card padding) - 16 (row padding) - 8 (gap),
  // each figure gets half of that.
  const CARD_INNER = SCREEN_W - 40 - 36 - 16 - 8;
  const BODY_SCALE = (CARD_INNER / 2) / 200;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Profile header ───────────────────────── */}
        <View style={styles.profileRow}>
          <TouchableOpacity
            style={styles.avatarWrap}
            activeOpacity={0.85}
            onPress={promptChangeProfilePhoto}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
          >
            <View style={styles.avatar}>
              {profilePhotoUri ? (
                <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
              ) : (
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="8" r="4" stroke="#FFB800" strokeWidth="1.8" />
                  <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#FFB800" strokeWidth="1.8" strokeLinecap="round" />
                </Svg>
              )}
            </View>
            <View style={styles.avatarRing} />
            <View style={styles.avatarEditBadge}>
              <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18.5 2.5a2.12 2.12 0 013 3L7 20l-4 1 1-4L18.5 2.5z"
                  stroke="#0B0B0F"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M15 5l4 4"
                  stroke="#0B0B0F"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>
          <Text style={styles.username}>{displayName}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={handleRefresh}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M1 4v6h6M23 20v-6h-6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Stats chips ──────────────────────────── */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <View style={styles.chipIconWrap}>
              <Svg width={22} height={22} viewBox="0 0 24 24">
                <Defs>
                  <LinearGradient id="starGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#FFD000" />
                    <Stop offset="1" stopColor="#FF8C00" />
                  </LinearGradient>
                </Defs>
                <Path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="url(#starGrad)"
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.chipLabel}>Star Points</Text>
              <Text style={styles.chipValue}>{starPoints}</Text>
            </View>
          </View>
          <View style={styles.chip}>
            <View style={styles.chipIconWrap}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2C10 6 7 9.5 7 13.5a5 5 0 0010 0C17 9.5 14 6 12 2z" stroke="#FF6B35" strokeWidth="1.8" strokeLinejoin="round" />
                <Path d="M12 17a2 2 0 002-2" stroke="#FF6B35" strokeWidth="1.6" strokeLinecap="round" />
              </Svg>
            </View>
            <View>
              <Text style={styles.chipLabel}>Streak</Text>
              <Text style={styles.chipValue}>{streak}</Text>
            </View>
          </View>
        </View>

        {/* ── Tab row ──────────────────────────────── */}
        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
              {activeTab === t && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ══ BODY TAB ══════════════════════════════ */}
        {activeTab === 'Body' && (
          <>
            {/* ── Muscle Index ───────────────────── */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Muscle Index</Text>
              </View>

              {/* Anatomy diagrams */}
              <View style={styles.anatomyRow}>
                <View style={styles.anatomyFigure}>
                  <Text style={styles.anatomyLabel}>Front</Text>
                  <Body
                    data={frontData}
                    gender="male"
                    side="front"
                    scale={BODY_SCALE}
                    colors={[C.muscleFatigued, C.muscleImproved]}
                    defaultFill={C.muscleDefault}
                    border={C.muscleLine}
                  />
                </View>
                <View style={styles.anatomyFigure}>
                  <Text style={styles.anatomyLabel}>Back</Text>
                  <Body
                    data={backData}
                    gender="male"
                    side="back"
                    scale={BODY_SCALE}
                    colors={[C.muscleFatigued, C.muscleImproved]}
                    defaultFill={C.muscleDefault}
                    border={C.muscleLine}
                  />
                </View>
              </View>

              {/* Legend */}
              <View style={styles.recoveryLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: C.muscleImproved, borderColor: C.green, borderWidth: 1 }]} />
                  <Text style={styles.legendText}>Improved</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: C.muscleFatigued, borderColor: C.gold, borderWidth: 1 }]} />
                  <Text style={styles.legendText}>Fatigued</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: C.muscleDefault }]} />
                  <Text style={styles.legendText}>Fresh</Text>
                </View>
              </View>
            </View>

            {/* ── Composition ───────────────────────── */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Composition</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <View style={styles.infoIcon}><Text style={styles.infoIconText}>i</Text></View>
                </TouchableOpacity>
              </View>
              <View style={styles.compRow}>
                <View style={styles.compItem}>
                  <Text style={styles.compValue}>{bodyFatDisplay}</Text>
                  <Text style={styles.compLabel}>Body Fat</Text>
                </View>
                <View style={styles.compDivider} />
                <View style={styles.compItem}>
                  <Text style={[styles.compValue, bmiValue !== null && { color: C.gold }]}>{bmiDisplay}</Text>
                  <Text style={styles.compLabel}>BMI</Text>
                </View>
                <View style={styles.compDivider} />
                <View style={styles.compItem}>
                  <Text style={styles.compValue}>{leanMassDisplay}</Text>
                  <Text style={styles.compLabel}>Lean Mass</Text>
                </View>
              </View>
              <View style={styles.bmiBarWrap}>
                <View style={styles.bmiTrack}>
                  <View style={[styles.bmiZone, { backgroundColor: '#5B9BF8', flex: 2 }]} />
                  <View style={[styles.bmiZone, { backgroundColor: '#4CAF7D', flex: 3 }]} />
                  <View style={[styles.bmiZone, { backgroundColor: C.gold, flex: 2.5 }]} />
                  <View style={[styles.bmiZone, { backgroundColor: '#E05050', flex: 2.5 }]} />
                </View>
                <View style={[styles.bmiMarker, { left: bmiMarkerLeft as any }]} />
              </View>
              <View style={styles.bmiLabels}>
                {['Underweight', 'Normal', 'Overweight', 'Obese'].map((l) => (
                  <Text key={l} style={styles.bmiLabel}>{l}</Text>
                ))}
              </View>
            </View>

            {/* ── Body Stats ────────────────────────── */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Body Stats</Text>
                <Text style={styles.cardChevron}>›</Text>
              </View>

              <View style={styles.statGrid}>
                {[
                  { label: 'Height', value: measurements.height ? `${measurements.height} cm` : '—' },
                  { label: 'Weight', value: measurements.weight ? `${measurements.weight} kg` : '—' },
                  { label: 'Age',    value: measurements.age    || '—' },
                  { label: 'Gender', value: measurements.gender || '—' },
                ].map((item) => (
                  <View key={item.label} style={styles.statGridItem}>
                    <Text style={styles.statGridLabel}>{item.label}</Text>
                    <Text style={styles.statGridValue}>{item.value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.statDivider} />

              <View style={styles.measureList}>
                {[
                  { label: 'Chest',     value: measurements.chest  ? `${measurements.chest} cm`  : '—' },
                  { label: 'Waist',     value: measurements.waist  ? `${measurements.waist} cm`  : '—' },
                  { label: 'Hips',      value: measurements.hips   ? `${measurements.hips} cm`   : '—' },
                  { label: 'Bicep (L)', value: measurements.bicepL ? `${measurements.bicepL} cm` : '—' },
                  { label: 'Bicep (R)', value: measurements.bicepR ? `${measurements.bicepR} cm` : '—' },
                  { label: 'Thigh (L)', value: measurements.thighL ? `${measurements.thighL} cm` : '—' },
                  { label: 'Thigh (R)', value: measurements.thighR ? `${measurements.thighR} cm` : '—' },
                ].map((row, i, arr) => (
                  <View
                    key={row.label}
                    style={[styles.measureRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    <Text style={styles.measureLabel}>{row.label}</Text>
                    <Text style={styles.measureValue}>{row.value}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.addMeasurementBtn}
                activeOpacity={0.8}
                onPress={() => {
                  setDraft({ ...getCurrentMeasurements(measurementLogs) });
                  setShowMeasureModal(true);
                }}
              >
                <Text style={styles.addMeasurementText}>+ Log Measurements</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ══ OVERVIEW TAB ══════════════════════════ */}
        {activeTab === 'Overview' && (
          <>
            {showReviewBanner && (
              <View style={styles.banner}>
                <View style={styles.bannerStars}>
                  <Text style={styles.bannerStar1}>★</Text>
                  <Text style={styles.bannerStar2}>★</Text>
                </View>
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerTitle}>Enjoying BrightFit?</Text>
                  <Text style={styles.bannerBody}>
                    Rate the app and share a short note about your experience.
                  </Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={openRateModal}>
                    <Text style={styles.bannerLink}>Rate Now</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.bannerClose}
                  activeOpacity={0.7}
                  onPress={() => { void dismissReviewBanner(); }}
                >
                  <Text style={styles.bannerCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.75}
              onPress={() => setShowProgressIndex(true)}
              accessibilityRole="button"
              accessibilityLabel="Open Progress Index"
            >
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <Text style={{ fontSize: 15, color: C.gold }}>✦</Text>
                  <Text style={styles.cardTitle}>Progress Index</Text>
                </View>
                <View style={styles.progressIndexScoreWrap}>
                  <Text style={styles.progressIndexScore}>{indexScore}</Text>
                  <Text style={styles.cardChevron}>›</Text>
                </View>
              </View>
              <Text style={styles.progressWeek}>
                {weekCount === 0
                  ? 'Week Just Started'
                  : `${weekCount} Workout${weekCount > 1 ? 's' : ''} This Week`}
              </Text>
              <Text style={styles.progressDate}>{dayLabel}</Text>
              <View style={styles.progressTrack}>
                <View style={[
                  styles.progressFill,
                  { width: `${progressBarPercent}%` },
                ]} />
                <View style={[
                  styles.progressDot,
                  { left: `${progressBarPercent}%` },
                ]} />
              </View>
              <Text style={styles.progressIndexHint}>Tap to view your full progress index</Text>
            </TouchableOpacity>

            <View style={styles.overviewStatRow}>
              {[
                {
                  title: 'Volume',
                  value: volThisWeek > 0 ? `${volThisWeek.toLocaleString()} lbs` : '0 lbs',
                  onPress: () => setShowVolumeDetail(true),
                },
                {
                  title: 'Workout Time',
                  value: minThisWeek > 0 ? `${minThisWeek}m` : '0m',
                  onPress: () => setShowWorkoutTimeDetail(true),
                },
              ].map((s) => (
                <TouchableOpacity
                  key={s.title}
                  style={styles.overviewStatCard}
                  activeOpacity={0.75}
                  onPress={s.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${s.title} details`}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{s.title}</Text>
                    <Text style={styles.cardChevron}>›</Text>
                  </View>
                  <Text style={styles.overviewStatValue}>{s.value}</Text>
                  <Text style={[
                    styles.overviewStatChange,
                    { color: history.length > 0 ? C.green : C.dimmed },
                  ]}>
                    {history.length > 0 ? '↗ Great work!' : '↗ 0%'}
                  </Text>
                  <Text style={styles.overviewStatPeriod}>This week</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{MONTH_NAMES[month]} {year}</Text>
                <Text style={styles.cardChevron}>›</Text>
              </View>
              <View style={styles.calendarDayRow}>
                {DAYS.map((d, i) => (
                  <Text key={i} style={styles.calendarDayLabel}>{d}</Text>
                ))}
              </View>
              <View style={styles.calendarGrid}>
                {calendarCells.map((day, i) => {
                  const isToday = day === todayDate;
                  const dateKey = day !== null
                    ? `${year}-${month}-${day}`
                    : '';
                  const hasWorkout = datesWithWorkouts.has(dateKey);
                  return (
                    <View key={i} style={styles.calendarCell}>
                      {day !== null && (
                        <View style={[
                          styles.calendarDay,
                          isToday && styles.calendarDayToday,
                          hasWorkout && !isToday && styles.calendarDayWorkout,
                        ]}>
                          <Text style={[
                            styles.calendarDayText,
                            isToday && styles.calendarDayTextToday,
                            hasWorkout && !isToday && { color: C.gold, fontWeight: '700' },
                          ]}>
                            {day}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* ══ ACTIVITY TAB ══════════════════════════ */}
        {activeTab === 'Activity' && (
          history.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Svg width={48} height={48} viewBox="0 0 24 24">
                  <Rect x="7"  y="10.5" width="10" height="3"  rx="1"   fill="#555568" />
                  <Rect x="1"  y="8"    width="4"  height="8"  rx="1.5" fill="#555568" />
                  <Rect x="19" y="8"    width="4"  height="8"  rx="1.5" fill="#555568" />
                  <Rect x="5"  y="9"    width="2"  height="6"  rx="0.5" fill="#555568" />
                  <Rect x="17" y="9"    width="2"  height="6"  rx="0.5" fill="#555568" />
                </Svg>
              </View>
              <Text style={styles.emptyTitle}>No activity yet</Text>
              <Text style={styles.emptyBody}>
                Start your first workout to see your history here.
              </Text>
            </View>
          ) : (
            <>
              {history.map((record) => {
                const d = new Date(record.date);
                const dateStr = d.toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                });
                const timeStr = d.toLocaleTimeString('en-US', {
                  hour: 'numeric', minute: '2-digit',
                });
                const mins = Math.round(record.durationSeconds / 60);
                const setsTotal = record.exercises.reduce(
                  (n, ex) => n + ex.sets.length, 0,
                );
                const exWithSets = record.exercises.filter(ex => ex.sets.length > 0);

                return (
                  <View
                    key={record.id}
                    style={[
                      styles.activityCard,
                      !record.completed && styles.activityCardAbandoned,
                    ]}
                  >
                    {/* Header row */}
                    <View style={styles.activityHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityTitle}>{record.title}</Text>
                        <Text style={styles.activityDate}>{dateStr} · {timeStr}</Text>
                      </View>
                      <View style={[
                        styles.activityBadge,
                        record.completed
                          ? styles.activityBadgeDone
                          : styles.activityBadgeAbandoned,
                      ]}>
                        <Text style={[
                          styles.activityBadgeText,
                          { color: record.completed ? C.green : C.gold },
                        ]}>
                          {record.completed ? 'Completed' : 'Abandoned'}
                        </Text>
                      </View>
                    </View>

                    {/* Stats row */}
                    <View style={styles.activityStats}>
                      <View style={styles.activityStat}>
                        <Text style={styles.activityStatValue}>{mins}m</Text>
                        <Text style={styles.activityStatLabel}>Duration</Text>
                      </View>
                      <View style={styles.activityStatDivider} />
                      <View style={styles.activityStat}>
                        <Text style={styles.activityStatValue}>
                          {record.totalVolume > 0
                            ? `${record.totalVolume.toLocaleString()} lbs`
                            : '—'}
                        </Text>
                        <Text style={styles.activityStatLabel}>Volume</Text>
                      </View>
                      <View style={styles.activityStatDivider} />
                      <View style={styles.activityStat}>
                        <Text style={styles.activityStatValue}>{setsTotal}</Text>
                        <Text style={styles.activityStatLabel}>Sets</Text>
                      </View>
                    </View>

                    {/* Exercise list */}
                    {exWithSets.length > 0 && (
                      <View style={styles.activityExList}>
                        {exWithSets.slice(0, 4).map((ex, i) => (
                          <View key={i} style={styles.activityExRow}>
                            <ExerciseIcon emoji={ex.emoji} size={14} color="#7A7A8A" />
                            <Text style={styles.activityExItem} numberOfLines={1}>
                              {ex.name}
                              <Text style={styles.activityExSets}> · {ex.sets.length} set{ex.sets.length !== 1 ? 's' : ''}</Text>
                            </Text>
                          </View>
                        ))}
                        {exWithSets.length > 4 && (
                          <Text style={styles.activityExMore}>
                            +{exWithSets.length - 4} more
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Continue button — only for abandoned workouts that have resume data */}
                    {!record.completed && record.resumeData && onResumeWorkout && (
                      <TouchableOpacity
                        style={styles.continueBtn}
                        activeOpacity={0.8}
                        onPress={() => onResumeWorkout(record.resumeData!)}
                      >
                        <Text style={styles.continueBtnText}>▶  Continue Workout</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </>
          )
        )}

        <View style={{ height: 36 }} />
      </ScrollView>

      {/* ── Log Measurements Modal ───────────────── */}
      <Modal
        visible={showMeasureModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowMeasureModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalSheet}
            >
              {/* Handle bar */}
              <View style={styles.modalHandle} />

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Log Measurements</Text>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  activeOpacity={0.7}
                  onPress={() => setShowMeasureModal(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
                keyboardShouldPersistTaps="handled"
              >
                {/* Body Stats section */}
                <Text style={styles.modalSection}>Body Stats</Text>

                <View style={styles.modalRow}>
                  <MeasureField
                    label="Height"
                    unit="cm"
                    value={draft.height}
                    keyboardType="numeric"
                    onChangeText={(v) => setDraft((d) => ({ ...d, height: v }))}
                  />
                  <MeasureField
                    label="Weight"
                    unit="kg"
                    value={draft.weight}
                    keyboardType="numeric"
                    onChangeText={(v) => setDraft((d) => ({ ...d, weight: v }))}
                  />
                </View>

                <View style={styles.modalRow}>
                  <MeasureField
                    label="Age"
                    unit="yrs"
                    value={draft.age}
                    keyboardType="numeric"
                    onChangeText={(v) => setDraft((d) => ({ ...d, age: v }))}
                  />
                  <MeasureField
                    label="Gender"
                    unit=""
                    value={draft.gender}
                    keyboardType="default"
                    placeholder="e.g. Male"
                    onChangeText={(v) => setDraft((d) => ({ ...d, gender: v }))}
                  />
                </View>

                {/* Body Measurements section */}
                <Text style={[styles.modalSection, { marginTop: 20 }]}>Body Measurements</Text>

                <View style={styles.modalRow}>
                  <MeasureField
                    label="Chest"
                    unit="cm"
                    value={draft.chest}
                    keyboardType="numeric"
                    onChangeText={(v) => setDraft((d) => ({ ...d, chest: v }))}
                  />
                  <MeasureField
                    label="Waist"
                    unit="cm"
                    value={draft.waist}
                    keyboardType="numeric"
                    onChangeText={(v) => setDraft((d) => ({ ...d, waist: v }))}
                  />
                </View>

                <View style={styles.modalRow}>
                  <MeasureField
                    label="Hips"
                    unit="cm"
                    value={draft.hips}
                    keyboardType="numeric"
                    onChangeText={(v) => setDraft((d) => ({ ...d, hips: v }))}
                  />
                  <MeasureField
                    label="Bicep (L)"
                    unit="cm"
                    value={draft.bicepL}
                    keyboardType="numeric"
                    onChangeText={(v) => setDraft((d) => ({ ...d, bicepL: v }))}
                  />
                </View>

                <View style={styles.modalRow}>
                  <MeasureField
                    label="Bicep (R)"
                    unit="cm"
                    value={draft.bicepR}
                    keyboardType="numeric"
                    onChangeText={(v) => setDraft((d) => ({ ...d, bicepR: v }))}
                  />
                  <MeasureField
                    label="Thigh (L)"
                    unit="cm"
                    value={draft.thighL}
                    keyboardType="numeric"
                    onChangeText={(v) => setDraft((d) => ({ ...d, thighL: v }))}
                  />
                </View>

                <View style={styles.modalRow}>
                  <MeasureField
                    label="Thigh (R)"
                    unit="cm"
                    value={draft.thighR}
                    keyboardType="numeric"
                    onChangeText={(v) => setDraft((d) => ({ ...d, thighR: v }))}
                  />
                  <View style={{ flex: 1 }} />
                </View>

                {/* Save button */}
                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    addMeasurementLog(draft);
                    setShowMeasureModal(false);
                  }}
                >
                  <Text style={styles.modalSaveText}>Save Measurements</Text>
                </TouchableOpacity>

                <View style={{ height: 20 }} />
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── Rate App Modal ───────────────────────── */}
      <Modal
        visible={showRateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRateModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalSheet}
            >
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Rate BrightFit</Text>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  activeOpacity={0.7}
                  onPress={() => setShowRateModal(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.ratePrompt}>How would you rate your experience?</Text>

                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      activeOpacity={0.7}
                      onPress={() => setRating(star)}
                      accessibilityRole="button"
                      accessibilityLabel={`${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Text style={[
                        styles.star,
                        star <= rating && styles.starSelected,
                      ]}>
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.rateDescriptionLabel}>Short description</Text>
                <TextInput
                  style={styles.rateDescriptionInput}
                  value={reviewDescription}
                  onChangeText={setReviewDescription}
                  placeholder="Tell us what you like or what we could improve..."
                  placeholderTextColor="#555568"
                  multiline
                  maxLength={280}
                  textAlignVertical="top"
                />
                <Text style={styles.rateCharCount}>{reviewDescription.length}/280</Text>

                <TouchableOpacity
                  style={[
                    styles.modalSaveBtn,
                    (rating === 0 || !reviewDescription.trim()) && styles.modalSaveBtnDisabled,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => { void submitReview(); }}
                >
                  <Text style={styles.modalSaveText}>Submit Rating</Text>
                </TouchableOpacity>

                <View style={{ height: 20 }} />
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showProgressIndex}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowProgressIndex(false)}
      >
        <SafeAreaProvider>
          <ProgressIndexScreen
            onBack={() => setShowProgressIndex(false)}
            workoutsPerWeek={workoutsPerWeek}
            onOpenVolume={() => setShowVolumeDetail(true)}
            onOpenWorkoutTime={() => setShowWorkoutTimeDetail(true)}
          />
        </SafeAreaProvider>
      </Modal>

      <Modal
        visible={showVolumeDetail}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowVolumeDetail(false)}
      >
        <SafeAreaProvider>
          <VolumeDetailScreen onBack={() => setShowVolumeDetail(false)} />
        </SafeAreaProvider>
      </Modal>

      <Modal
        visible={showWorkoutTimeDetail}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowWorkoutTimeDetail(false)}
      >
        <SafeAreaProvider>
          <WorkoutTimeDetailScreen onBack={() => setShowWorkoutTimeDetail(false)} />
        </SafeAreaProvider>
      </Modal>

    </SafeAreaView>
  );
}

// ── Helper: single input field ────────────────────────────────
interface MeasureFieldProps {
  label: string;
  unit: string;
  value: string;
  keyboardType: 'numeric' | 'default';
  placeholder?: string;
  onChangeText: (v: string) => void;
}

function MeasureField({ label, unit, value, keyboardType, placeholder, onChangeText }: MeasureFieldProps) {
  return (
    <View style={styles.measureFieldWrap}>
      <Text style={styles.measureFieldLabel}>{label}</Text>
      <View style={styles.measureFieldRow}>
        <TextInput
          style={styles.measureFieldInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder ?? '0'}
          placeholderTextColor="#555568"
          returnKeyType="done"
          maxLength={8}
        />
        {unit ? <Text style={styles.measureFieldUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const CARD_PADDING = 18;
const CELL_W = (SCREEN_W - 40 - 36) / 7;
const HALF_CARD = (SCREEN_W - 40 - 12) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  // ── Profile ─────────────────────────────────
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  avatarWrap: { position: 'relative', width: 50, height: 50, marginRight: 12 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#2A3A6A',
    alignItems: 'center', justifyContent: 'center',
    position: 'absolute', top: 2, left: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarRing: {
    position: 'absolute', width: 50, height: 50, borderRadius: 25,
    borderWidth: 2.5, borderColor: C.gold,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.gold,
    borderWidth: 2,
    borderColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  avatarIcon: { fontSize: 22 },
  username: { flex: 1, fontSize: 18, fontWeight: '700', color: C.white, letterSpacing: -0.2 },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 17, color: C.muted },

  // ── Chips ───────────────────────────────────
  chipsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  chip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  chipIcon: { fontSize: 20 }, // kept for compat
  chipIconWrap: { width: 28, alignItems: 'center', justifyContent: 'center' },
  chipLabel: { fontSize: 11, fontWeight: '500', color: C.muted, marginBottom: 2 },
  chipValue: { fontSize: 14, fontWeight: '700', color: C.white },

  // ── Tabs ────────────────────────────────────
  tabRow: {
    flexDirection: 'row', borderBottomWidth: 1,
    borderBottomColor: C.border, marginBottom: 18, gap: 24,
  },
  tabItem: { paddingBottom: 12, position: 'relative' },
  tabText: { fontSize: 14, fontWeight: '600', color: C.dimmed },
  tabTextActive: { color: C.white, fontWeight: '800' },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2.5, backgroundColor: C.gold,
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
  },

  // ── Shared card ─────────────────────────────
  card: {
    backgroundColor: C.surface, borderRadius: 18,
    borderWidth: 1, borderColor: C.border,
    padding: CARD_PADDING, marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.white },
  cardChevron: { fontSize: 22, color: C.dimmed },

  // ── Anatomy ─────────────────────────────────
  anatomyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0D0D14',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 8,
    marginBottom: 14,
  },
  anatomyFigure: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  anatomyLabel: { fontSize: 11, fontWeight: '700', color: C.dimmed, letterSpacing: 1, textTransform: 'uppercase' },

  // ── Recovery legend ─────────────────────────
  recoveryLegend: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 4.5 },
  legendText: { fontSize: 11, fontWeight: '500', color: C.muted },

  // ── Composition ─────────────────────────────
  infoIcon: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.dimmed,
    alignItems: 'center', justifyContent: 'center',
  },
  infoIconText: { fontSize: 11, fontWeight: '700', color: C.dimmed },
  compRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  compItem: { flex: 1, alignItems: 'center' },
  compValue: { fontSize: 20, fontWeight: '800', color: C.white, marginBottom: 4 },
  compLabel: { fontSize: 11, fontWeight: '500', color: C.muted },
  compDivider: { width: 1, height: 36, backgroundColor: C.border },
  bmiBarWrap: { marginBottom: 6, position: 'relative' },
  bmiTrack: { height: 8, borderRadius: 4, flexDirection: 'row', overflow: 'hidden' },
  bmiZone: { height: '100%' },
  bmiMarker: {
    position: 'absolute', top: -3, width: 14, height: 14,
    borderRadius: 7, backgroundColor: C.gold,
    borderWidth: 2.5, borderColor: C.surface, marginLeft: -7,
  },
  bmiLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  bmiLabel: { fontSize: 9, fontWeight: '500', color: C.dimmed, flex: 1, textAlign: 'center' },

  // ── Body Stats ──────────────────────────────
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  statGridItem: {
    width: (SCREEN_W - 40 - 36 - 12) / 2,
    backgroundColor: C.bg, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: C.border,
  },
  statGridLabel: { fontSize: 11, fontWeight: '500', color: C.muted, marginBottom: 6 },
  statGridValue: { fontSize: 18, fontWeight: '800', color: C.white },
  statDivider: { height: 1, backgroundColor: C.border, marginBottom: 14 },
  measureList: { marginBottom: 16 },
  measureRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  measureLabel: { fontSize: 13, fontWeight: '500', color: C.muted },
  measureValue: { fontSize: 14, fontWeight: '700', color: C.white },
  addMeasurementBtn: {
    backgroundColor: C.goldDim, borderWidth: 1, borderColor: C.goldDimMid,
    borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  addMeasurementText: { fontSize: 14, fontWeight: '700', color: C.gold, letterSpacing: 0.3 },

  // ── Overview ────────────────────────────────
  banner: {
    backgroundColor: C.surface, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    padding: 16, marginBottom: 14, flexDirection: 'row', overflow: 'hidden',
  },
  bannerStars: { position: 'absolute', right: 16, top: 8, bottom: 8, justifyContent: 'space-between' },
  bannerStar1: { fontSize: 28, color: C.gold, opacity: 0.7 },
  bannerStar2: { fontSize: 20, color: C.gold, opacity: 0.35 },
  bannerContent: { flex: 1, paddingRight: 32 },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: C.white, marginBottom: 6 },
  bannerBody: { fontSize: 12, color: C.muted, lineHeight: 17, marginBottom: 8 },
  bannerLink: { fontSize: 13, fontWeight: '700', color: C.gold },
  bannerClose: {
    position: 'absolute', top: 12, right: 12,
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
  },
  bannerCloseText: { fontSize: 14, color: C.dimmed, fontWeight: '700' },
  progressWeek: { fontSize: 17, fontWeight: '800', color: C.gold, marginBottom: 3 },
  progressDate: { fontSize: 12, fontWeight: '500', color: C.dimmed, marginBottom: 14 },
  progressTrack: {
    height: 6, backgroundColor: C.border,
    borderRadius: 3, overflow: 'visible', position: 'relative',
  },
  progressFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: '5%', backgroundColor: C.gold, borderRadius: 3,
  },
  progressDot: {
    position: 'absolute', top: -4, left: '5%',
    width: 14, height: 14, borderRadius: 7, backgroundColor: C.gold,
  },
  progressIndexScoreWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressIndexScore: { fontSize: 18, fontWeight: '800', color: C.gold },
  progressIndexHint: { fontSize: 12, fontWeight: '600', color: C.dimmed, marginTop: 12 },
  overviewStatRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  overviewStatCard: {
    width: HALF_CARD, backgroundColor: C.surface,
    borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 16,
  },
  overviewStatValue: { fontSize: 22, fontWeight: '800', color: C.white, marginBottom: 3 },
  overviewStatChange: { fontSize: 12, fontWeight: '600', color: C.green, marginBottom: 4 },
  overviewStatPeriod: { fontSize: 11, fontWeight: '400', color: C.dimmed },
  calendarDayRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  calendarDayLabel: {
    width: CELL_W, textAlign: 'center',
    fontSize: 12, fontWeight: '600', color: C.dimmed,
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: CELL_W, alignItems: 'center', marginBottom: 6 },
  calendarDay: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  calendarDayToday: { backgroundColor: C.gold },
  calendarDayWorkout: {
    backgroundColor: 'rgba(255,184,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.4)',
  },
  calendarDayText: { fontSize: 13, fontWeight: '500', color: C.muted },
  calendarDayTextToday: { color: C.bg, fontWeight: '900' },

  // ── Activity empty ───────────────────────────
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 }, // kept for compat
  emptyIconWrap: { marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.white, marginBottom: 8 },
  emptyBody: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20 },

  // ── Activity cards ───────────────────────────
  activityCard: {
    backgroundColor: C.surface, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    padding: 16, marginBottom: 12,
  },
  activityCardAbandoned: {
    borderColor: 'rgba(255,184,0,0.2)',
  },
  activityHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: 12, gap: 10,
  },
  activityTitle: {
    fontSize: 15, fontWeight: '700', color: C.white, marginBottom: 2,
  },
  activityDate: { fontSize: 11, fontWeight: '500', color: C.dimmed },
  activityBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1,
  },
  activityBadgeDone: {
    backgroundColor: 'rgba(76,175,125,0.12)',
    borderColor: 'rgba(76,175,125,0.3)',
  },
  activityBadgeAbandoned: {
    backgroundColor: 'rgba(255,184,0,0.1)',
    borderColor: 'rgba(255,184,0,0.25)',
  },
  activityBadgeText: { fontSize: 11, fontWeight: '700' },
  activityStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bg, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 4,
    marginBottom: 12,
  },
  activityStat: { flex: 1, alignItems: 'center' },
  activityStatValue: { fontSize: 14, fontWeight: '800', color: C.white, marginBottom: 2 },
  activityStatLabel: { fontSize: 10, fontWeight: '500', color: C.dimmed },
  activityStatDivider: { width: 1, height: 28, backgroundColor: C.border },
  activityExList: { gap: 5 },
  activityExRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  activityExItem: { fontSize: 12, fontWeight: '600', color: C.muted, flex: 1 },
  activityExSets: { fontSize: 12, fontWeight: '400', color: C.dimmed },
  activityExMore: { fontSize: 11, fontWeight: '500', color: C.dimmed, marginTop: 2 },
  continueBtn: {
    marginTop: 12,
    backgroundColor: C.goldDim,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.35)',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  continueBtnText: { fontSize: 13, fontWeight: '800', color: C.gold, letterSpacing: 0.4 },

  // ── Measurement modal ────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#141418',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#252530',
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#555568',
    alignSelf: 'center',
    marginTop: 12, marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#252530',
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: C.white, letterSpacing: -0.2 },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1C1C22',
    borderWidth: 1, borderColor: '#252530',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { fontSize: 13, fontWeight: '700', color: C.muted },
  modalScroll: { paddingHorizontal: 20, paddingTop: 20 },
  modalSection: {
    fontSize: 12, fontWeight: '700', color: C.gold,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14,
  },
  modalRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  measureFieldWrap: { flex: 1 },
  measureFieldLabel: {
    fontSize: 11, fontWeight: '600', color: C.muted,
    marginBottom: 7, letterSpacing: 0.3,
  },
  measureFieldRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0B0B0F',
    borderRadius: 12, borderWidth: 1, borderColor: '#252530',
    paddingHorizontal: 12, paddingVertical: 11,
    gap: 6,
  },
  measureFieldInput: {
    flex: 1, fontSize: 16, fontWeight: '700', color: C.white,
    padding: 0, margin: 0,
  },
  measureFieldUnit: { fontSize: 12, fontWeight: '600', color: C.dimmed },
  modalSaveBtn: {
    marginTop: 8,
    backgroundColor: C.gold,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalSaveBtnDisabled: { opacity: 0.45 },
  modalSaveText: { fontSize: 15, fontWeight: '800', color: '#0B0B0F', letterSpacing: 0.3 },
  ratePrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: C.muted,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  star: {
    fontSize: 36,
    color: '#3A3A4A',
  },
  starSelected: {
    color: C.gold,
  },
  rateDescriptionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.muted,
    marginBottom: 7,
    letterSpacing: 0.3,
  },
  rateDescriptionInput: {
    minHeight: 110,
    backgroundColor: '#0B0B0F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252530',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
    color: C.white,
    lineHeight: 22,
  },
  rateCharCount: {
    fontSize: 11,
    fontWeight: '500',
    color: C.dimmed,
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 4,
  },
});
