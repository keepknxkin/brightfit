import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  FlatList,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import ExerciseIcon from '../components/ExerciseIcon';
import CountdownOverlay from '../components/CountdownOverlay';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Color tokens ─────────────────────────────────────────────
const C = {
  bg: '#0B0B0F',
  surface: '#141418',
  surfaceRaised: '#1C1C22',
  border: '#252530',
  gold: '#FFB800',
  goldDeep: '#D89200',
  goldDim: 'rgba(255,184,0,0.12)',
  white: '#FFFFFF',
  muted: '#9999AA',
  dimmed: '#555568',
};

// ── Duration options ─────────────────────────────────────────
const DURATIONS = [
  { label: '15 min', value: 15, exercises: 3 },
  { label: '30 min', value: 30, exercises: 5 },
  { label: '45 min', value: 45, exercises: 7 },
  { label: '60 min', value: 60, exercises: 10 },
];

// ── 50 Equipment items ───────────────────────────────────────
const ALL_EQUIPMENT = [
  'Barbell', 'Dumbbells', 'Kettlebell', 'Resistance Band', 'Pull-up Bar',
  'Cable Machine', 'Smith Machine', 'Leg Press Machine', 'Chest Press Machine',
  'Lat Pulldown Machine', 'Seated Row Machine', 'Shoulder Press Machine',
  'Hack Squat Machine', 'Leg Extension Machine', 'Leg Curl Machine',
  'Pec Deck Machine', 'Cable Crossover', 'Assisted Pull-up Machine',
  'Dip Machine', 'Hip Thrust Machine', 'Glute Kickback Machine', 'Ab Machine',
  'Back Extension Machine', 'Rowing Machine', 'Stationary Bike', 'Treadmill',
  'Elliptical', 'Jump Rope', 'Battle Ropes', 'TRX / Suspension Trainer',
  'Medicine Ball', 'Stability Ball', 'BOSU Ball', 'Foam Roller', 'Ab Wheel',
  'Push-up Handles', 'Dip Bars', 'Gymnastics Rings', 'Landmine Attachment',
  'EZ Curl Bar', 'Trap Bar (Hex Bar)', 'Weight Plates', 'Adjustable Bench',
  'Flat Bench', 'Incline Bench', 'Preacher Curl Bench', 'GHD Machine',
  'Plyometric Box', 'Parallette Bars', 'Sandbag',
];

// ── Target muscle groups ─────────────────────────────────────
const ALL_MUSCLES = [
  { id: 'chest',       label: 'Chest',          emoji: '💪' },
  { id: 'upperBack',   label: 'Upper Back',      emoji: '🔙' },
  { id: 'lowerBack',   label: 'Lower Back',      emoji: '🏋️' },
  { id: 'shoulders',   label: 'Shoulders',       emoji: '🤸' },
  { id: 'biceps',      label: 'Biceps',          emoji: '💪' },
  { id: 'triceps',     label: 'Triceps',         emoji: '💪' },
  { id: 'forearms',    label: 'Forearms',        emoji: '🖐️' },
  { id: 'core',        label: 'Core / Abs',      emoji: '⚡' },
  { id: 'obliques',    label: 'Obliques',        emoji: '🌀' },
  { id: 'quads',       label: 'Quads',           emoji: '🦵' },
  { id: 'hamstrings',  label: 'Hamstrings',      emoji: '🦵' },
  { id: 'glutes',      label: 'Glutes',          emoji: '🍑' },
  { id: 'calves',      label: 'Calves',          emoji: '🦶' },
  { id: 'hipFlexors',  label: 'Hip Flexors',     emoji: '🏃' },
  { id: 'fullBody',    label: 'Full Body',       emoji: '🔥' },
];

// ── Exercise pool ────────────────────────────────────────────
export interface Exercise {
  name: string;
  muscles: string[];
  equipment: string[];
  sets: number;
  reps: string;
  emoji: string;
}

