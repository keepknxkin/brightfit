import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, ScrollView, StatusBar, Alert,
  Animated, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  useWorkout,
  CompletedExercise,
  CompletedSet,
  WorkoutRecord,
  ResumeSetRow,
} from '../context/WorkoutContext';
import ExerciseIcon from '../components/ExerciseIcon';

const { width: SW } = Dimensions.get('window');

// ── Colors ───────────────────────────────────────────────────
const C = {
  bg: '#0B0B0F',
  surface: '#141418',
  surfaceRaised: '#1C1C22',
  border: '#252530',
  gold: '#FFB800',
  goldDeep: '#D89200',
  green: '#4CAF7D',
  white: '#FFFFFF',
  muted: '#9999AA',
  dimmed: '#555568',
  red: '#E05555',
};

// ── Types ────────────────────────────────────────────────────
export interface SessionExercise {
  name: string;
  muscles: string[];
  equipment: string[];
  sets: number;
  reps: string;
  emoji: string;
  suggestedWeight?: number;
}

interface Props {
  exercises: SessionExercise[];
  title: string;
  onExit: () => void;
  onFinished: (record: WorkoutRecord) => void;
  // Resuming an abandoned workout
  initialSetData?: ResumeSetRow[][];
  initialExIdx?: number;
  initialElapsed?: number;
}

interface SetRow { weight: number; reps: number; done: boolean }

// ── Helpers ──────────────────────────────────────────────────
const REST_DURATION = 60;

function defaultWeight(ex: SessionExercise): number {
  if (ex.suggestedWeight !== undefined) return ex.suggestedWeight;
  if (ex.equipment.length === 0) return 0;
  if (ex.equipment.some(e => e === 'Barbell')) return 95;
  if (ex.equipment.some(e => e === 'Dumbbells')) return 30;
  if (ex.equipment.some(e => e === 'Kettlebell')) return 35;
  return 45;
}

function defaultReps(ex: SessionExercise): number {
  const n = parseInt(ex.reps);
  return isNaN(n) ? 12 : n;
}

function isBodyweight(ex: SessionExercise) { return ex.equipment.length === 0; }
function isTimed(ex: SessionExercise) { return ex.reps.includes('s'); }

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function muscleLabel(m: string): string {
  const map: Record<string, string> = {
    chest: 'Chest', upperBack: 'Back', lowerBack: 'Lower Back',
    shoulders: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps',
    forearms: 'Forearms', core: 'Core', obliques: 'Obliques',
    quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes',
    calves: 'Calves', hipFlexors: 'Hip Flexors', fullBody: 'Full Body',
  };
  return map[m] ?? m;
}

function calcOneRM(weight: number, reps: number): string {
  if (weight === 0) return '—';
  return (weight * (1 + reps / 30)).toFixed(1);
}

