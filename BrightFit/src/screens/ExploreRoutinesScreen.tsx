import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';
import { colors } from '@/constants';
import type { SessionExercise } from './WorkoutSessionScreen';

const { width } = Dimensions.get('window');
const GOLD = colors.primaryGold;

// ── Fresh SVG icons (none reused from elsewhere in the app) ────────────────

function IconDrop({ color, size = 24 }: { color: string; size?: number }) {
  // Water drop / sweat
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C12 3 5 10 5 15a7 7 0 0014 0c0-5-7-12-7-12z"
        stroke={color} strokeWidth="1.9" strokeLinejoin="round"
      />
      <Path
        d="M9 16a3 3 0 004 1.5"
        stroke={color} strokeWidth="1.7" strokeLinecap="round"
      />
    </Svg>
  );
}

function IconHexagon({ color, size = 24 }: { color: string; size?: number }) {
  // Hexagon — strength / muscle structure
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
        stroke={color} strokeWidth="1.9" strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconSun({ color, size = 24 }: { color: string; size?: number }) {
  // Sun — morning energy
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.9" />
      <Path
        d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke={color} strokeWidth="1.9" strokeLinecap="round"
      />
    </Svg>
  );
}

function IconLeaf({ color, size = 24 }: { color: string; size?: number }) {
  // Leaf — calm / stress relief
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 8C8 10 5.9 16.17 3.82 20.82A2 2 0 003 22c1.09-.28 2.19-.55 3.29-.82C8.31 20.73 11.42 20 14 18c4-3 5-8 5-11z"
        stroke={color} strokeWidth="1.9" strokeLinejoin="round"
      />
      <Path
        d="M3 22l5-5"
        stroke={color} strokeWidth="1.9" strokeLinecap="round"
      />
    </Svg>
  );
}

function IconShield({ color, size = 24 }: { color: string; size?: number }) {
  // Shield — core protection
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={color} strokeWidth="1.9" strokeLinejoin="round"
      />
      <Path
        d="M9 12l2 2 4-4"
        stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconInfinity({ color, size = 24 }: { color: string; size?: number }) {
  // Infinity / flow — flexibility & mobility
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 12c-2-2.5-4-4-6-4a4 4 0 000 8c2 0 4-1.5 6-4zm0 0c2 2.5 4 4 6 4a4 4 0 000-8c-2 0-4 1.5-6 4z"
        stroke={color} strokeWidth="1.9" strokeLinecap="round"
      />
    </Svg>
  );
}

function IconDiamond({ color, size = 24 }: { color: string; size?: number }) {
  // Diamond — leg/glute sculpt
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L2 9l10 13L22 9z"
        stroke={color} strokeWidth="1.9" strokeLinejoin="round"
      />
      <Path
        d="M2 9h20M7 9l5-7 5 7"
        stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconStar({ color, size = 24 }: { color: string; size?: number }) {
  // Star — upper body shine
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={color} strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round"
      />
    </Svg>
  );
}