export const EXERCISE_POOL: Exercise[] = [
  // Chest
  { name: 'Barbell Bench Press', muscles: ['chest', 'triceps', 'shoulders'], equipment: ['Barbell', 'Flat Bench'], sets: 4, reps: '8', emoji: '🏋️' },
  { name: 'Incline Dumbbell Press', muscles: ['chest', 'shoulders'], equipment: ['Dumbbells', 'Incline Bench'], sets: 3, reps: '10', emoji: '💪' },
  { name: 'Cable Chest Fly', muscles: ['chest'], equipment: ['Cable Machine', 'Cable Crossover'], sets: 3, reps: '12', emoji: '🤸' },
  { name: 'Push-Up to Side Plank', muscles: ['chest', 'core'], equipment: [], sets: 4, reps: '10', emoji: '🧘' },
  { name: 'Pec Deck Fly', muscles: ['chest'], equipment: ['Pec Deck Machine'], sets: 3, reps: '15', emoji: '💪' },
  { name: 'Dumbbell Floor Press', muscles: ['chest', 'triceps'], equipment: ['Dumbbells'], sets: 3, reps: '12', emoji: '🏋️' },
  { name: 'Push-Up (Wide Grip)', muscles: ['chest', 'triceps'], equipment: [], sets: 4, reps: '15', emoji: '💪' },
  { name: 'Decline Bench Press', muscles: ['chest', 'triceps'], equipment: ['Barbell', 'Flat Bench'], sets: 3, reps: '10', emoji: '🏋️' },
  // Back
  { name: 'Deadlift', muscles: ['upperBack', 'lowerBack', 'hamstrings', 'glutes'], equipment: ['Barbell'], sets: 4, reps: '5', emoji: '🏋️' },
  { name: 'Pull-Up', muscles: ['upperBack', 'biceps'], equipment: ['Pull-up Bar'], sets: 4, reps: '8', emoji: '🤸' },
  { name: 'Lat Pulldown', muscles: ['upperBack', 'biceps'], equipment: ['Lat Pulldown Machine'], sets: 3, reps: '12', emoji: '💪' },
  { name: 'Dumbbell Bent-Over Row (Palms In)', muscles: ['upperBack', 'biceps'], equipment: ['Dumbbells'], sets: 4, reps: '10', emoji: '🏋️' },
  { name: 'Seated Cable Row', muscles: ['upperBack'], equipment: ['Seated Row Machine', 'Cable Machine'], sets: 3, reps: '12', emoji: '🤸' },
  { name: 'T-Bar Row', muscles: ['upperBack', 'lowerBack'], equipment: ['Barbell', 'Landmine Attachment'], sets: 3, reps: '10', emoji: '🏋️' },
  { name: 'Face Pull', muscles: ['shoulders', 'upperBack'], equipment: ['Cable Machine'], sets: 3, reps: '15', emoji: '🤸' },
  { name: 'Back Extension', muscles: ['lowerBack', 'glutes'], equipment: ['Back Extension Machine', 'GHD Machine'], sets: 3, reps: '15', emoji: '🏃' },
  // Shoulders
  { name: 'Overhead Barbell Press', muscles: ['shoulders', 'triceps'], equipment: ['Barbell'], sets: 4, reps: '8', emoji: '🏋️' },
  { name: 'Dumbbell Lateral Raise', muscles: ['shoulders'], equipment: ['Dumbbells'], sets: 3, reps: '15', emoji: '💪' },
  { name: 'Dumbbell Alternating Front Raise', muscles: ['shoulders'], equipment: ['Dumbbells'], sets: 3, reps: '12', emoji: '💪' },
  { name: 'Arnold Press', muscles: ['shoulders', 'triceps'], equipment: ['Dumbbells'], sets: 3, reps: '12', emoji: '🤸' },
  { name: 'Cable Lateral Raise', muscles: ['shoulders'], equipment: ['Cable Machine'], sets: 3, reps: '15', emoji: '🤸' },
  { name: 'Reverse Pec Deck', muscles: ['shoulders', 'upperBack'], equipment: ['Pec Deck Machine'], sets: 3, reps: '15', emoji: '💪' },
  // Biceps
  { name: 'Dumbbell Alternating Bicep Curl', muscles: ['biceps'], equipment: ['Dumbbells'], sets: 3, reps: '12', emoji: '💪' },
  { name: 'Barbell Curl', muscles: ['biceps', 'forearms'], equipment: ['Barbell'], sets: 3, reps: '10', emoji: '💪' },
  { name: 'EZ Bar Preacher Curl', muscles: ['biceps'], equipment: ['EZ Curl Bar', 'Preacher Curl Bench'], sets: 3, reps: '12', emoji: '💪' },
  { name: 'Hammer Curl', muscles: ['biceps', 'forearms'], equipment: ['Dumbbells'], sets: 3, reps: '12', emoji: '💪' },
  { name: 'Cable Curl', muscles: ['biceps'], equipment: ['Cable Machine'], sets: 3, reps: '15', emoji: '🤸' },
  // Triceps
  { name: 'Tricep Rope Pushdown', muscles: ['triceps'], equipment: ['Cable Machine'], sets: 3, reps: '15', emoji: '🤸' },
  { name: 'Skull Crushers', muscles: ['triceps'], equipment: ['Barbell', 'Flat Bench'], sets: 3, reps: '12', emoji: '🏋️' },
  { name: 'Dumbbell Lunge Tricep Extension', muscles: ['triceps', 'quads'], equipment: ['Dumbbells'], sets: 3, reps: '12', emoji: '🦵' },
  { name: 'Overhead Tricep Extension', muscles: ['triceps'], equipment: ['Dumbbells'], sets: 3, reps: '12', emoji: '💪' },
  { name: 'Bench Dip', muscles: ['triceps', 'chest'], equipment: ['Flat Bench', 'Dip Bars'], sets: 3, reps: '15', emoji: '🤸' },
  // Core / Abs
  { name: 'Plank', muscles: ['core'], equipment: [], sets: 3, reps: '60s', emoji: '⚡' },
  { name: 'Cable Crunch', muscles: ['core'], equipment: ['Cable Machine', 'Ab Machine'], sets: 3, reps: '15', emoji: '⚡' },
  { name: 'Hanging Leg Raise', muscles: ['core', 'hipFlexors'], equipment: ['Pull-up Bar'], sets: 3, reps: '12', emoji: '🤸' },
  { name: 'Ab Wheel Rollout', muscles: ['core'], equipment: ['Ab Wheel'], sets: 3, reps: '12', emoji: '⚡' },
  { name: 'Russian Twist', muscles: ['core', 'obliques'], equipment: ['Medicine Ball'], sets: 3, reps: '20', emoji: '🌀' },
  { name: 'Bicycle Crunch', muscles: ['core', 'obliques'], equipment: [], sets: 3, reps: '20', emoji: '🌀' },
  { name: 'Dead Bug', muscles: ['core'], equipment: [], sets: 3, reps: '12', emoji: '⚡' },
  // Legs
  { name: 'Barbell Back Squat', muscles: ['quads', 'glutes', 'hamstrings'], equipment: ['Barbell'], sets: 4, reps: '8', emoji: '🦵' },
  { name: 'Leg Press', muscles: ['quads', 'glutes'], equipment: ['Leg Press Machine'], sets: 4, reps: '12', emoji: '🦵' },
  { name: 'Romanian Deadlift', muscles: ['hamstrings', 'glutes', 'lowerBack'], equipment: ['Barbell', 'Dumbbells'], sets: 3, reps: '10', emoji: '🏋️' },
  { name: 'Reverse Lunge Crossover', muscles: ['quads', 'glutes'], equipment: [], sets: 4, reps: '10', emoji: '🦵' },
  { name: 'Leg Extension', muscles: ['quads'], equipment: ['Leg Extension Machine'], sets: 3, reps: '15', emoji: '🦵' },
  { name: 'Lying Leg Curl', muscles: ['hamstrings'], equipment: ['Leg Curl Machine'], sets: 3, reps: '12', emoji: '🦵' },
  { name: 'Hip Thrust', muscles: ['glutes'], equipment: ['Barbell', 'Flat Bench', 'Hip Thrust Machine'], sets: 4, reps: '12', emoji: '🍑' },
  { name: 'Bulgarian Split Squat', muscles: ['quads', 'glutes'], equipment: ['Dumbbells'], sets: 3, reps: '10', emoji: '🦵' },
  { name: 'Hack Squat', muscles: ['quads', 'glutes'], equipment: ['Hack Squat Machine'], sets: 3, reps: '12', emoji: '🦵' },
  { name: 'Standing Calf Raise', muscles: ['calves'], equipment: ['Barbell', 'Dumbbells'], sets: 4, reps: '15', emoji: '🦶' },
  // Full body / compound
  { name: 'Kettlebell Swing', muscles: ['fullBody', 'glutes', 'hamstrings'], equipment: ['Kettlebell'], sets: 4, reps: '15', emoji: '🔥' },
  { name: 'Burpee', muscles: ['fullBody', 'chest', 'core'], equipment: [], sets: 3, reps: '12', emoji: '🔥' },
  { name: 'Battle Rope Waves', muscles: ['fullBody', 'shoulders'], equipment: ['Battle Ropes'], sets: 3, reps: '30s', emoji: '🌊' },
  { name: 'TRX Row', muscles: ['upperBack', 'biceps'], equipment: ['TRX / Suspension Trainer'], sets: 3, reps: '12', emoji: '🤸' },
  { name: 'Box Jump', muscles: ['fullBody', 'quads', 'glutes'], equipment: ['Plyometric Box'], sets: 4, reps: '8', emoji: '📦' },
  { name: 'Sandbag Clean & Press', muscles: ['fullBody', 'shoulders'], equipment: ['Sandbag'], sets: 3, reps: '8', emoji: '🔥' },
  { name: 'Dumbbell Thrusters', muscles: ['fullBody', 'shoulders', 'quads'], equipment: ['Dumbbells'], sets: 3, reps: '12', emoji: '🔥' },
  { name: 'Dumbbell Bicep Curl', muscles: ['biceps'], equipment: ['Dumbbells'], sets: 4, reps: '15', emoji: '💪' },
];

