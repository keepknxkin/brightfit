import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import ExerciseIcon from '../components/ExerciseIcon';
import { LinearGradient } from 'expo-linear-gradient';
import {
  EXERCISES,
  EQUIPMENT_OPTIONS,
  MUSCLE_OPTIONS,
  EquipmentId,
  MuscleId,
  Exercise,
  toSessionExercise,
  muscleLabel,
  filterExercises,
} from '../data/exercises';
import { SessionExercise } from './WorkoutSessionScreen';

const { height: SH } = Dimensions.get('window');

const C = {
  bg:            '#0B0B0F',
  surface:       '#141418',
  surfaceRaised: '#1C1C22',
  border:        '#252530',
  gold:          '#FFB800',
  goldDeep:      '#D89200',
  goldDim:       'rgba(255,184,0,0.12)',
  goldDimMid:    'rgba(255,184,0,0.25)',
  white:         '#FFFFFF',
  muted:         '#9999AA',
  dimmed:        '#555568',
};

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────
function SearchIcon({ size = 18, color = C.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
      <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function ChevronIcon({ size = 14, color = C.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlusIcon({ size = 18, color = C.gold }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon({ size = 18, color = '#0B0B0F' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12l4 4 10-10" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom-sheet filter picker (multi-select)
// ─────────────────────────────────────────────────────────────
interface FilterSheetProps<T extends string> {
  visible: boolean;
  title: string;
  options: { id: T; label: string }[];
  selected: T[];
  onToggle: (id: T) => void;
  onClear: () => void;
  onDone: () => void;
}

function FilterSheet<T extends string>({
  visible, title, options, selected, onToggle, onClear, onDone,
}: FilterSheetProps<T>) {
  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={sheet.overlay}>
        <View style={sheet.container}>
          <View style={sheet.handle} />
          <View style={sheet.header}>
            <TouchableOpacity onPress={onClear} hitSlop={10} activeOpacity={0.7}>
              <Text style={sheet.clearText}>{selected.length > 0 ? 'Clear' : ''}</Text>
            </TouchableOpacity>
            <Text style={sheet.title}>{title}</Text>
            <TouchableOpacity onPress={onDone} hitSlop={10} activeOpacity={0.7}>
              <Text style={sheet.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: SH * 0.6 }}
            renderItem={({ item }) => {
              const isOn = selected.includes(item.id);
              return (
                <TouchableOpacity
                  style={[sheet.row, isOn && sheet.rowActive]}
                  onPress={() => onToggle(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[sheet.iconBubble, isOn && sheet.iconBubbleActive]}>
                    <Text style={[sheet.iconBubbleText, isOn && sheet.iconBubbleTextActive]}>
                      {item.label.charAt(0)}
                    </Text>
                  </View>
                  <Text style={[sheet.rowText, isOn && sheet.rowTextActive]}>{item.label}</Text>
                  {isOn && (
                    <View style={sheet.checkPill}>
                      <CheckIcon size={14} color="#0B0B0F" />
                    </View>
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
// Inline edit bottom-sheet (sets + reps for a single exercise)
// ─────────────────────────────────────────────────────────────
interface EditSheetProps {
  visible: boolean;
  exercise: Exercise | null;
  sets: number;
  reps: string;
  onChangeSets: (v: number) => void;
  onChangeReps: (v: string) => void;
  onReset: () => void;
  onDone: () => void;
}

function EditSheet({ visible, exercise, sets, reps, onChangeSets, onChangeReps, onReset, onDone }: EditSheetProps) {
  if (!exercise) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={edt.overlay}>
          <View style={edt.sheet}>
            <View style={edt.handle} />

            {/* Exercise header */}
            <View style={edt.exHeader}>
              <LinearGradient
                colors={[C.gold, C.goldDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={edt.exCircle}
              >
                <ExerciseIcon emoji={exercise.emoji} size={24} color="#0B0B0F" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={edt.exName}>{exercise.name}</Text>
                <Text style={edt.exMuscle} numberOfLines={1}>
                  {muscleLabel(exercise.primaryMuscle)}
                </Text>
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
                  <Text style={edt.stepTxt}>−</Text>
                </TouchableOpacity>
                <Text style={edt.stepVal}>{sets}</Text>
                <TouchableOpacity
                  style={[edt.stepBtn, sets >= 10 && edt.stepBtnDisabled]}
                  activeOpacity={0.7}
                  onPress={() => onChangeSets(Math.min(10, sets + 1))}
                >
                  <Text style={edt.stepTxt}>+</Text>
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
                placeholder={exercise.defaultReps}
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
                <LinearGradient colors={[C.gold, C.goldDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={edt.doneBtnGrad}>
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

// ─────────────────────────────────────────────────────────────
// AddExerciseScreen
// ─────────────────────────────────────────────────────────────
interface Props {
  title?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (exercises: SessionExercise[]) => void;
}

export default function AddExerciseScreen({
  title = 'Add Exercise',
  confirmLabel = 'Add',
  onCancel,
  onConfirm,
}: Props) {
  const [search, setSearch]           = useState('');
  const [equipment, setEquipment]     = useState<EquipmentId[]>([]);
  const [muscles, setMuscles]         = useState<MuscleId[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [equipSheet, setEquipSheet]   = useState(false);
  const [muscleSheet, setMuscleSheet] = useState(false);

  // Per-exercise custom sets/reps (only stored when user edits)
  const [customSets, setCustomSets] = useState<Record<string, number>>({});
  const [customReps, setCustomReps] = useState<Record<string, string>>({});

  // Which exercise's edit sheet is open
  const [editId, setEditId] = useState<string | null>(null);

  const editingEx = editId ? EXERCISES.find(e => e.id === editId) ?? null : null;
  const editSets  = editId ? (customSets[editId] ?? editingEx?.defaultSets ?? 3) : 3;
  const editReps  = editId ? (customReps[editId] ?? editingEx?.defaultReps ?? '10') : '10';

  const filtered = useMemo(
    () => filterExercises({ search, equipment, muscles }),
    [search, equipment, muscles],
  );

  const equipmentLabelText =
    equipment.length === 0 ? 'All Equipment' :
    equipment.length === 1 ? EQUIPMENT_OPTIONS.find(e => e.id === equipment[0])?.label ?? '1 selected' :
    `${equipment.length} selected`;

  const muscleLabelText =
    muscles.length === 0 ? 'All Muscles' :
    muscles.length === 1 ? MUSCLE_OPTIONS.find(m => m.id === muscles[0])?.label ?? '1 selected' :
    `${muscles.length} selected`;

  // ── Selection helpers ──────────────────────────────────────
  function toggleSelect(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  /** Tap the row body: select if not selected; open edit if already selected. */
  function handleRowPress(id: string) {
    if (selectedIds.includes(id)) {
      setEditId(id);
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  }

  // ── Edit sheet helpers ─────────────────────────────────────
  function handleChangeSets(v: number) {
    if (!editId) return;
    setCustomSets(prev => ({ ...prev, [editId]: v }));
  }

  function handleChangeReps(v: string) {
    if (!editId) return;
    setCustomReps(prev => ({ ...prev, [editId]: v }));
  }

  function handleReset() {
    if (!editId || !editingEx) return;
    setCustomSets(prev => { const n = { ...prev }; delete n[editId]; return n; });
    setCustomReps(prev => { const n = { ...prev }; delete n[editId]; return n; });
  }

  // ── Confirm ───────────────────────────────────────────────
  function handleConfirm() {
    if (selectedIds.length === 0) return;
    const picks = EXERCISES
      .filter(ex => selectedIds.includes(ex.id))
      .map(ex => {
        const base = toSessionExercise(ex);
        return {
          ...base,
          sets: customSets[ex.id] ?? base.sets,
          reps: customReps[ex.id] ?? base.reps,
        };
      });
    onConfirm(picks);
  }

  // ── Row renderer ──────────────────────────────────────────
  function renderExerciseRow({ item }: { item: Exercise }) {
    const isOn    = selectedIds.includes(item.id);
    const hasSets = customSets[item.id] ?? item.defaultSets;
    const hasReps = customReps[item.id] ?? item.defaultReps;
    const edited  = customSets[item.id] !== undefined || customReps[item.id] !== undefined;

    return (
      <View style={[row.container, isOn && row.containerActive]}>
        {/* Row body — selects or opens edit */}
        <TouchableOpacity
          style={row.body}
          activeOpacity={0.75}
          onPress={() => handleRowPress(item.id)}
        >
          <LinearGradient
            colors={isOn ? [C.gold, C.goldDeep] : ['#1E1C2A', '#141420']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={row.bubble}
          >
            <ExerciseIcon emoji={item.emoji} size={20} color={isOn ? '#0B0B0F' : '#FFB800'} />
          </LinearGradient>

          <View style={{ flex: 1, gap: 3 }}>
            <Text style={row.name} numberOfLines={1}>{item.name}</Text>
            <Text style={row.muscle} numberOfLines={1}>
              {muscleLabel(item.primaryMuscle)}
              {isOn ? (
                <Text style={row.setsLabel}>
                  {'  ·  '}{hasSets} × {hasReps}
                  {edited ? ' ✎' : ''}
                </Text>
              ) : null}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Toggle button — add / remove only */}
        <TouchableOpacity
          style={[row.addBtn, isOn && row.addBtnActive]}
          onPress={() => toggleSelect(item.id)}
          activeOpacity={0.7}
          hitSlop={6}
        >
          {isOn ? (
            <CheckIcon size={16} color="#0B0B0F" />
          ) : (
            <PlusIcon size={16} color={C.gold} />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={S.container} edges={['top', 'left', 'right']}>
      {/* ── Header ── */}
      <View style={S.header}>
        <TouchableOpacity onPress={onCancel} hitSlop={12} activeOpacity={0.7}>
          <Text style={S.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={S.headerTitle}>{title}</Text>

        <TouchableOpacity
          onPress={handleConfirm}
          activeOpacity={selectedIds.length > 0 ? 0.7 : 1}
          disabled={selectedIds.length === 0}
          hitSlop={12}
          style={[S.confirmBtn, selectedIds.length === 0 && S.confirmBtnDisabled]}
        >
          <Text style={[S.confirmText, selectedIds.length === 0 && S.confirmTextDisabled]}>
            {confirmLabel}{selectedIds.length > 0 ? ` ${selectedIds.length}` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Search bar ── */}
      <View style={S.searchWrap}>
        <SearchIcon size={18} color={C.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search exercise"
          placeholderTextColor={C.dimmed}
          style={S.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={8} activeOpacity={0.7}>
            <Text style={S.clearInline}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filter pills ── */}
      <View style={S.filterRow}>
        <TouchableOpacity
          style={[S.filterPill, equipment.length > 0 && S.filterPillActive]}
          activeOpacity={0.8}
          onPress={() => setEquipSheet(true)}
        >
          <Text style={[S.filterPillText, equipment.length > 0 && S.filterPillTextActive]}>
            {equipmentLabelText}
          </Text>
          <ChevronIcon size={12} color={equipment.length > 0 ? C.gold : C.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[S.filterPill, muscles.length > 0 && S.filterPillActive]}
          activeOpacity={0.8}
          onPress={() => setMuscleSheet(true)}
        >
          <Text style={[S.filterPillText, muscles.length > 0 && S.filterPillTextActive]}>
            {muscleLabelText}
          </Text>
          <ChevronIcon size={12} color={muscles.length > 0 ? C.gold : C.muted} />
        </TouchableOpacity>
      </View>

      {/* ── Section heading ── */}
      <View style={S.sectionRow}>
        <Text style={S.sectionTitle}>
          {search.trim().length > 0 ? 'Search Results' : 'Popular Exercises'}
        </Text>
        <Text style={S.sectionCount}>{filtered.length}</Text>
      </View>

      {/* ── Hint when exercises are selected ── */}
      {selectedIds.length > 0 && (
        <Text style={S.editHint}>Tap a selected exercise to adjust its sets & reps.</Text>
      )}

      {/* ── Exercise list ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.listContent}
        ItemSeparatorComponent={() => <View style={S.separator} />}
        ListEmptyComponent={() => (
          <View style={S.empty}>
            <Text style={S.emptyTitle}>No exercises match</Text>
            <Text style={S.emptySubtitle}>
              Try clearing your filters or adjusting the search.
            </Text>
          </View>
        )}
        keyboardShouldPersistTaps="handled"
      />

      {/* ── Filter sheets ── */}
      <FilterSheet
        visible={equipSheet}
        title="Equipment"
        options={EQUIPMENT_OPTIONS}
        selected={equipment}
        onToggle={(id) =>
          setEquipment(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
        }
        onClear={() => setEquipment([])}
        onDone={() => setEquipSheet(false)}
      />

      <FilterSheet
        visible={muscleSheet}
        title="Muscle Group"
        options={MUSCLE_OPTIONS}
        selected={muscles}
        onToggle={(id) =>
          setMuscles(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
        }
        onClear={() => setMuscles([])}
        onDone={() => setMuscleSheet(false)}
      />

      {/* ── Edit sets/reps sheet ── */}
      <EditSheet
        visible={editId !== null}
        exercise={editingEx}
        sets={editSets}
        reps={editReps}
        onChangeSets={handleChangeSets}
        onChangeReps={handleChangeReps}
        onReset={handleReset}
        onDone={() => setEditId(null)}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: C.gold },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.white, letterSpacing: -0.2 },
  confirmBtn: {
    backgroundColor: C.gold,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    minWidth: 64,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: C.surfaceRaised,
    borderWidth: 1,
    borderColor: C.border,
  },
  confirmText: { fontSize: 14, fontWeight: '800', color: '#0B0B0F', letterSpacing: 0.2 },
  confirmTextDisabled: { color: C.dimmed },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: C.white, paddingVertical: 0 },
  clearInline: { fontSize: 22, fontWeight: '300', color: C.muted, paddingHorizontal: 4 },

  filterRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 12 },
  filterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterPillActive: { backgroundColor: C.goldDim, borderColor: C.goldDimMid },
  filterPillText: { fontSize: 13, fontWeight: '700', color: C.muted, letterSpacing: 0.1 },
  filterPillTextActive: { color: C.gold },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: C.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  sectionCount: { fontSize: 11, fontWeight: '700', color: C.dimmed, letterSpacing: 0.5 },

  editHint: {
    fontSize: 11,
    fontWeight: '500',
    color: C.gold,
    textAlign: 'center',
    paddingBottom: 6,
    opacity: 0.8,
  },

  listContent: { paddingBottom: 24 },
  separator: { height: 1, backgroundColor: C.border, marginHorizontal: 20 },
  empty: { paddingHorizontal: 40, paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: C.white },
  emptySubtitle: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 19 },
});

const row = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  containerActive: { backgroundColor: 'rgba(255,184,0,0.04)' },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  emoji: { fontSize: 22 },
  name: { fontSize: 15, fontWeight: '700', color: C.white, letterSpacing: -0.1 },
  muscle: { fontSize: 12, fontWeight: '500', color: C.muted },
  setsLabel: { fontSize: 12, fontWeight: '700', color: C.gold },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
    marginLeft: 10,
  },
  addBtnActive: { backgroundColor: C.gold, borderColor: C.gold },
});

const sheet = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  container: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 28,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, marginBottom: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: { fontSize: 15, fontWeight: '800', color: C.white, letterSpacing: -0.2 },
  clearText: { fontSize: 14, fontWeight: '600', color: C.muted, minWidth: 50 },
  doneText: { fontSize: 14, fontWeight: '800', color: C.gold, minWidth: 50, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  rowActive: { backgroundColor: 'rgba(255,184,0,0.06)' },
  iconBubble: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBubbleActive: { backgroundColor: C.goldDim, borderColor: C.goldDimMid },
  iconBubbleText: { fontSize: 13, fontWeight: '800', color: C.muted },
  iconBubbleTextActive: { color: C.gold },
  rowText: { flex: 1, fontSize: 15, fontWeight: '600', color: C.white },
  rowTextActive: { color: C.gold, fontWeight: '700' },
  checkPill: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
});

const edt = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#111116',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#333344', alignSelf: 'center', marginBottom: 20 },
  exHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  exCircle: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  exEmoji: { fontSize: 22 },
  exName: { fontSize: 17, fontWeight: '800', color: C.white, letterSpacing: -0.2, marginBottom: 3 },
  exMuscle: { fontSize: 12, fontWeight: '500', color: C.dimmed, textTransform: 'capitalize' },
  divider: { height: 1, backgroundColor: C.border, marginBottom: 20 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fieldLabel: { fontSize: 15, fontWeight: '700', color: C.muted },
  stepper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfaceRaised, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  stepBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  stepBtnDisabled: { opacity: 0.3 },
  stepTxt: { fontSize: 22, fontWeight: '300', color: C.gold },
  stepVal: { width: 44, textAlign: 'center', fontSize: 18, fontWeight: '800', color: C.white },
  repsInput: {
    backgroundColor: C.surfaceRaised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
    minWidth: 110,
    textAlign: 'center',
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  resetBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 16,
    alignItems: 'center', backgroundColor: C.surfaceRaised,
    borderWidth: 1, borderColor: C.border,
  },
  resetText: { fontSize: 15, fontWeight: '700', color: C.muted },
  doneBtn: { flex: 2, borderRadius: 16, overflow: 'hidden' },
  doneBtnGrad: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  doneText: { fontSize: 15, fontWeight: '800', color: '#0B0B0F', letterSpacing: 0.3 },
});
