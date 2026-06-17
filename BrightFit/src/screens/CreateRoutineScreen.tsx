import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import ExerciseIcon from '../components/ExerciseIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants';
import AddExerciseScreen from './AddExerciseScreen';
import { SessionExercise } from './WorkoutSessionScreen';
import { useWorkout, Routine, ResumeExercise } from '../context/WorkoutContext';
import EditExerciseModal from '../components/EditExerciseModal';

interface Props {
  onCancel: () => void;
  onSave?: (title: string) => void;
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

function TrashIcon({ size = 16, color = C.dimmed }: { size?: number; color?: string }) {
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

export default function CreateRoutineScreen({ onCancel, onSave }: Props) {
  const { addRoutine } = useWorkout();

  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);

  // Edit modal state
  const [editIdx, setEditIdx] = useState<number | null>(null);
  // Stash originals so Reset works
  const [originals, setOriginals] = useState<Record<number, { sets: number; reps: string }>>({});

  const editingEx = editIdx !== null ? exercises[editIdx] : null;

  const canSave = title.trim().length > 0 && exercises.length > 0;

  function handleSave() {
    if (!canSave) return;
    const routine: Routine = {
      id: Date.now().toString(),
      title: title.trim(),
      createdAt: new Date(),
      exercises: exercises as ResumeExercise[],
    };
    addRoutine(routine);
    onSave?.(routine.title);
  }

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
    // Stash original values only the first time
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

  // ── Add Exercise modal takeover ───────────────────────────
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} activeOpacity={0.7} hitSlop={12}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Create Routine</Text>

        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={canSave ? 0.7 : 1}
          disabled={!canSave}
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          hitSlop={12}
        >
          <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Routine title"
          placeholderTextColor={C.dimmed}
          maxLength={50}
        />
        <View style={styles.titleUnderline} />

        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <DumbbellIcon size={56} color={C.dimmed} />
            <Text style={styles.emptyText}>
              Get started by adding an exercise to your routine.
            </Text>

            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.85}
              onPress={() => setShowAddExercise(true)}
            >
              <Text style={styles.addButtonPlus}>+</Text>
              <Text style={styles.addButtonText}>Add exercise</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ marginTop: 8 }}>
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

            <Text style={styles.helperText}>
              Tap an exercise to edit its sets and reps. Saved routines appear under "Routines" on the Planned tab.
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryGold,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.2,
  },
  saveButton: {
    backgroundColor: colors.primaryGold,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: C.surfaceRaised,
    borderWidth: 1,
    borderColor: C.border,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 0.2,
  },
  saveTextDisabled: {
    color: C.dimmed,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: C.white,
    paddingVertical: 8,
  },
  titleUnderline: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 18,
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
  addButton: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primaryGold,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: colors.primaryGold,
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
    marginTop: 6,
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
    color: colors.primaryGold,
    lineHeight: 20,
  },
  addAnotherText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryGold,
    letterSpacing: 0.2,
  },

  helperText: {
    marginTop: 24,
    fontSize: 12,
    fontWeight: '500',
    color: C.dimmed,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 12,
  },
});