// ── Workout title generator ───────────────────────────────────
function buildWorkoutTitle(duration: number, selectedMuscles: string[]): string {
  if (selectedMuscles.length === 0 || selectedMuscles.includes('fullBody')) {
    return `${duration} min Full Body Workout`;
  }
  const names: Record<string, string> = {
    chest: 'Push', upperBack: 'Pull', lowerBack: 'Back',
    shoulders: 'Shoulder', biceps: 'Arms', triceps: 'Arms',
    core: 'Core', obliques: 'Core', quads: 'Legs',
    hamstrings: 'Legs', glutes: 'Glute', calves: 'Leg',
    hipFlexors: 'Mobility', forearms: 'Arms',
  };
  const label = names[selectedMuscles[0]] ?? 'Workout';
  return `${duration} min ${label} Workout`;
}

// ── Generate exercise list ────────────────────────────────────
function generateExercises(
  duration: number,
  equipment: string[],
  muscles: string[],
): Exercise[] {
  const count = DURATIONS.find((d) => d.value === duration)?.exercises ?? 5;

  let pool = [...EXERCISE_POOL];

  // Filter by muscle — always apply when selection is made (no count fallback)
  if (muscles.length > 0 && !muscles.includes('fullBody')) {
    pool = pool.filter((e) => e.muscles.some((m) => muscles.includes(m)));
  }

  // Filter by equipment — only include exercises that require the selected equipment.
  // Bodyweight exercises (empty equipment array) are only included when no equipment
  // filter is active so results stay relevant to what the user actually has.
  if (equipment.length > 0) {
    pool = pool.filter(
      (e) => e.equipment.some((eq) => equipment.includes(eq)),
    );
  }

  // Shuffle deterministically-ish
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// ─────────────────────────────────────────────────────────────
// Picker modal
// ─────────────────────────────────────────────────────────────
interface PickerModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selected: string[];
  multiSelect: boolean;
  onToggle: (val: string) => void;
  onDone: () => void;
}