function IconHeart({ color, size = 24 }: { color: string; size?: number }) {
  // Heart — endurance / cardio
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
        stroke={color} strokeWidth="1.9" strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconMountain({ color, size = 24 }: { color: string; size?: number }) {
  // Mountain — power & strength
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 20L9 8l4.5 5.5L17 9l4 11H3z"
        stroke={color} strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round"
      />
      <Path
        d="M9 8l2-3 2 3"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconMoon({ color, size = 24 }: { color: string; size?: number }) {
  // Crescent moon — recovery & rest
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        stroke={color} strokeWidth="1.9" strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconMedal({ color, size = 24 }: { color: string; size?: number }) {
  // Medal — athletic performance
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="9" r="6" stroke={color} strokeWidth="1.9" />
      <Path
        d="M9 15.5L7.5 22l4.5-2 4.5 2L15 15.5"
        stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M12 6v3l2 1"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Routine data ────────────────────────────────────────────────────────────

interface ExploreRoutine {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: string;
  tag: string;
  accentColor: string;
  icon: (props: { color: string; size?: number }) => JSX.Element | null;
  exercises: SessionExercise[];
}

const EXPLORE_ROUTINES: ExploreRoutine[] = [
  {
    id: 'fat-burner',
    name: 'Fat Burner',
    description: 'Torches calories and spikes your metabolism with explosive cardio circuits that keep you burning long after you stop.',
    duration: '30 Min',
    level: 'Beginner',
    tag: 'Cardio',
    accentColor: '#FF6B35',
    icon: IconDrop,
    exercises: [
      { name: 'Jumping Jacks',    muscles: ['fullBody'],          equipment: ['None'],       sets: 3, reps: '45s', emoji: '⭐' },
      { name: 'High Knees',       muscles: ['legs', 'cardio'],    equipment: ['None'],       sets: 3, reps: '45s', emoji: '🦵' },
      { name: 'Burpees',          muscles: ['fullBody'],          equipment: ['None'],       sets: 3, reps: '10',  emoji: '💥' },
      { name: 'Mountain Climbers',muscles: ['core', 'shoulders'], equipment: ['None'],       sets: 3, reps: '45s', emoji: '🏔️' },
      { name: 'Jump Squats',      muscles: ['legs', 'glutes'],    equipment: ['None'],       sets: 3, reps: '15',  emoji: '🦵' },
      { name: 'Plank Hold',       muscles: ['core'],              equipment: ['None'],       sets: 3, reps: '45s', emoji: '💪' },
    ],
  },
  {
    id: 'muscle-builder',
    name: 'Muscle Builder',
    description: 'Progressive overload compound lifts designed to add lean muscle mass and build a stronger, denser physique.',
    duration: '55 Min',
    level: 'Intermediate',
    tag: 'Strength',
    accentColor: '#C084FC',
    icon: IconHexagon,
    exercises: [
      { name: 'Barbell Bench Press', muscles: ['chest', 'triceps'],    equipment: ['Barbell'],    sets: 4, reps: '8',  emoji: '💪', suggestedWeight: 135 },
      { name: 'Pull-Ups',            muscles: ['back', 'biceps'],      equipment: ['Pull-Up Bar'], sets: 4, reps: '8',  emoji: '💪' },
      { name: 'Barbell Back Squat',  muscles: ['legs', 'glutes'],      equipment: ['Barbell'],    sets: 4, reps: '8',  emoji: '🏋️', suggestedWeight: 185 },
      { name: 'Overhead Press',      muscles: ['shoulders', 'triceps'],equipment: ['Barbell'],    sets: 4, reps: '8',  emoji: '💪', suggestedWeight: 95  },
      { name: 'Deadlift',            muscles: ['back', 'legs'],        equipment: ['Barbell'],    sets: 3, reps: '6',  emoji: '🏋️', suggestedWeight: 225 },
      { name: 'Dumbbell Curl',       muscles: ['biceps'],              equipment: ['Dumbbells'],  sets: 3, reps: '12', emoji: '💪', suggestedWeight: 30  },
    ],
  },
  {
    id: 'morning-energizer',
    name: 'Morning Energizer',
    description: 'Wakes up your joints, fires your muscles and floods your brain with endorphins so you start every day winning.',
    duration: '20 Min',
    level: 'Beginner',
    tag: 'Full Body',
    accentColor: '#FACC15',
    icon: IconSun,
    exercises: [
      { name: 'Cat-Cow Stretch',      muscles: ['back', 'core'],       equipment: ['None'], sets: 2, reps: '10',  emoji: '🌅' },
      { name: 'Bodyweight Squat',     muscles: ['legs', 'glutes'],     equipment: ['None'], sets: 3, reps: '15',  emoji: '🦵' },
      { name: 'Push-Ups',             muscles: ['chest', 'triceps'],   equipment: ['None'], sets: 3, reps: '12',  emoji: '💪' },
      { name: 'Glute Bridge',         muscles: ['glutes', 'hamstrings'],equipment: ['None'], sets: 3, reps: '15', emoji: '🍑' },
      { name: 'Standing Toe Touch',   muscles: ['hamstrings', 'back'], equipment: ['None'], sets: 2, reps: '30s', emoji: '🙆' },
      { name: 'Jumping Jacks',        muscles: ['fullBody'],           equipment: ['None'], sets: 2, reps: '30s', emoji: '⭐' },
    ],
  },
  {
    id: 'stress-relief',
    name: 'Stress Relief',
    description: 'Releases physical and mental tension through deep stretching and mindful movement that calms the nervous system.',
    duration: '25 Min',
    level: 'Beginner',
    tag: 'Mobility',
    accentColor: '#34D399',
    icon: IconLeaf,
    exercises: [
      { name: "Child's Pose",         muscles: ['back', 'hips'],        equipment: ['None'], sets: 2, reps: '60s', emoji: '🧘' },
      { name: 'Seated Forward Fold',  muscles: ['hamstrings', 'back'],  equipment: ['None'], sets: 2, reps: '60s', emoji: '🧘' },
      { name: 'Pigeon Pose',          muscles: ['hips', 'glutes'],      equipment: ['None'], sets: 2, reps: '60s', emoji: '🕊️' },
      { name: 'Neck Rolls',           muscles: ['neck'],                equipment: ['None'], sets: 2, reps: '30s', emoji: '🔄' },
      { name: 'Chest Opener Stretch', muscles: ['chest', 'shoulders'],  equipment: ['None'], sets: 2, reps: '45s', emoji: '🫶' },
      { name: 'Supine Spinal Twist',  muscles: ['back', 'core'],        equipment: ['None'], sets: 2, reps: '45s', emoji: '🔀' },
    ],
  },
  {
    id: 'core-strengthener',
    name: 'Core Strengthener',
    description: 'Builds an ironclad midsection that protects your spine, improves posture and powers every other lift you do.',
    duration: '30 Min',
    level: 'Intermediate',
    tag: 'Core',
    accentColor: '#60A5FA',
    icon: IconShield,
    exercises: [
      { name: 'Plank Hold',      muscles: ['core'],            equipment: ['None'], sets: 4, reps: '60s', emoji: '💪' },
      { name: 'Crunches',        muscles: ['abs'],             equipment: ['None'], sets: 4, reps: '20',  emoji: '🎯' },
      { name: 'Russian Twists',  muscles: ['obliques', 'core'],equipment: ['None'], sets: 3, reps: '20',  emoji: '🌀' },
      { name: 'Leg Raises',      muscles: ['abs', 'core'],     equipment: ['None'], sets: 3, reps: '15',  emoji: '💪' },
      { name: 'Dead Bug',        muscles: ['core', 'back'],    equipment: ['None'], sets: 3, reps: '12',  emoji: '🐛' },
      { name: 'Side Plank',      muscles: ['obliques', 'core'],equipment: ['None'], sets: 3, reps: '45s', emoji: '💪' },
    ],
  },
  {
    id: 'flexibility-mobility',
    name: 'Flexibility & Mobility',
    description: 'Expands your range of motion, undoes the damage of sitting and makes every other workout feel smoother and safer.',
    duration: '30 Min',
    level: 'Beginner',
    tag: 'Mobility',
    accentColor: '#A78BFA',
    icon: IconInfinity,
    exercises: [
      { name: 'Hip Circles',               muscles: ['hips'],              equipment: ['None'], sets: 2, reps: '30s', emoji: '🔄' },
      { name: "World's Greatest Stretch",  muscles: ['fullBody', 'hips'],  equipment: ['None'], sets: 3, reps: '10',  emoji: '🌟' },
      { name: 'Hamstring Stretch',         muscles: ['hamstrings'],        equipment: ['None'], sets: 3, reps: '45s', emoji: '🦵' },
      { name: 'Shoulder Cross-Body Stretch',muscles: ['shoulders'],        equipment: ['None'], sets: 2, reps: '30s', emoji: '💪' },
      { name: 'Thoracic Rotation',         muscles: ['back', 'core'],      equipment: ['None'], sets: 3, reps: '10',  emoji: '🔄' },
      { name: 'Standing Quad Stretch',     muscles: ['quads'],             equipment: ['None'], sets: 2, reps: '30s', emoji: '🦵' },
    ],
  },
  {
    id: 'leg-glute-sculptor',
    name: 'Leg & Glute Sculptor',
    description: 'Shapes and strengthens your entire lower body with targeted movements that build round glutes and powerful legs.',
    duration: '45 Min',
    level: 'Intermediate',
    tag: 'Lower Body',
    accentColor: '#F472B6',
    icon: IconDiamond,
    exercises: [
      { name: 'Romanian Deadlift',    muscles: ['hamstrings', 'glutes'],   equipment: ['Dumbbells'], sets: 4, reps: '12', emoji: '🍑', suggestedWeight: 60  },
      { name: 'Bulgarian Split Squat',muscles: ['quads', 'glutes'],        equipment: ['Dumbbells'], sets: 3, reps: '12', emoji: '🦵', suggestedWeight: 30  },
      { name: 'Hip Thrust',           muscles: ['glutes'],                 equipment: ['None'],      sets: 4, reps: '15', emoji: '🍑' },
      { name: 'Sumo Squat',           muscles: ['glutes', 'inner thighs'], equipment: ['Dumbbells'], sets: 3, reps: '15', emoji: '🦵', suggestedWeight: 40  },
      { name: 'Walking Lunges',       muscles: ['quads', 'glutes'],        equipment: ['None'],      sets: 3, reps: '20', emoji: '🚶' },
      { name: 'Donkey Kicks',         muscles: ['glutes'],                 equipment: ['None'],      sets: 3, reps: '20', emoji: '🍑' },
    ],
  },
  {
    id: 'upper-body-toner',
    name: 'Upper Body Toner',
    description: 'Defines and tones your arms, shoulders, chest and back for a sculpted look without adding bulk.',
    duration: '40 Min',
    level: 'Beginner',
    tag: 'Upper Body',
    accentColor: '#FB923C',
    icon: IconStar,
    exercises: [
      { name: 'Push-Ups',              muscles: ['chest', 'triceps'],    equipment: ['None'],      sets: 4, reps: '15', emoji: '💪' },
      { name: 'Dumbbell Lateral Raise',muscles: ['shoulders'],           equipment: ['Dumbbells'], sets: 3, reps: '15', emoji: '💪', suggestedWeight: 15 },
      { name: 'Tricep Dips',           muscles: ['triceps'],             equipment: ['Chair'],     sets: 3, reps: '12', emoji: '💪' },
      { name: 'Dumbbell Row',          muscles: ['back', 'biceps'],      equipment: ['Dumbbells'], sets: 4, reps: '12', emoji: '💪', suggestedWeight: 30 },
      { name: 'Dumbbell Bicep Curl',   muscles: ['biceps'],              equipment: ['Dumbbells'], sets: 3, reps: '12', emoji: '💪', suggestedWeight: 20 },
      { name: 'Dumbbell Shoulder Press',muscles: ['shoulders', 'triceps'],equipment: ['Dumbbells'],sets: 3, reps: '12', emoji: '💪', suggestedWeight: 25 },
    ],
  },
  {
    id: 'endurance-builder',
    name: 'Endurance Builder',
    description: 'Trains your heart and lungs to work harder for longer, boosting your stamina for sports, work and everyday life.',
    duration: '45 Min',
    level: 'Intermediate',
    tag: 'Cardio',
    accentColor: '#EF4444',
    icon: IconHeart,
    exercises: [
      { name: 'Jump Rope',          muscles: ['fullBody', 'cardio'], equipment: ['Jump Rope'],  sets: 4, reps: '3 Min', emoji: '⏱️' },
      { name: 'Box Jumps',          muscles: ['legs', 'glutes'],     equipment: ['Box'],        sets: 4, reps: '12',    emoji: '📦' },
      { name: 'Battle Ropes',       muscles: ['fullBody', 'cardio'], equipment: ['Battle Ropes'],sets:4, reps: '30s',   emoji: '💪' },
      { name: 'Squat Thrusts',      muscles: ['fullBody'],           equipment: ['None'],       sets: 4, reps: '15',    emoji: '💥' },
      { name: 'Step-Ups',           muscles: ['legs', 'glutes'],     equipment: ['Box'],        sets: 3, reps: '15',    emoji: '🚶' },
      { name: 'Sprint Intervals',   muscles: ['legs', 'cardio'],     equipment: ['None'],       sets: 6, reps: '30s',   emoji: '🏃' },
    ],
  },
  {
    id: 'power-strength',
    name: 'Power & Strength',
    description: 'Maximises raw strength through heavy compound movements — the fastest path to becoming genuinely, noticeably stronger.',
    duration: '60 Min',
    level: 'Advanced',
    tag: 'Powerlifting',
    accentColor: '#64748B',
    icon: IconMountain,
    exercises: [
      { name: 'Deadlift',        muscles: ['back', 'legs', 'glutes'], equipment: ['Barbell'],    sets: 5, reps: '5', emoji: '🏋️', suggestedWeight: 275 },
      { name: 'Barbell Back Squat',muscles: ['legs', 'glutes'],       equipment: ['Barbell'],    sets: 5, reps: '5', emoji: '🏋️', suggestedWeight: 225 },
      { name: 'Bench Press',     muscles: ['chest', 'triceps'],       equipment: ['Barbell'],    sets: 5, reps: '5', emoji: '💪', suggestedWeight: 185 },
      { name: 'Power Clean',     muscles: ['fullBody'],                equipment: ['Barbell'],    sets: 4, reps: '5', emoji: '⚡', suggestedWeight: 135 },
      { name: 'Overhead Press',  muscles: ['shoulders'],              equipment: ['Barbell'],    sets: 4, reps: '5', emoji: '💪', suggestedWeight: 115 },
      { name: 'Weighted Pull-Ups',muscles: ['back', 'biceps'],        equipment: ['Pull-Up Bar'],sets: 4, reps: '5', emoji: '💪' },
    ],
  },
  {
    id: 'recovery-stretch',
    name: 'Recovery & Stretch',
    description: 'Accelerates muscle repair, reduces soreness and keeps you flexible so you can train hard again tomorrow.',
    duration: '25 Min',
    level: 'Beginner',
    tag: 'Recovery',
    accentColor: '#38BDF8',
    icon: IconMoon,
    exercises: [
      { name: 'Foam Roll Quads',       muscles: ['quads'],             equipment: ['Foam Roller'], sets: 2, reps: '60s', emoji: '🔄' },
      { name: 'Foam Roll Back',        muscles: ['back'],              equipment: ['Foam Roller'], sets: 2, reps: '60s', emoji: '🔄' },
      { name: 'Hip Flexor Stretch',    muscles: ['hips', 'quads'],     equipment: ['None'],        sets: 3, reps: '45s', emoji: '🦵' },
      { name: 'Calf Stretch',          muscles: ['calves'],            equipment: ['None'],        sets: 2, reps: '45s', emoji: '🦵' },
      { name: 'Overhead Tricep Stretch',muscles: ['triceps', 'shoulders'],equipment: ['None'],    sets: 2, reps: '30s', emoji: '💪' },
      { name: "Child's Pose",          muscles: ['back', 'hips'],      equipment: ['None'],        sets: 3, reps: '60s', emoji: '🧘' },
    ],
  },
  {
    id: 'athletic-performance',
    name: 'Athletic Performance',
    description: 'Sharpens agility, explosiveness and coordination — the training that separates athletes from everyone else.',
    duration: '50 Min',
    level: 'Advanced',
    tag: 'Athletic',
    accentColor: '#22C55E',
    icon: IconMedal,
    exercises: [
      { name: 'Box Jumps',          muscles: ['legs', 'glutes'],      equipment: ['Box'],            sets: 4, reps: '10',  emoji: '📦' },
      { name: 'Lateral Shuffle',    muscles: ['legs', 'hips'],        equipment: ['None'],           sets: 4, reps: '30s', emoji: '⚡' },
      { name: 'Med Ball Slam',      muscles: ['fullBody', 'core'],    equipment: ['Medicine Ball'],  sets: 4, reps: '12',  emoji: '⚽', suggestedWeight: 20 },
      { name: 'Agility Ladder Drills',muscles: ['legs', 'cardio'],   equipment: ['Agility Ladder'], sets: 3, reps: '60s', emoji: '🏃' },
      { name: 'Broad Jump',         muscles: ['legs', 'glutes'],      equipment: ['None'],           sets: 4, reps: '8',   emoji: '🦘' },
      { name: 'Single-Leg RDL',     muscles: ['hamstrings', 'glutes'],equipment: ['Dumbbells'],     sets: 3, reps: '10',  emoji: '🦵', suggestedWeight: 25 },
    ],
  },
];

// ── Level badge color ────────────────────────────────────────────────────────

const LEVEL_COLOR: Record<string, string> = {
  Beginner:     '#22C55E',
  Intermediate: GOLD,
  Advanced:     '#EF4444',
};

// ── Component ────────────────────────────────────────────────────────────────

interface ExploreRoutinesScreenProps {
  onBack: () => void;
  onStart: (exercises: SessionExercise[], title: string) => void;
}

export default function ExploreRoutinesScreen({ onBack, onStart }: ExploreRoutinesScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={onBack}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke={GOLD}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Explore Routines</Text>
          <Text style={styles.headerSub}>{EXPLORE_ROUTINES.length} ready-to-go workouts</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {EXPLORE_ROUTINES.map((routine) => {
          const Icon = routine.icon;
          const levelColor = LEVEL_COLOR[routine.level] ?? GOLD;
          return (
            <TouchableOpacity
              key={routine.id}
              style={[styles.card, { borderLeftColor: routine.accentColor }]}
              activeOpacity={0.82}
              onPress={() => onStart(routine.exercises, routine.name)}
            >
              {/* Icon + text */}
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: routine.accentColor + '1A' }]}>
                  <Icon color={routine.accentColor} size={26} />
                </View>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardName}>{routine.name}</Text>
                  <Text style={styles.cardDesc}>{routine.description}</Text>
                </View>
              </View>

              {/* Tags row */}
              <View style={styles.tagsRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{routine.duration}</Text>
                </View>
                <View style={[styles.tag, { borderColor: levelColor + '55' }]}>
                  <Text style={[styles.tagText, { color: levelColor }]}>{routine.level}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{routine.tag}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{routine.exercises.length} exercises</Text>
                </View>

                {/* Start arrow */}
                <View style={styles.startArrow}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12h14M13 5l7 7-7 7"
                      stroke={routine.accentColor}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E26',
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSub: {
    color: '#7A7A8A',
    fontSize: 13,
    marginTop: 1,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  // Card
  card: {
    backgroundColor: '#141418',
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 12,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardMeta: {
    flex: 1,
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
    marginBottom: 5,
  },
  cardDesc: {
    color: '#8E8E9A',
    fontSize: 13,
    lineHeight: 18,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  tag: {
    backgroundColor: '#1E1E28',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#2A2A36',
  },
  tagText: {
    color: '#A0A0B0',
    fontSize: 11,
    fontWeight: '500',
  },
  startArrow: {
    marginLeft: 'auto',
    paddingLeft: 4,
  },
});
