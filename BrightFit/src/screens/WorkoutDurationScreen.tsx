import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants';

const TOTAL_STEPS = 9;
const CURRENT_STEP = 6;

const OPTIONS = [
  { id: '30min', label: '30 Mins' },
  { id: '45min', label: '45 Mins', ideal: true },
  { id: '1hr', label: '1 Hour' },
  { id: '1hr30min', label: '1 Hour 30 Mins' },
];

interface WorkoutDurationScreenProps {
  onContinue?: (duration: string) => void;
  onBack?: () => void;
}

export default function WorkoutDurationScreen({ onContinue, onBack }: WorkoutDurationScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const pairs: (typeof OPTIONS[number] | null)[][] = [];
  for (let i = 0; i < OPTIONS.length; i += 2) {
    pairs.push([OPTIONS[i], OPTIONS[i + 1] ?? null]);
  }

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
        <Text style={styles.title}>What's your workout duration?</Text>
      </View>

      {/* Options grid */}
      <View style={styles.optionGrid}>
        {pairs.map((pair, rowIndex) => (
          <View key={rowIndex} style={styles.optionRow}>
            {pair.map((option, colIndex) =>
              option ? (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    selected === option.id && styles.optionCardSelected,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setSelected(option.id)}
                >
                  {option.ideal && (
                    <LinearGradient
                      colors={['#F97316', '#FBBF24']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.idealBadge}
                    >
                      <Text style={styles.idealText}>IDEAL</Text>
                    </LinearGradient>
                  )}
                  <Text
                    style={[
                      styles.optionLabel,
                      selected === option.id && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View key={`empty-${colIndex}`} style={styles.optionCardEmpty} />
              )
            )}
          </View>
        ))}
      </View>

      {/* Continue button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selected && styles.continueButtonDisabled]}
          activeOpacity={selected ? 0.85 : 1}
          disabled={!selected}
          onPress={() => selected && onContinue?.(selected)}
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
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.matteBlack,
    letterSpacing: -0.3,
    lineHeight: 34,
  },

  optionGrid: {
    flex: 1,
    gap: 14,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 14,
  },
  optionCard: {
    flex: 1,
    paddingVertical: 22,
    paddingHorizontal: 16,
    backgroundColor: colors.softWhite,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderGray,
    justifyContent: 'center',
  },
  optionCardSelected: {
    backgroundColor: '#FFF8E1',
    borderColor: colors.primaryGold,
  },
  optionCardEmpty: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.matteBlack,
    marginTop: 6,
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: colors.matteBlack,
  },

  idealBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 50,
  },
  idealText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },

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
