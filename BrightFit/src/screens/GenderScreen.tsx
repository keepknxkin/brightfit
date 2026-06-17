import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants';

const { width } = Dimensions.get('window');

const TOTAL_STEPS = 9;
const CURRENT_STEP = 1;

const GENDER_OPTIONS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
];

interface GenderScreenProps {
  onContinue?: () => void;
  onBack?: () => void;
}

export default function GenderScreen({ onContinue, onBack }: GenderScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);

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
        <Text style={styles.title}>Select your gender</Text>
        <Text style={styles.subtitle}>Personalizing your BrightFit plan...</Text>
      </View>

      {/* Options */}
      <View style={styles.optionList}>
        {GENDER_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              activeOpacity={0.75}
              onPress={() => setSelected(option.id)}
            >
              <Text
                style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Continue button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selected && styles.continueButtonDisabled]}
          activeOpacity={selected ? 0.85 : 1}
          disabled={!selected}
          onPress={onContinue}
        >
          <Text style={styles.continueText}>Continue</Text>
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

  // ── Top bar ───────────────────────────────────────────
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

  // ── Header ────────────────────────────────────────────
  header: {
    marginBottom: 28,
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.matteBlack,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.charcoalGray,
    fontWeight: '400',
  },

  // ── Options ───────────────────────────────────────────
  optionList: {
    flex: 1,
    gap: 14,
  },
  optionCard: {
    width: '100%',
    paddingVertical: 20,
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
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.matteBlack,
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: colors.matteBlack,
  },

  // ── Footer ────────────────────────────────────────────
  footer: {
    width: '100%',
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
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.matteBlack,
    letterSpacing: 0.2,
  },
});
