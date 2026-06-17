import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ExerciseIcon from './ExerciseIcon';

const C = {
  bg:            '#111116',
  surface:       '#1C1C24',
  border:        '#252530',
  gold:          '#FFB800',
  goldDeep:      '#D89200',
  white:         '#FFFFFF',
  muted:         '#9999AA',
  dimmed:        '#555568',
};

export interface EditableExercise {
  name: string;
  emoji: string;
  muscles: string[];
  sets: number;
  reps: string;
  suggestedWeight?: number;
}

interface Props {
  visible: boolean;
  exercise: EditableExercise | null;
  onChangeSets: (v: number) => void;
  onChangeReps: (v: string) => void;
  /** Restore the exercise to its original defaults. */
  onReset: () => void;
  onDone: () => void;
}

export default function EditExerciseModal({
  visible,
  exercise,
  onChangeSets,
  onChangeReps,
  onReset,
  onDone,
}: Props) {
  if (!exercise) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={S.overlay}>
          <View style={S.sheet}>
            <View style={S.handle} />

            {/* Exercise identity */}
            <View style={S.exHeader}>
              <LinearGradient
                colors={['#1E1C2A', '#141420']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={S.exCircle}
              >
                <ExerciseIcon emoji={exercise.emoji} size={24} color="#FFB800" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={S.exName}>{exercise.name}</Text>
                <Text style={S.exMuscles} numberOfLines={1}>
                  {exercise.muscles.join(' · ')}
                </Text>
              </View>
            </View>

            <View style={S.divider} />

            {/* Sets stepper */}
            <View style={S.fieldRow}>
              <Text style={S.fieldLabel}>Sets</Text>
              <View style={S.stepper}>
                <TouchableOpacity
                  style={[S.stepBtn, exercise.sets <= 1 && S.stepBtnDisabled]}
                  activeOpacity={0.7}
                  onPress={() => onChangeSets(Math.max(1, exercise.sets - 1))}
                >
                  <Text style={S.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={S.stepValue}>{exercise.sets}</Text>
                <TouchableOpacity
                  style={[S.stepBtn, exercise.sets >= 10 && S.stepBtnDisabled]}
                  activeOpacity={0.7}
                  onPress={() => onChangeSets(Math.min(10, exercise.sets + 1))}
                >
                  <Text style={S.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reps input */}
            <View style={S.fieldRow}>
              <Text style={S.fieldLabel}>Reps / Duration</Text>
              <TextInput
                style={S.repsInput}
                value={exercise.reps}
                onChangeText={onChangeReps}
                placeholder="e.g. 10 or 30s"
                placeholderTextColor={C.dimmed}
                keyboardType="default"
                returnKeyType="done"
                onSubmitEditing={onDone}
                selectTextOnFocus
              />
            </View>

            <View style={S.divider} />

            {/* Actions */}
            <View style={S.actions}>
              <TouchableOpacity style={S.resetBtn} activeOpacity={0.7} onPress={onReset}>
                <Text style={S.resetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.doneBtn} activeOpacity={0.8} onPress={onDone}>
                <LinearGradient
                  colors={[C.gold, C.goldDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={S.doneBtnGrad}
                >
                  <Text style={S.doneText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const S = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: C.border,
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
    borderColor: C.border,
  },
  exEmoji: { fontSize: 22 },
  exName: {
    fontSize: 17,
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  exMuscles: {
    fontSize: 12,
    fontWeight: '500',
    color: C.dimmed,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
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
    fontWeight: '700',
    color: C.muted,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.3,
  },
  stepBtnText: {
    fontSize: 22,
    fontWeight: '300',
    color: C.gold,
  },
  stepValue: {
    width: 44,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: C.white,
  },
  repsInput: {
    backgroundColor: C.surface,
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
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.muted,
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
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 0.3,
  },
});
