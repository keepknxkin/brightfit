import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import ExerciseIcon from '../components/ExerciseIcon';
import { LinearGradient } from 'expo-linear-gradient';
import AddExerciseScreen from './AddExerciseScreen';
import { SessionExercise } from './WorkoutSessionScreen';
import EditExerciseModal from '../components/EditExerciseModal';

interface Props {
  onExit: () => void;
  onFinish?: () => void;
  /** Launches the same WorkoutSessionScreen used by Quick + Trending. */
  onStartWorkout?: (exercises: SessionExercise[], title: string) => void;
}

const C = {
  bg: '#0B0B0F',
  surface: '#141418',
  surfaceRaised: '#1C1C22',
  border: '#252530',
  gold: '#FFB800',
  goldDeep: '#D89200',
  white: '#FFFFFF',
  muted: '#9999AA',
  dimmed: '#555568',
  red: '#E05555',
};

function ChevronDownIcon({ size = 22, color = C.white }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DumbbellIcon({ size = 64, color = C.dimmed }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="1"  y="8"  width="3"  height="8" rx="1.5" fill={color} />
      <Rect x="4"  y="10" width="3"  height="4" rx="0.5" fill={color} />
      <Rect x="7"  y="11" width="10" height="2" rx="1"   fill={color} />
      <Rect x="17" y="10" width="3"  height="4" rx="0.5" fill={color} />
      <Rect x="20" y="8"  width="3"  height="8" rx="1.5" fill={color} />
    </Svg>
  );
}

