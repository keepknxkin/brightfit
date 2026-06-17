import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants';

const TOTAL_STEPS = 9;
const CURRENT_STEP = 7;

const OPTIONS = [
  {
    id: 'Dumbbells',
    label: 'Dumbbells',
    description: 'Free weights for curls, presses, and more',
  },
  {
    id: 'Barbell',
    label: 'Barbell',
    description: 'Olympic bar for squats, deadlifts, and bench',
  },
  {
    id: 'Flat Bench',
    label: 'Bench',
    description: 'Flat or adjustable weight bench',
  },
  {
    id: 'Pull-up Bar',
    label: 'Pull-up Bar',
    description: 'Pull-ups, chin-ups, and hanging leg raises',
  },
  {
    id: 'Cable Machine',
    label: 'Cable Machine',
    description: 'Full cable stack for rows, flies, and pulldowns',
  },
  {
    id: 'Kettlebell',
    label: 'Kettlebell',
    description: 'Swings, cleans, and carries',
  },
  {
    id: 'Resistance Band',
    label: 'Resistance Bands',
    description: 'Portable bands for home or travel workouts',
  },
  {
    id: 'Leg Press Machine',
    label: 'Leg Press Machine',
    description: 'Seated machine for quad and glute work',
  },
  {
    id: 'Smith Machine',
    label: 'Smith Machine',
    description: 'Guided bar for squats, presses, and rows',
  },
  {
    id: 'Lat Pulldown Machine',
    label: 'Lat Pulldown Machine',
    description: 'Cable-based machine for back and lats',
  },
  {
    id: 'Seated Row Machine',
    label: 'Seated Row Machine',
    description: 'Cable row for mid and upper back',
  },
  {
    id: 'Leg Curl Machine',
    label: 'Leg Curl Machine',
    description: 'Lying or seated machine for hamstrings',
  },
  {
    id: 'Leg Extension Machine',
    label: 'Leg Extension Machine',
    description: 'Seated machine to isolate the quads',
  },
  {
    id: 'Pec Deck Machine',
    label: 'Pec Deck / Chest Fly Machine',
    description: 'Isolated chest fly movement',
  },
  {
    id: 'Hip Thrust Machine',
    label: 'Hip Thrust Machine',
    description: 'Glute-focused machine or bench setup',
  },
  {
    id: 'Hack Squat Machine',
    label: 'Hack Squat Machine',
    description: 'Angled squat platform for quads and glutes',
  },
  {
    id: 'TRX / Suspension Trainer',
    label: 'TRX / Suspension Trainer',
    description: 'Straps for bodyweight rows, push-ups, and more',
  },
  {
    id: 'Plyometric Box',
    label: 'Plyo Box',
    description: 'Box jumps, step-ups, and depth drops',
  },
];

interface EquipmentScreenProps {
  initialSelected?: string[];
  onContinue?: (equipment: string[]) => void;
  onBack?: () => void;
}

export default function EquipmentScreen({
  initialSelected = [],
  onContinue,
  onBack,
}: EquipmentScreenProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);

  function toggle(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id],
    );
  }

  const canContinue = true; // allow continuing with no equipment (bodyweight)

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar: back + progress */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onBack}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(CURRENT_STEP / TOTAL_STEPS) * 100}%` }]} />
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>What equipment do you have access to?</Text>
        <Text style={styles.subtitle}>Select all that apply. We'll tailor your workouts accordingly.</Text>
      </View>

      {/* Options */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.optionList}
        showsVerticalScrollIndicator={false}
      >
        {OPTIONS.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              activeOpacity={0.75}
              onPress={() => toggle(option.id)}
            >
              <View style={styles.optionContent}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>
                    {option.description}
                  </Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 8 }} />
      </ScrollView>

      {/* Continue button */}
      <View style={styles.footer}>
        {selected.length === 0 && (
          <Text style={styles.noneHint}>No selection = bodyweight exercises only</Text>
        )}
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={() => onContinue?.(selected)}
        >
          <Text style={styles.continueText}>
            {selected.length === 0 ? 'Continue (Bodyweight)' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardWhite,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 32,
    color: colors.matteBlack,
    lineHeight: 36,
    marginTop: -4,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.borderGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primaryGold,
    borderRadius: 3,
  },

  header: {
    marginBottom: 24,
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.matteBlack,
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: colors.charcoalGray,
  },

  scrollArea: {
    flex: 1,
  },
  optionList: {
    gap: 12,
  },
  optionCard: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.softWhite,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderGray,
  },
  optionCardSelected: {
    backgroundColor: '#FFF8E1',
    borderColor: colors.primaryGold,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.matteBlack,
    marginBottom: 2,
  },
  optionLabelSelected: {
    fontWeight: '700',
  },
  optionDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.charcoalGray,
  },
  optionDescriptionSelected: {
    color: colors.matteBlack,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.borderGray,
    backgroundColor: colors.cardWhite,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxSelected: {
    backgroundColor: colors.primaryGold,
    borderColor: colors.primaryGold,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.matteBlack,
  },

  footer: {
    width: '100%',
    gap: 10,
    marginTop: 16,
  },
  noneHint: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.charcoalGray,
  },
  continueButton: {
    width: '100%',
    backgroundColor: colors.primaryGold,
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: colors.deepGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.matteBlack,
    letterSpacing: 0.2,
  },
});