function PickerModal({ visible, title, options, selected, multiSelect, onToggle, onDone }: PickerModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          {/* Handle */}
          <View style={modal.handle} />

          {/* Header */}
          <View style={modal.header}>
            <Text style={modal.title}>{title}</Text>
            <TouchableOpacity onPress={onDone} activeOpacity={0.7} style={modal.doneBtn}>
              <Text style={modal.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

          {selected.length > 0 && (
            <Text style={modal.selectedCount}>
              {selected.length} selected
            </Text>
          )}

          <FlatList
            data={options}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: SH * 0.55 }}
            renderItem={({ item }) => {
              const isOn = selected.includes(item);
              return (
                <TouchableOpacity
                  style={[modal.option, isOn && modal.optionActive]}
                  activeOpacity={0.7}
                  onPress={() => onToggle(item)}
                >
                  <Text style={[modal.optionText, isOn && modal.optionTextActive]}>
                    {item}
                  </Text>
                  {isOn && (
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path d="M5 12l4 4 10-10" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Duration picker modal
// ─────────────────────────────────────────────────────────────
interface DurationModalProps {
  visible: boolean;
  selected: number;
  onSelect: (v: number) => void;
  onDone: () => void;
}

function DurationModal({ visible, selected, onSelect, onDone }: DurationModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={modal.overlay}>
        <View style={[modal.sheet, { paddingBottom: 36 }]}>
          <View style={modal.handle} />
          <View style={modal.header}>
            <Text style={modal.title}>Workout Duration</Text>
            <TouchableOpacity onPress={onDone} activeOpacity={0.7} style={modal.doneBtn}>
              <Text style={modal.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={dur.grid}>
            {DURATIONS.map((d) => {
              const isOn = selected === d.value;
              return (
                <TouchableOpacity
                  key={d.value}
                  style={[dur.card, isOn && dur.cardActive]}
                  activeOpacity={0.8}
                  onPress={() => onSelect(d.value)}
                >
                  <Text style={[dur.min, isOn && dur.minActive]}>{d.value}</Text>
                  <Text style={[dur.label, isOn && dur.labelActive]}>minutes</Text>
                  <Text style={[dur.exCount, isOn && dur.exCountActive]}>~{d.exercises} exercises</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Exercise row
// ─────────────────────────────────────────────────────────────
interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
  customSets?: number;
  customReps?: string;
  onEdit: () => void;
}

function ExerciseRow({ exercise, index, customSets, customReps, onEdit }: ExerciseRowProps) {
  const sets = customSets ?? exercise.sets;
  const reps = customReps ?? exercise.reps;
  const isEdited = customSets !== undefined || customReps !== undefined;

  return (
    <TouchableOpacity style={ex.row} activeOpacity={0.75} onPress={onEdit}>
      <View style={ex.dragHandle}>
        <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
          <Circle cx="4" cy="3"  r="1.3" fill={C.dimmed} />
          <Circle cx="4" cy="7"  r="1.3" fill={C.dimmed} />
          <Circle cx="4" cy="11" r="1.3" fill={C.dimmed} />
          <Circle cx="10" cy="3" r="1.3" fill={C.dimmed} />
          <Circle cx="10" cy="7" r="1.3" fill={C.dimmed} />
          <Circle cx="10" cy="11" r="1.3" fill={C.dimmed} />
        </Svg>
      </View>
      <LinearGradient
        colors={['#1E1C2A', '#141420']}
        style={ex.circle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ExerciseIcon emoji={exercise.emoji} size={22} color={C.gold} />
      </LinearGradient>
      <View style={ex.info}>
        <Text style={ex.name}>{exercise.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={ex.meta}>{sets} × {reps} reps</Text>
          {isEdited && <Text style={ex.editedTag}>edited</Text>}
        </View>
      </View>
      <View style={ex.editHint}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={C.dimmed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={C.dimmed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// Edit exercise modal
// ─────────────────────────────────────────────────────────────
interface EditExerciseModalProps {
  visible: boolean;
  exercise: Exercise | null;
  sets: number;
  reps: string;
  onChangeSets: (v: number) => void;
  onChangeReps: (v: string) => void;
  onDone: () => void;
  onReset: () => void;
}

function EditExerciseModal({ visible, exercise, sets, reps, onChangeSets, onChangeReps, onDone, onReset }: EditExerciseModalProps) {
  if (!exercise) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={edt.overlay}>
          <View style={edt.sheet}>
            <View style={edt.handle} />

            {/* Exercise identity */}
            <View style={edt.exHeader}>
              <LinearGradient colors={['#1E1C2A', '#141420']} style={edt.exCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <ExerciseIcon emoji={exercise.emoji} size={24} color={C.gold} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={edt.exName}>{exercise.name}</Text>
                <Text style={edt.exMuscles}>{exercise.muscles.join(' · ')}</Text>
              </View>
            </View>

            <View style={edt.divider} />

            {/* Sets stepper */}
            <View style={edt.fieldRow}>
              <Text style={edt.fieldLabel}>Sets</Text>
              <View style={edt.stepper}>
                <TouchableOpacity
                  style={[edt.stepBtn, sets <= 1 && edt.stepBtnDisabled]}
                  activeOpacity={0.7}
                  onPress={() => onChangeSets(Math.max(1, sets - 1))}
                >
                  <Text style={edt.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={edt.stepValue}>{sets}</Text>
                <TouchableOpacity
                  style={[edt.stepBtn, sets >= 10 && edt.stepBtnDisabled]}
                  activeOpacity={0.7}
                  onPress={() => onChangeSets(Math.min(10, sets + 1))}
                >
                  <Text style={edt.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reps input */}
            <View style={edt.fieldRow}>
              <Text style={edt.fieldLabel}>Reps / Duration</Text>
              <TextInput
                style={edt.repsInput}
                value={reps}
                onChangeText={onChangeReps}
                placeholder={exercise.reps}
                placeholderTextColor={C.dimmed}
                keyboardType="default"
                returnKeyType="done"
                onSubmitEditing={onDone}
                selectTextOnFocus
              />
            </View>

            <View style={edt.divider} />

            {/* Actions */}
            <View style={edt.actions}>
              <TouchableOpacity style={edt.resetBtn} activeOpacity={0.7} onPress={onReset}>
                <Text style={edt.resetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={edt.doneBtn} activeOpacity={0.8} onPress={onDone}>
                <LinearGradient colors={[C.gold, C.goldDeep]} style={edt.doneBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={edt.doneText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// CountdownOverlay is now the shared component from ../components/CountdownOverlay

// ─────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────
interface InstantWorkoutScreenProps {
  onStartWorkout?: (exercises: Exercise[], title: string) => void;
}

interface ExerciseOverride { sets: number; reps: string }

export default function InstantWorkoutScreen({ onStartWorkout }: InstantWorkoutScreenProps) {
  const [duration, setDuration] = useState(60);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([
    'Dumbbells', 'Barbell', 'Cable Machine', 'Pull-up Bar', 'Flat Bench',
  ]);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

  const [showDuration, setShowDuration] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showMuscle, setShowMuscle] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  // Per-exercise overrides keyed by index
  const [overrides, setOverrides] = useState<Record<number, ExerciseOverride>>({});
  // Which exercise is being edited
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // Draft values while modal is open
  const [draftSets, setDraftSets] = useState(3);
  const [draftReps, setDraftReps] = useState('');

  const exercises = useMemo(
    () => {
      setOverrides({}); // clear overrides when exercise list changes
      return generateExercises(duration, selectedEquipment, selectedMuscles);
    },
    [duration, selectedEquipment, selectedMuscles],
  );

  function openEdit(index: number) {
    const ex = exercises[index];
    const override = overrides[index];
    setDraftSets(override?.sets ?? ex.sets);
    setDraftReps(override?.reps ?? ex.reps);
    setEditingIndex(index);
  }

  function saveEdit() {
    if (editingIndex === null) return;
    setOverrides((prev) => ({ ...prev, [editingIndex]: { sets: draftSets, reps: draftReps } }));
    setEditingIndex(null);
  }

  function resetEdit() {
    if (editingIndex === null) return;
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[editingIndex];
      return next;
    });
    setEditingIndex(null);
  }

  // Build final exercises (with overrides applied) for the session
  function buildFinalExercises() {
    return exercises.map((ex, i) => {
      const ov = overrides[i];
      return ov ? { ...ex, sets: ov.sets, reps: ov.reps } : ex;
    });
  }

  const workoutTitle = buildWorkoutTitle(duration, selectedMuscles);

  function toggleEquipment(item: string) {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item],
    );
  }

  function toggleMuscle(id: string) {
    setSelectedMuscles((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  const muscleOptions = ALL_MUSCLES.map((m) => m.id);
  const muscleLabels = ALL_MUSCLES.map((m) => m.label);

  // Map display label → id and vice versa for muscle modal
  const idToLabel: Record<string, string> = {};
  const labelToId: Record<string, string> = {};
  ALL_MUSCLES.forEach((m) => {
    idToLabel[m.id] = m.label;
    labelToId[m.label] = m.id;
  });

  const selectedMuscleLabels = selectedMuscles.map((id) => idToLabel[id] ?? id);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Workout title row ─────────────────────── */}
      <View style={styles.titleRow}>
        <Text style={styles.workoutTitle}>{workoutTitle}</Text>
        <LinearGradient
          colors={[C.gold, C.goldDeep]}
          style={styles.lightningBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M13 2L4 14h7l-1 8 9-12h-6L13 2z" fill="#0B0B0F" />
          </Svg>
        </LinearGradient>
      </View>

      {/* ── Filter chips row ──────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersScroll}
      >
        {/* Duration chip */}
        <TouchableOpacity
          style={styles.chip}
          activeOpacity={0.8}
          onPress={() => setShowDuration(true)}
        >
          <Text style={styles.chipText}>{duration} min</Text>
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Path d="M6 9l6 6 6-6" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        {/* Equipment chip */}
        <TouchableOpacity
          style={styles.chip}
          activeOpacity={0.8}
          onPress={() => setShowEquipment(true)}
        >
          <Text style={styles.chipText}>
            Equipment{selectedEquipment.length > 0 ? ` (${selectedEquipment.length})` : ''}
          </Text>
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Path d="M6 9l6 6 6-6" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        {/* Target Muscle chip */}
        <TouchableOpacity
          style={[styles.chip, selectedMuscles.length > 0 && styles.chipActive]}
          activeOpacity={0.8}
          onPress={() => setShowMuscle(true)}
        >
          <Text style={[styles.chipText, selectedMuscles.length > 0 && styles.chipTextActive]}>
            Target Muscle{selectedMuscles.length > 0 ? ` (${selectedMuscles.length})` : ''}
          </Text>
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Path d="M6 9l6 6 6-6" stroke={selectedMuscles.length > 0 ? C.gold : C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        {/* More options */}
        <TouchableOpacity style={[styles.chip, styles.chipDots]} activeOpacity={0.8}>
          <Text style={styles.chipText}>•••</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Exercise list ─────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.exerciseList}
        style={{ flex: 1 }}
      >
        {exercises.map((exercise, i) => (
          <ExerciseRow
            key={`${exercise.name}-${i}`}
            exercise={exercise}
            index={i}
            customSets={overrides[i]?.sets}
            customReps={overrides[i]?.reps}
            onEdit={() => openEdit(i)}
          />
        ))}
        {/* Bottom padding for the floating button */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Floating Start Workout button ──────────── */}
      <View style={styles.startBtnWrap}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={{ borderRadius: 28, overflow: 'hidden' }}
          onPress={() => setShowCountdown(true)}
        >
          <LinearGradient
            colors={['#FFD000', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startBtn}
          >
            <Text style={styles.startBtnText}>Start Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Modals ────────────────────────────────── */}
      <DurationModal
        visible={showDuration}
        selected={duration}
        onSelect={setDuration}
        onDone={() => setShowDuration(false)}
      />

      <PickerModal
        visible={showEquipment}
        title="Select Equipment"
        options={ALL_EQUIPMENT}
        selected={selectedEquipment}
        multiSelect
        onToggle={toggleEquipment}
        onDone={() => setShowEquipment(false)}
      />

      <PickerModal
        visible={showMuscle}
        title="Target Muscle"
        options={muscleLabels}
        selected={selectedMuscleLabels}
        multiSelect
        onToggle={(label) => toggleMuscle(labelToId[label] ?? label)}
        onDone={() => setShowMuscle(false)}
      />

      <EditExerciseModal
        visible={editingIndex !== null}
        exercise={editingIndex !== null ? exercises[editingIndex] : null}
        sets={draftSets}
        reps={draftReps}
        onChangeSets={setDraftSets}
        onChangeReps={setDraftReps}
        onDone={saveEdit}
        onReset={resetEdit}
      />

      {/* ── Countdown overlay ───────────────────────── */}
      {showCountdown && (
        <CountdownOverlay
          onDone={() => {
            setShowCountdown(false);
            onStartWorkout?.(buildFinalExercises(), workoutTitle);
          }}
        />
      )}
    </View>
  );
}

// ── Duration modal styles ─────────────────────────────────────
const dur = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 4,
  },
  card: {
    width: (SW - 48 - 12) / 2,
    backgroundColor: '#1C1C24',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#252530',
  },
  cardActive: {
    borderColor: '#FFB800',
    backgroundColor: 'rgba(255,184,0,0.08)',
  },
  min: {
    fontSize: 42,
    fontWeight: '900',
    color: '#555568',
    letterSpacing: -1,
  },
  minActive: {
    color: '#FFB800',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555568',
    marginTop: -4,
    marginBottom: 8,
  },
  labelActive: {
    color: '#FFB800',
  },
  exCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3A3A50',
    backgroundColor: '#1A1A26',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  exCountActive: {
    color: '#D89200',
    backgroundColor: 'rgba(255,184,0,0.12)',
  },
});

// ── Exercise row styles ───────────────────────────────────────
const ex = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#16161E',
  },
  dragHandle: {
    marginRight: 10,
    opacity: 0.3,
  },
  dragDots: {
    fontSize: 18,
    color: '#9999AA',
    letterSpacing: -2,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#252530',
  },
  emoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  meta: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9999AA',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1C1C24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#252530',
  },
  badgeNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555568',
  },
  editedTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFB800',
    backgroundColor: 'rgba(255,184,0,0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  editHint: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1C1C24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#252530',
  },
  editHintText: {
    fontSize: 13,
    color: '#555568',
  },
});

// ── Modal styles ──────────────────────────────────────────────
const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111116',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: '#252530',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333344',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  doneBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,184,0,0.15)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.3)',
  },
  doneText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFB800',
  },
  selectedCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFB800',
    marginBottom: 10,
    marginTop: 2,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#18181E',
  },
  optionActive: {
    backgroundColor: 'rgba(255,184,0,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.25)',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9999AA',
  },
  optionTextActive: {
    color: '#FFB800',
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFB800',
  },
});

// ── Main screen styles ────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },

  // Title row
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  workoutTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    flex: 1,
    marginRight: 12,
  },
  lightningBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightningIcon: {
    fontSize: 18,
  },

  // Filter chips
  filtersScroll: {
    maxHeight: 52,
    marginBottom: 6,
  },
  filtersRow: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1A1A22',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#252530',
  },
  chipActive: {
    backgroundColor: 'rgba(255,184,0,0.12)',
    borderColor: 'rgba(255,184,0,0.35)',
  },
  chipDots: {
    paddingHorizontal: 12,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CCCCDD',
  },
  chipTextActive: {
    color: '#FFB800',
  },
  chipArrow: {
    fontSize: 10,
    color: '#555568',
    marginTop: 1,
  },

  // Exercise list
  exerciseList: {
    paddingTop: 8,
  },

  // Start button
  startBtnWrap: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  startBtn: {
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0B0B0F',
    letterSpacing: 0.4,
  },
});

// ── Edit exercise modal styles ────────────────────────────────
const edt = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111116',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: '#252530',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333344',
    alignSelf: 'center',
    marginBottom: 20,
  },
  exHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  exCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#252530',
  },
  exEmoji: { fontSize: 22 },
  exName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  exMuscles: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555568',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#252530',
    marginBottom: 20,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9999AA',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    backgroundColor: '#1C1C24',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#252530',
    overflow: 'hidden',
  },
  stepBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.3,
  },
  stepBtnText: {
    fontSize: 22,
    fontWeight: '300',
    color: '#FFB800',
  },
  stepValue: {
    width: 44,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  repsInput: {
    backgroundColor: '#1C1C24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252530',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    minWidth: 100,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#1C1C24',
    borderWidth: 1,
    borderColor: '#252530',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9999AA',
  },
  doneBtn: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  doneBtnGrad: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0B0B0F',
    letterSpacing: 0.3,
  },
});