function TrashIcon({ size = 16, color = C.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function EmptyWorkoutScreen({ onExit, onFinish, onStartWorkout }: Props) {
  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);

  // Edit modal state
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [originals, setOriginals] = useState<Record<number, { sets: number; reps: string }>>({});

  const editingEx = editIdx !== null ? exercises[editIdx] : null;

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const canStart = exercises.length > 0;

  function handleAddPicks(picks: SessionExercise[]) {
    setExercises(prev => [...prev, ...picks]);
    setShowAddExercise(false);
  }

  function removeExercise(idx: number) {
    setExercises(prev => prev.filter((_, i) => i !== idx));
    setOriginals(prev => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  }

  function openEdit(idx: number) {
    if (originals[idx] === undefined) {
      setOriginals(prev => ({
        ...prev,
        [idx]: { sets: exercises[idx].sets, reps: exercises[idx].reps },
      }));
    }
    setEditIdx(idx);
  }

  function updateSets(v: number) {
    if (editIdx === null) return;
    setExercises(prev =>
      prev.map((ex, i) => i === editIdx ? { ...ex, sets: v } : ex)
    );
  }

  function updateReps(v: string) {
    if (editIdx === null) return;
    setExercises(prev =>
      prev.map((ex, i) => i === editIdx ? { ...ex, reps: v } : ex)
    );
  }

  function resetEdit() {
    if (editIdx === null) return;
    const orig = originals[editIdx];
    if (orig) {
      setExercises(prev =>
        prev.map((ex, i) =>
          i === editIdx ? { ...ex, sets: orig.sets, reps: orig.reps } : ex
        )
      );
    }
  }

  function handleStart() {
    if (!canStart) return;
    const finalTitle =
      title.trim().length > 0
        ? title.trim()
        : `Quick Workout — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    onStartWorkout?.(exercises, finalTitle);
  }

  function handleDiscard() {
    if (exercises.length === 0) {
      onExit();
      return;
    }
    Alert.alert(
      'Discard workout?',
      'Your current workout will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onExit },
      ],
    );
  }

  // ── Add Exercise full-screen takeover ─────────────────────
  if (showAddExercise) {
    return (
      <AddExerciseScreen
        title="Add Exercise"
        confirmLabel="Add"
        onCancel={() => setShowAddExercise(false)}
        onConfirm={handleAddPicks}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* ── Header ─────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} activeOpacity={0.7} hitSlop={12} style={styles.headerLeft}>
          <ChevronDownIcon size={22} color={C.white} />
          <Text style={styles.headerTitle}>New Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={canStart ? handleStart : (onFinish ?? onExit)}
          activeOpacity={0.85}
          style={[styles.startButton, !canStart && styles.startButtonDisabled]}
          disabled={!canStart && !onFinish}
        >
          <Text style={[styles.startText, !canStart && styles.startTextDisabled]}>
            {canStart ? 'Start' : 'Finish'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Title input */}
      <View style={styles.titleWrap}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Workout title (optional)"
          placeholderTextColor={C.dimmed}
          maxLength={50}
        />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Exercises</Text>
          <Text style={[styles.statValue, styles.statValueGold]}>{exercises.length}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Total Sets</Text>
          <Text style={styles.statValue}>{totalSets}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Ready</Text>
          <Text style={styles.statValue}>{canStart ? 'Yes' : '—'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <DumbbellIcon size={56} color={C.dimmed} />
            <Text style={styles.emptyTitle}>Get started</Text>
            <Text style={styles.emptySubtitle}>Add an exercise to build your workout</Text>

            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.85}
              onPress={() => setShowAddExercise(true)}
            >
              <Text style={styles.addButtonPlus}>+</Text>
              <Text style={styles.addButtonText}>Add Exercise</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.discardButton}
              activeOpacity={0.8}
              onPress={handleDiscard}
            >
              <Text style={styles.discardText}>Discard Workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {exercises.map((ex, i) => (
              <TouchableOpacity
                key={`${ex.name}-${i}`}
                style={styles.exRow}
                activeOpacity={0.8}
                onPress={() => openEdit(i)}
              >
                <LinearGradient
                  colors={['#1E1C2A', '#141420']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.exBubble}
                >
                  <ExerciseIcon emoji={ex.emoji} size={22} color="#FFB800" />
                </LinearGradient>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.exName} numberOfLines={1}>{ex.name}</Text>
                  <Text style={styles.exMeta}>
                    {ex.sets} × {ex.reps}{ex.suggestedWeight ? ` · ${ex.suggestedWeight} lbs` : ''}
                  </Text>
                </View>
                <View style={styles.editHint}>
                  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#555568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#555568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <TouchableOpacity
                  onPress={() => removeExercise(i)}
                  hitSlop={10}
                  activeOpacity={0.7}
                  style={styles.removeBtn}
                >
                  <TrashIcon size={16} color={C.muted} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.addAnotherButton}
              activeOpacity={0.85}
              onPress={() => setShowAddExercise(true)}
            >
              <Text style={styles.addAnotherPlus}>+</Text>
              <Text style={styles.addAnotherText}>Add another exercise</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.startBigButton}
              activeOpacity={0.85}
              onPress={handleStart}
            >
              <Text style={styles.startBigText}>Start Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.discardInlineButton}
              activeOpacity={0.7}
              onPress={handleDiscard}
            >
              <Text style={styles.discardInlineText}>Discard Workout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Edit sets / reps modal */}
      <EditExerciseModal
        visible={editIdx !== null}
        exercise={editingEx}
        onChangeSets={updateSets}
        onChangeReps={updateReps}
        onReset={resetEdit}
        onDone={() => setEditIdx(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.2,
  },
  startButton: {
    backgroundColor: C.gold,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonDisabled: {
    backgroundColor: C.surfaceRaised,
    borderWidth: 1,
    borderColor: C.border,
  },
  startText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 0.2,
  },
  startTextDisabled: {
    color: C.dimmed,
  },

  // Title
  titleWrap: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: C.white,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: C.white,
  },
  statValueGold: {
    color: C.gold,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: C.border,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 40,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.white,
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: C.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.gold,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  addButtonPlus: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0B0B0F',
    lineHeight: 20,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B0B0F',
    letterSpacing: 0.2,
  },
  discardButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    marginTop: 8,
  },
  discardText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.red,
  },

  // Exercise rows
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
  },
  exBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  exEmoji: { fontSize: 22 },
  exName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
    letterSpacing: -0.1,
  },
  exMeta: {
    fontSize: 12,
    fontWeight: '500',
    color: C.muted,
  },
  editHint: {
    paddingHorizontal: 4,
  },
  editHintText: {
    fontSize: 14,
    color: C.dimmed,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surfaceRaised,
    borderWidth: 1,
    borderColor: C.border,
  },

  addAnotherButton: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,184,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.25)',
  },
  addAnotherPlus: {
    fontSize: 18,
    fontWeight: '900',
    color: C.gold,
    lineHeight: 20,
  },
  addAnotherText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.gold,
    letterSpacing: 0.2,
  },

  startBigButton: {
    marginTop: 18,
    backgroundColor: C.gold,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  startBigText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0B0B0F',
    letterSpacing: 0.4,
  },

  discardInlineButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  discardInlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.red,
  },
});
