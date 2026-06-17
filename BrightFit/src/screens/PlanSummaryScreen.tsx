import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants';

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const FOCUS_LABELS: Record<string, string> = {
  muscle_gain: 'Muscle Gain',
  strength_training: 'Strength Training',
  fat_loss: 'Fat Loss',
  stay_fit: 'Stay Fit',
  athletic_performance: 'Athletic Performance',
};

const DAYS_LABELS: Record<string, string> = {
  '1': '1 Day',
  '2': '2 Days',
  '3': '3 Days',
  '4': '4 Days',
  '5': '5 Days',
  '6': '6 Days',
  '7': 'Everyday',
};

const DURATION_LABELS: Record<string, string> = {
  '30min': '30 Mins',
  '45min': '45 Mins',
  '1hr': '1 Hour',
  '1hr30min': '1 Hour 30 Mins',
};

interface PlanSummaryScreenProps {
  fitnessLevel: string;
  workoutsPerWeek: string;
  workoutDuration: string;
  fitnessFocus: string;
  equipment?: string[];
  onDone?: () => void;
  onClose?: () => void;
  onEditFitnessLevel?: () => void;
  onEditFocus?: () => void;
  onEditDays?: () => void;
  onEditDuration?: () => void;
  onEditEquipment?: () => void;
}

function equipmentLabel(equipment: string[]): string {
  if (equipment.length === 0) return 'Bodyweight';
  if (equipment.length <= 2) return equipment.join(', ');
  return `${equipment[0]}, ${equipment[1]} +${equipment.length - 2}`;
}

export default function PlanSummaryScreen({
  fitnessLevel,
  workoutsPerWeek,
  workoutDuration,
  fitnessFocus,
  equipment = [],
  onDone,
  onClose,
  onEditFitnessLevel,
  onEditFocus,
  onEditDays,
  onEditDuration,
  onEditEquipment,
}: PlanSummaryScreenProps) {
  const gridStats = [
    {
      label: 'Fitness Level',
      value: LEVEL_LABELS[fitnessLevel] ?? fitnessLevel,
      onEdit: onEditFitnessLevel,
    },
    {
      label: 'Goal',
      value: FOCUS_LABELS[fitnessFocus] ?? fitnessFocus,
      onEdit: onEditFocus,
    },
    {
      label: 'Days Per Week',
      value: DAYS_LABELS[workoutsPerWeek] ?? workoutsPerWeek,
      onEdit: onEditDays,
    },
    {
      label: 'Session Duration',
      value: DURATION_LABELS[workoutDuration] ?? workoutDuration,
      onEdit: onEditDuration,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Close button */}
      {onClose && (
        <TouchableOpacity style={styles.closeBtn} activeOpacity={0.7} onPress={onClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR PLAN</Text>
        <Text style={styles.title}>Built{'\n'}For You.</Text>
        <Text style={styles.subtitle}>
          Tap any card to edit your selections.
        </Text>
      </View>

      {/* Summary grid */}
      <View style={styles.grid}>
        {/* Row 1 & 2 — 2×2 */}
        <View style={styles.gridRow}>
          {gridStats.slice(0, 2).map((stat) => (
            <TouchableOpacity
              key={stat.label}
              style={styles.card}
              activeOpacity={0.7}
              onPress={stat.onEdit}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardLabel}>{stat.label}</Text>
                <Text style={styles.editIcon}>✎</Text>
              </View>
              <Text style={styles.cardValue}>{stat.value}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.gridRow}>
          {gridStats.slice(2, 4).map((stat) => (
            <TouchableOpacity
              key={stat.label}
              style={styles.card}
              activeOpacity={0.7}
              onPress={stat.onEdit}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardLabel}>{stat.label}</Text>
                <Text style={styles.editIcon}>✎</Text>
              </View>
              <Text style={styles.cardValue}>{stat.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Row 3 — Equipment full width */}
        <TouchableOpacity
          style={[styles.card, styles.cardWide]}
          activeOpacity={0.7}
          onPress={onEditEquipment}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardLabel}>Equipment</Text>
            <Text style={styles.editIcon}>✎</Text>
          </View>
          <Text style={styles.cardValue}>{equipmentLabel(equipment)}</Text>
        </TouchableOpacity>
      </View>

      {/* Done button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={onDone}>
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 36,
  },

  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '300',
  },

  header: {
    marginTop: 20,
    marginBottom: 40,
    gap: 10,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.primaryGold,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontWeight: '400',
  },

  grid: {
    flex: 1,
    gap: 14,
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 14,
  },
  card: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingVertical: 24,
    paddingHorizontal: 18,
    gap: 8,
    justifyContent: 'flex-end',
  },
  cardWide: {
    flex: 0,
    width: '100%',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: colors.primaryGold,
    textTransform: 'uppercase',
    flex: 1,
  },
  editIcon: {
    fontSize: 14,
    color: '#444444',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 24,
  },

  footer: {
    width: '100%',
    marginTop: 24,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryGold,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryGold,
    letterSpacing: 0.3,
  },
});