function initSetData(exercises: SessionExercise[]): SetRow[][] {
  return exercises.map(ex =>
    Array.from({ length: ex.sets }, () => ({
      weight: defaultWeight(ex),
      reps: defaultReps(ex),
      done: false,
    }))
  );
}

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export default function WorkoutSessionScreen({
  exercises, title, onExit, onFinished,
  initialSetData, initialExIdx, initialElapsed,
}: Props) {
  const { addWorkout } = useWorkout();

  const [elapsed, setElapsed] = useState(initialElapsed ?? 0);
  const elapsedRef = useRef(initialElapsed ?? 0);

  const [exIdx, setExIdx] = useState(initialExIdx ?? 0);
  const exIdxRef = useRef(initialExIdx ?? 0);
  exIdxRef.current = exIdx;

  const [setData, setSetData] = useState<SetRow[][]>(() =>
    initialSetData ? initialSetData : initSetData(exercises)
  );

  // Which cell is being edited: row + col
  const [editCell, setEditCell] = useState<{ row: number; col: 'weight' | 'reps' } | null>(null);

  // Rest: stores the next exercise index while resting, null = not resting
  const [restingForNext, setRestingForNext] = useState<number | null>(null);
  const [restLeft, setRestLeft] = useState(REST_DURATION);

  // Finish
  const [isFinished, setIsFinished] = useState(false);
  const [finalRecord, setFinalRecord] = useState<WorkoutRecord | null>(null);

  // Swipe animation
  const slideX = useRef(new Animated.Value(0)).current;

  const currentEx = exercises[exIdx];
  const currentSets = setData[exIdx] ?? [];
  const currentSetIdx = currentSets.findIndex(s => !s.done);
  const bw = isBodyweight(currentEx);
  const timed = isTimed(currentEx);

  // ── Timers ───────────────────────────────────────────────
  useEffect(() => {
    if (isFinished) return;
    const id = setInterval(() => { elapsedRef.current += 1; setElapsed(s => s + 1); }, 1000);
    return () => clearInterval(id);
  }, [isFinished]);

  const isResting = restingForNext !== null;

  useEffect(() => {
    if (!isResting) return;
    if (restLeft <= 0) {
      const next = restingForNext!;
      setRestingForNext(null);
      setRestLeft(REST_DURATION);
      navigateTo(next, 'left');
      return;
    }
    const id = setInterval(() => setRestLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [isResting, restLeft]);

  // ── Navigate with slide animation ───────────────────────
  function navigateTo(idx: number, direction: 'left' | 'right') {
    const outX = direction === 'left' ? -SW : SW;
    const inX  = direction === 'left' ?  SW : -SW;
    setEditCell(null);
    Animated.timing(slideX, {
      toValue: outX, duration: 210, useNativeDriver: true,
    }).start(() => {
      setExIdx(idx);
      slideX.setValue(inX);
      Animated.spring(slideX, {
        toValue: 0, damping: 18, stiffness: 220, useNativeDriver: true,
      }).start();
    });
  }

  // ── Swipe gesture (on hero card only) ───────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.8,
      onPanResponderMove: (_, g) => slideX.setValue(g.dx),
      onPanResponderRelease: (_, g) => {
        const idx = exIdxRef.current;
        if (g.dx < -60 && idx < exercises.length - 1) {
          navigateTo(idx + 1, 'left');
        } else if (g.dx > 60 && idx > 0) {
          navigateTo(idx - 1, 'right');
        } else {
          Animated.spring(slideX, { toValue: 0, damping: 18, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  // ── Log Set ──────────────────────────────────────────────
  function logSet() {
    if (currentSetIdx === -1) return;
    const updatedSets = currentSets.map((s, i) =>
      i === currentSetIdx ? { ...s, done: true } : s
    );
    const newData = setData.map((ex, i) => i === exIdx ? updatedSets : ex);
    setSetData(newData);
    setEditCell(null);

    if (updatedSets.every(s => s.done)) {
      const next = exIdx + 1;
      if (next >= exercises.length) {
        buildRecord(newData);
      } else {
        setRestingForNext(next);
        setRestLeft(REST_DURATION);
      }
    }
  }

  // ── Add a set ────────────────────────────────────────────
  function addSet() {
    setSetData(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const last = ex[ex.length - 1];
      return [...ex, {
        weight: last?.weight ?? defaultWeight(currentEx),
        reps: last?.reps ?? defaultReps(currentEx),
        done: false,
      }];
    }));
  }

  // ── Edit cell value ──────────────────────────────────────
  function updateCell(row: number, col: 'weight' | 'reps', delta: number) {
    setSetData(prev => prev.map((ex, i) =>
      i !== exIdx ? ex : ex.map((s, j) =>
        j !== row ? s : {
          ...s,
          weight: col === 'weight' ? Math.max(0, +(s.weight + delta).toFixed(1)) : s.weight,
          reps:   col === 'reps'   ? Math.max(1, s.reps + delta) : s.reps,
        }
      )
    ));
  }

  // ── Skip rest ────────────────────────────────────────────
  function skipRest() {
    const next = restingForNext!;
    setRestingForNext(null);
    setRestLeft(REST_DURATION);
    navigateTo(next, 'left');
  }

  // ── Build record ─────────────────────────────────────────
  function buildRecord(data: SetRow[][], completed = true) {
    const completedExs: CompletedExercise[] = exercises.map((ex, i) => ({
      name: ex.name, muscles: ex.muscles, emoji: ex.emoji,
      sets: data[i].filter(s => s.done).map(s => ({ weight: s.weight, reps: s.reps } as CompletedSet)),
    }));
    const totalVolume = completedExs.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0,
    );
    // Only log muscles where at least one set was done
    const musclesWorked = [...new Set(
      completedExs.filter(ex => ex.sets.length > 0).flatMap(ex => ex.muscles),
    )];
    const record: WorkoutRecord = {
      id: Date.now().toString(), date: new Date(),
      durationSeconds: elapsedRef.current, title,
      exercises: completedExs, totalVolume, musclesWorked,
      completed,
      resumeData: !completed ? {
        title,
        exercises,
        setData: data.map(ex => ex.map(s => ({ weight: s.weight, reps: s.reps, done: s.done }))),
        exIdx: exIdxRef.current,
        elapsed: elapsedRef.current,
      } : undefined,
    };
    addWorkout(record);
    if (completed) {
      setFinalRecord(record);
      setIsFinished(true);
      onFinished(record);
    }
    return record;
  }

  function handleExit() {
    const hasSomething = setData.some(ex => ex.some(s => s.done));
    Alert.alert(
      'Exit Workout?',
      hasSomething
        ? 'Save your progress so far, or discard and exit?'
        : 'No sets logged yet. Exit without saving?',
      [
        { text: 'Cancel', style: 'cancel' },
        ...(hasSomething ? [{
          text: 'Save & Exit',
          onPress: () => { buildRecord(setData, false); onExit(); },
        }] : []),
        { text: 'Discard', style: 'destructive', onPress: onExit },
      ],
    );
  }

  // ── Finish ───────────────────────────────────────────────
  if (isFinished && finalRecord) return <FinishScreen record={finalRecord} onDone={onExit} />;

  // ── Rest screen ──────────────────────────────────────────
  if (isResting) {
    const nextEx = restingForNext !== null ? exercises[restingForNext] : null;
    return (
      <View style={S.container}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={S.header}>
            <TouchableOpacity onPress={handleExit} style={S.exitBtn}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
            <View style={S.restHeaderTimer}>
              <Text style={S.restHeaderTimerLabel}>ELAPSED</Text>
              <Text style={S.restHeaderTimerText}>{formatTime(elapsed)}</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
          <View style={rest.container}>
            <Text style={rest.label}>REST</Text>
            <Text style={rest.countdown}>{formatTime(restLeft)}</Text>
            <View style={rest.barTrack}>
              <View style={[rest.barFill, { width: `${((REST_DURATION - restLeft) / REST_DURATION) * 100}%` as any }]} />
            </View>
            {nextEx && (
              <View style={rest.nextCard}>
                <Text style={rest.nextUp}>NEXT UP</Text>
                <ExerciseIcon emoji={nextEx.emoji} size={38} color={C.gold} />
                <Text style={rest.nextName}>{nextEx.name}</Text>
              </View>
            )}
            <View style={rest.btnRow}>
              <TouchableOpacity style={rest.skipBtn} onPress={skipRest} activeOpacity={0.8}>
                <Text style={rest.skipText}>Skip Rest</Text>
              </TouchableOpacity>
              <TouchableOpacity style={rest.addBtn} onPress={() => setRestLeft(s => s + 30)} activeOpacity={0.8}>
                <Text style={rest.addText}>+30s</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Active exercise screen ────────────────────────────────
  const editRow = editCell?.row ?? -1;
  const editCol = editCell?.col ?? null;
  const editedSet = editRow >= 0 ? currentSets[editRow] : null;

  // 1RM from first set's values
  const oneRM = bw ? null : calcOneRM(currentSets[0]?.weight ?? 0, currentSets[0]?.reps ?? 0);

  return (
    <View style={S.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>

        {/* ── Header ── */}
        <View style={S.header}>
          <TouchableOpacity onPress={handleExit} style={S.exitBtn}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={S.headerTitle} numberOfLines={1}>{title}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Big elapsed timer ── */}
        <View style={S.bigTimerWrap}>
          <Text style={S.bigTimerLabel}>ELAPSED</Text>
          <Text style={S.bigTimerText}>{formatTime(elapsed)}</Text>
        </View>

        {/* ── Progress dots ── */}
        <View style={S.dotsRow}>
          {exercises.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => i !== exIdx && navigateTo(i, i > exIdx ? 'left' : 'right')}
              activeOpacity={0.7}
            >
              <View style={[
                S.dot,
                i === exIdx && S.dotActive,
                setData[i]?.every(s => s.done) && S.dotDone,
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Swipeable area: hero + table ── */}
        <Animated.View style={[S.swipeArea, { transform: [{ translateX: slideX }] }]}>

          {/* Hero card — pan handlers here to avoid scroll conflict */}
          <LinearGradient
            colors={['#1C1A28', '#0F0F18']}
            style={S.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            {...panResponder.panHandlers}
          >
            <LinearGradient colors={[C.gold, C.goldDeep]} style={S.heroEmojiCircle}>
              <ExerciseIcon emoji={currentEx.emoji} size={34} color="#0B0B0F" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={S.exName} numberOfLines={2}>{currentEx.name}</Text>
              <Text style={S.exMuscles}>{currentEx.muscles.map(muscleLabel).join(' · ')}</Text>
            </View>
            {oneRM && (
              <View style={S.oneRMBadge}>
                <Text style={S.oneRMLabel}>1RM</Text>
                <Text style={S.oneRMValue}>{oneRM}</Text>
              </View>
            )}
          </LinearGradient>

          {/* ── Set table ── */}
          <View style={S.table}>
            {/* Column headers */}
            <View style={S.tableHead}>
              <Text style={[S.colHead, S.colSet]}>SET</Text>
              {!bw && <Text style={[S.colHead, S.colLbs]}>LBS</Text>}
              <Text style={[S.colHead, S.colReps]}>{timed ? 'SEC' : 'REPS'}</Text>
              <View style={S.colTick} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 260 }}
              keyboardShouldPersistTaps="handled"
            >
              {currentSets.map((s, i) => {
                const isCur  = i === currentSetIdx;
                const isDone = s.done;
                const isEdit = editRow === i;

                return (
                  <View
                    key={i}
                    style={[
                      S.tableRow,
                      isCur && S.tableRowCurrent,
                      isDone && S.tableRowDone,
                    ]}
                  >
                    {/* Set # */}
                    <Text style={[S.colSet, S.cellText, isCur && S.cellGold, isDone && S.cellGreen]}>
                      {i + 1}
                    </Text>

                    {/* Weight */}
                    {!bw && (
                      <TouchableOpacity
                        style={[S.colLbs, isEdit && editCol === 'weight' && S.cellActive]}
                        onPress={() => !isDone && setEditCell(
                          editRow === i && editCol === 'weight' ? null : { row: i, col: 'weight' }
                        )}
                        activeOpacity={0.7}
                      >
                        <Text style={[S.cellText, S.cellNum, isCur && S.cellGold, isDone && S.cellMuted]}>
                          {s.weight}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Reps */}
                    <TouchableOpacity
                      style={[S.colReps, isEdit && editCol === 'reps' && S.cellActive]}
                      onPress={() => !isDone && setEditCell(
                        editRow === i && editCol === 'reps' ? null : { row: i, col: 'reps' }
                      )}
                      activeOpacity={0.7}
                    >
                      <Text style={[S.cellText, S.cellNum, isCur && S.cellGold, isDone && S.cellMuted]}>
                        {s.reps}
                      </Text>
                    </TouchableOpacity>

                    {/* Tick */}
                    <View style={S.colTick}>
                      {isDone
                        ? (
                          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                            <Path d="M5 12l4 4 10-10" stroke="#4CAF50" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        )
                        : isCur
                          ? <View style={S.checkRing} />
                          : <View style={S.checkDim} />}
                    </View>
                  </View>
                );
              })}

              {/* Add set row */}
              <TouchableOpacity style={S.addRow} onPress={addSet} activeOpacity={0.7}>
                <Text style={[S.colSet, S.addIcon]}>+</Text>
                {!bw && <Text style={[S.colLbs, S.cellText, S.cellMuted]}>—</Text>}
                <Text style={[S.colReps, S.cellText, S.cellMuted]}>—</Text>
                <View style={S.colTick} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Animated.View>

        {/* ── Inline stepper (outside swipeable area) ── */}
        {editCell && editedSet && (
          <View style={S.editPanel}>
            <Text style={S.editLabel}>
              {editCol === 'weight' ? 'Weight (lbs)' : timed ? 'Seconds' : 'Reps'} — Set {editRow + 1}
            </Text>
            <View style={S.editStepper}>
              <TouchableOpacity
                style={S.stepBtn}
                onPress={() => updateCell(editRow, editCol!, editCol === 'weight' ? -2.5 : -1)}
                activeOpacity={0.7}
              >
                <Text style={S.stepTxt}>−</Text>
              </TouchableOpacity>
              <Text style={S.stepVal}>
                {editCol === 'weight' ? editedSet.weight : editedSet.reps}
              </Text>
              <TouchableOpacity
                style={S.stepBtn}
                onPress={() => updateCell(editRow, editCol!, editCol === 'weight' ? 2.5 : 1)}
                activeOpacity={0.7}
              >
                <Text style={S.stepTxt}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Bottom bar ── */}
        <View style={S.bottomBar}>
          <TouchableOpacity
            style={S.logBtnWrap}
            onPress={logSet}
            activeOpacity={0.88}
            disabled={currentSetIdx === -1}
          >
            <LinearGradient
              colors={currentSetIdx === -1 ? ['#1C1C24', '#1C1C24'] : ['#FFD000', '#FF8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={S.logBtn}
            >
              <Text style={[S.logBtnText, currentSetIdx === -1 && { color: C.dimmed }]}>
                {currentSetIdx === -1 ? 'All Sets Done' : `Log Set ${currentSetIdx + 1}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Finish screen
// ─────────────────────────────────────────────────────────────
function FinishScreen({ record, onDone }: { record: WorkoutRecord; onDone: () => void }) {
  const totalSets = record.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const uniqueMuscles = [...new Set(record.musclesWorked)];

  function mLabel(m: string): string {
    const map: Record<string, string> = {
      chest: 'Chest', upperBack: 'Back', lowerBack: 'Lower Back',
      shoulders: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps',
      forearms: 'Forearms', core: 'Core', obliques: 'Obliques',
      quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes',
      calves: 'Calves', hipFlexors: 'Hip Flexors', fullBody: 'Full Body',
    };
    return map[m] ?? m;
  }

  return (
    <View style={S.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={fin.scroll}>
          <LinearGradient colors={['#1A1610', '#0B0B0F']} style={fin.hero} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
            <View style={fin.trophyWrap}>
              <Svg width={52} height={52} viewBox="0 0 24 24" fill="none">
                <Path d="M6 3h12v8a6 6 0 01-12 0V3z" stroke={C.gold} strokeWidth="1.8" strokeLinejoin="round" />
                <Path d="M6 5H3.5a2.5 2.5 0 000 5H6M18 5h2.5a2.5 2.5 0 010 5H18" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" />
                <Path d="M10 17v3M14 17v3M8 20h8" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={fin.congrats}>Workout Complete!</Text>
            <Text style={fin.subtitle}>{record.title}</Text>
          </LinearGradient>

          <View style={fin.statsRow}>
            {[
              { v: formatTime(record.durationSeconds), l: 'Duration' },
              { v: record.totalVolume >= 1000 ? `${(record.totalVolume / 1000).toFixed(1)}k` : String(record.totalVolume), l: 'Lbs Lifted' },
              { v: String(totalSets), l: 'Sets Done' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.l}>
                <View style={fin.stat}>
                  <Text style={fin.statValue}>{s.v}</Text>
                  <Text style={fin.statLabel}>{s.l}</Text>
                </View>
                {i < arr.length - 1 && <View style={fin.statDiv} />}
              </React.Fragment>
            ))}
          </View>

          <Text style={fin.sectionTitle}>Exercises Completed</Text>
          <View style={fin.card}>
            {record.exercises.map((ex, i) => (
              <View key={i} style={[fin.exRow, i < record.exercises.length - 1 && fin.exBorder]}>
                <View style={fin.exIconWrap}>
                  <ExerciseIcon emoji={ex.emoji} size={20} color={C.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={fin.exName}>{ex.name}</Text>
                  <Text style={fin.exMeta}>
                    {ex.sets.length} sets ·{' '}
                    {ex.sets.map(s => s.weight > 0 ? `${s.weight}lbs × ${s.reps}` : `${s.reps} reps`).join(', ')}
                  </Text>
                </View>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 12l4 4 10-10" stroke="#4CAF50" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            ))}
          </View>

          <Text style={fin.sectionTitle}>Muscles Worked</Text>
          <View style={fin.muscleWrap}>
            {uniqueMuscles.map(m => (
              <View key={m} style={fin.pill}>
                <Text style={fin.pillText}>{mLabel(m)}</Text>
              </View>
            ))}
          </View>

          <View style={fin.pointsBanner}>
            <View style={fin.pointsIconWrap}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  stroke={C.gold} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"
                />
              </Svg>
            </View>
            <View>
              <Text style={fin.pointsVal}>+10 Star Points</Text>
              <Text style={fin.pointsSub}>Earned for completing this workout</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onDone} activeOpacity={0.88} style={{ borderRadius: 28, overflow: 'hidden' }}>
            <LinearGradient colors={['#FFD000', '#FF8C00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={fin.doneBtn}>
              <Text style={fin.doneBtnText}>Back to Home</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const COL_SET  = 44;
const COL_LBS  = 80;
const COL_REPS = 80;

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  exitBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  exitText: { fontSize: 16, fontWeight: '700', color: C.muted }, // kept for compat
  headerTitle: { fontSize: 14, fontWeight: '700', color: C.white, textAlign: 'center' },

  // Big centered elapsed timer
  bigTimerWrap: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },
  bigTimerLabel: {
    fontSize: 10, fontWeight: '700', color: C.dimmed,
    letterSpacing: 2.5, marginBottom: 2,
  },
  bigTimerText: {
    fontSize: 52, fontWeight: '900', color: C.gold,
    letterSpacing: -3, fontVariant: ['tabular-nums'],
  },

  // Elapsed time in rest screen header
  restHeaderTimer: { flex: 1, alignItems: 'center' },
  restHeaderTimerLabel: {
    fontSize: 9, fontWeight: '700', color: C.dimmed, letterSpacing: 2,
  },
  restHeaderTimerText: {
    fontSize: 16, fontWeight: '800', color: C.gold, fontVariant: ['tabular-nums'],
  },

  // Progress dots
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 6, paddingVertical: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.surfaceRaised, borderWidth: 1, borderColor: C.border,
  },
  dotActive: { backgroundColor: C.gold, borderColor: C.gold, width: 20, borderRadius: 4 },
  dotDone: { backgroundColor: C.green, borderColor: C.green },

  // Swipeable container
  swipeArea: { flex: 1 },

  // Hero card
  heroCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, borderRadius: 18,
    padding: 16, gap: 14,
    marginBottom: 4,
    borderWidth: 1, borderColor: C.border,
  },
  heroEmojiCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  heroEmoji: { fontSize: 28 }, // kept for compat
  exName: { fontSize: 17, fontWeight: '800', color: C.white, letterSpacing: -0.3, marginBottom: 4 },
  exMuscles: { fontSize: 12, fontWeight: '500', color: C.muted },
  oneRMBadge: { alignItems: 'center', gap: 2 },
  oneRMLabel: { fontSize: 9, fontWeight: '700', color: C.dimmed, letterSpacing: 1 },
  oneRMValue: { fontSize: 16, fontWeight: '900', color: C.gold },

  // Table
  table: {
    marginHorizontal: 16,
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1, borderColor: C.border,
    overflow: 'hidden',
    marginTop: 10,
  },
  tableHead: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.surfaceRaised,
  },
  colHead: {
    fontSize: 10, fontWeight: '700', color: C.dimmed, letterSpacing: 1.2,
  },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  tableRowCurrent: { backgroundColor: 'rgba(255,184,0,0.06)' },
  tableRowDone: { backgroundColor: 'transparent' },

  // Columns (shared between head + rows)
  colSet:  { width: COL_SET },
  colLbs:  { width: COL_LBS, alignItems: 'center' as any, textAlign: 'center' as any },
  colReps: { flex: 1, alignItems: 'center' as any, textAlign: 'center' as any },
  colTick: { width: 36, alignItems: 'center' as any, justifyContent: 'center' as any },

  cellText: { fontSize: 14, fontWeight: '600', color: C.muted },
  cellNum:  { fontSize: 16, fontWeight: '800' },
  cellGold: { color: C.gold },
  cellGreen:{ color: C.green },
  cellMuted:{ color: C.dimmed },
  cellActive: { backgroundColor: 'rgba(255,184,0,0.15)', borderRadius: 8 },

  checkGreen: { fontSize: 15, color: C.green, fontWeight: '700' },
  checkRing: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: C.gold,
  },
  checkDim: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 1.5, borderColor: C.border,
  },

  addRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  addIcon: { fontSize: 20, fontWeight: '700', color: C.gold, width: COL_SET },

  // Edit stepper
  editPanel: {
    marginHorizontal: 16, marginTop: 10,
    backgroundColor: C.surface,
    borderRadius: 16, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  editLabel: { fontSize: 13, fontWeight: '600', color: C.muted },
  editStepper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfaceRaised, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  stepBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { fontSize: 22, fontWeight: '300', color: C.gold },
  stepVal: {
    width: 56, textAlign: 'center',
    fontSize: 18, fontWeight: '800', color: C.white,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    borderTopWidth: 1, borderTopColor: C.border,
    backgroundColor: C.surface,
  },
  logBtnWrap: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  logBtn: {
    paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
    borderRadius: 16,
  },
  logBtnText: {
    fontSize: 16, fontWeight: '900', color: '#0B0B0F', letterSpacing: 0.3,
  },
});

// ─────────────────────────────────────────────────────────────
// Rest screen styles
// ─────────────────────────────────────────────────────────────
const rest = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 22 },
  label: { fontSize: 13, fontWeight: '800', color: C.gold, letterSpacing: 3 },
  countdown: { fontSize: 80, fontWeight: '900', color: C.white, letterSpacing: -2 },
  barTrack: { width: SW - 48, height: 5, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: C.gold, borderRadius: 3 },
  nextCard: {
    width: SW - 48, alignItems: 'center', gap: 6,
    backgroundColor: C.surface, borderRadius: 18,
    borderWidth: 1, borderColor: C.border,
    paddingVertical: 18, paddingHorizontal: 24,
  },
  nextUp: { fontSize: 10, fontWeight: '700', color: C.dimmed, letterSpacing: 1.5 },
  nextEmoji: { fontSize: 32 }, // kept for compat
  nextName: { fontSize: 16, fontWeight: '700', color: C.white },
  btnRow: { flexDirection: 'row', gap: 12, width: SW - 48 },
  skipBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 16,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  skipText: { fontSize: 15, fontWeight: '700', color: C.white },
  addBtn: {
    paddingVertical: 15, paddingHorizontal: 24, borderRadius: 16,
    backgroundColor: 'rgba(255,184,0,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,184,0,0.3)', alignItems: 'center',
  },
  addText: { fontSize: 15, fontWeight: '700', color: C.gold },
});

// ─────────────────────────────────────────────────────────────
// Finish screen styles
// ─────────────────────────────────────────────────────────────
const fin = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  hero: { borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 20, gap: 6 },
  trophy: { fontSize: 64, marginBottom: 8 }, // kept for compat
  trophyWrap: { marginBottom: 8 },
  congrats: { fontSize: 26, fontWeight: '900', color: C.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontWeight: '500', color: C.muted },
  statsRow: {
    flexDirection: 'row', backgroundColor: C.surface,
    borderRadius: 18, borderWidth: 1, borderColor: C.border,
    marginBottom: 20, paddingVertical: 20,
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '900', color: C.gold },
  statLabel: { fontSize: 11, fontWeight: '500', color: C.muted },
  statDiv: { width: 1, backgroundColor: C.border },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: C.dimmed, letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.border, marginBottom: 20, overflow: 'hidden' },
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  exBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  exEmoji: { fontSize: 22, width: 32, textAlign: 'center' }, // kept for compat
  exIconWrap: { width: 32, alignItems: 'center', justifyContent: 'center' },
  exName: { fontSize: 14, fontWeight: '700', color: C.white, marginBottom: 2 },
  exMeta: { fontSize: 11, color: C.muted },
  exCheck: { fontSize: 16, color: C.green },
  muscleWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  pill: {
    backgroundColor: 'rgba(255,184,0,0.12)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,184,0,0.25)',
  },
  pillText: { fontSize: 13, fontWeight: '700', color: C.gold },
  pointsBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border,
    padding: 16, marginBottom: 24,
  },
  pointsIcon: { fontSize: 32 }, // kept for compat
  pointsIconWrap: { width: 36, alignItems: 'center', justifyContent: 'center' },
  pointsVal: { fontSize: 18, fontWeight: '800', color: C.white },
  pointsSub: { fontSize: 12, color: C.muted },
  doneBtn: {
    paddingVertical: 18, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF8C00', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
  },
  doneBtnText: { fontSize: 17, fontWeight: '900', color: '#0B0B0F', letterSpacing: 0.4 },
});
