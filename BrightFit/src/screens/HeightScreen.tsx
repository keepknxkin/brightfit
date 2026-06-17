import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TOTAL_STEPS = 9;
const CURRENT_STEP = 4;

const TICK_WIDTH = 10;
const MIN_INCHES = 48;
const MAX_INCHES = 96;
const DEFAULT_INCHES = 73;

const MIN_CM = 120;
const MAX_CM = 230;
const DEFAULT_CM = 185;

const RULER_PADDING = SCREEN_WIDTH / 2 - TICK_WIDTH / 2;

type UnitSystem = 'imperial' | 'metric';

function inchesToFeetInches(totalInches: number) {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches };
}

function inchesToCm(inches: number) {
  return Math.round(inches * 2.54);
}

function cmToInches(cm: number) {
  return Math.round(cm / 2.54);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

interface HeightScreenProps {
  onContinue?: (heightCm: number) => void;
  onBack?: () => void;
}

export default function HeightScreen({ onContinue, onBack }: HeightScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [unit, setUnit] = useState<UnitSystem>('imperial');
  const [selectedInches, setSelectedInches] = useState(DEFAULT_INCHES);
  const [selectedCm, setSelectedCm] = useState(DEFAULT_CM);
  const didInitialScroll = useRef(false);

  const minValue = unit === 'imperial' ? MIN_INCHES : MIN_CM;
  const maxValue = unit === 'imperial' ? MAX_INCHES : MAX_CM;
  const tickCount = maxValue - minValue + 1;
  const rulerWidth = tickCount * TICK_WIDTH;

  useEffect(() => {
    if (didInitialScroll.current) return;
    didInitialScroll.current = true;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: (DEFAULT_INCHES - MIN_INCHES) * TICK_WIDTH,
        animated: false,
      });
    });
  }, []);

  const syncFromOffset = useCallback((offsetX: number, currentUnit: UnitSystem) => {
    const index = Math.round(offsetX / TICK_WIDTH);
    const min = currentUnit === 'imperial' ? MIN_INCHES : MIN_CM;
    const max = currentUnit === 'imperial' ? MAX_INCHES : MAX_CM;
    const value = clamp(min + index, min, max);
    if (currentUnit === 'imperial') {
      setSelectedInches(value);
    } else {
      setSelectedCm(value);
    }
  }, []);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncFromOffset(e.nativeEvent.contentOffset.x, unit);
  }, [syncFromOffset, unit]);

  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncFromOffset(e.nativeEvent.contentOffset.x, unit);
  }, [syncFromOffset, unit]);

  const switchUnit = useCallback((next: UnitSystem) => {
    if (next === unit) return;
    const nextValue = next === 'imperial'
      ? clamp(cmToInches(selectedCm), MIN_INCHES, MAX_INCHES)
      : clamp(inchesToCm(selectedInches), MIN_CM, MAX_CM);

    if (next === 'imperial') {
      setSelectedInches(nextValue);
    } else {
      setSelectedCm(nextValue);
    }
    setUnit(next);

    requestAnimationFrame(() => {
      const offset = (nextValue - (next === 'imperial' ? MIN_INCHES : MIN_CM)) * TICK_WIDTH;
      scrollRef.current?.scrollTo({ x: offset, animated: false });
    });
  }, [selectedCm, selectedInches, unit]);

  const { feet, inches } = inchesToFeetInches(selectedInches);

  const rulerLabels = unit === 'imperial'
    ? [66, 72, 78].map((inch) => {
        const ft = Math.floor(inch / 12);
        const rem = inch % 12;
        return { offset: inch - MIN_INCHES, label: `${ft}' ${rem}"` };
      })
    : [150, 170, 190].map((cm) => ({
        offset: cm - MIN_CM,
        label: `${cm}`,
      }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onBack}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(CURRENT_STEP / TOTAL_STEPS) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>What is your height?</Text>
        <Text style={styles.subtitle}>Personalizing your BrightFit plan...</Text>
      </View>

      <View style={styles.unitToggle}>
        <TouchableOpacity
          style={[styles.unitOption, unit === 'imperial' && styles.unitOptionActive]}
          activeOpacity={0.8}
          onPress={() => switchUnit('imperial')}
        >
          <Text style={[styles.unitText, unit === 'imperial' && styles.unitTextActive]}>FT/IN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.unitOption, unit === 'metric' && styles.unitOptionActive]}
          activeOpacity={0.8}
          onPress={() => switchUnit('metric')}
        >
          <Text style={[styles.unitText, unit === 'metric' && styles.unitTextActive]}>CM</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.displayWrap}>
        {unit === 'imperial' ? (
          <View style={styles.imperialDisplay}>
            <Text style={styles.displayNumber}>{feet}</Text>
            <Text style={styles.displayUnit}>ft</Text>
            <Text style={[styles.displayNumber, styles.displayGap]}>{inches}</Text>
            <Text style={styles.displayUnit}>in</Text>
          </View>
        ) : (
          <View style={styles.imperialDisplay}>
            <Text style={styles.displayNumber}>{selectedCm}</Text>
            <Text style={styles.displayUnit}>cm</Text>
          </View>
        )}
      </View>

      <View style={styles.rulerWrap}>
        <View style={styles.centerIndicator} pointerEvents="none" />

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={TICK_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: RULER_PADDING }}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          scrollEventThrottle={16}
        >
          <View style={{ width: rulerWidth }}>
            <View style={styles.rulerRow}>
              {Array.from({ length: tickCount }, (_, i) => {
                const value = minValue + i;
                const isMajor = unit === 'imperial' ? value % 12 === 0 : value % 10 === 0;
                const isMid = unit === 'imperial' ? value % 6 === 0 : value % 5 === 0;
                const tickHeight = isMajor ? 44 : isMid ? 32 : 20;

                return (
                  <View key={value} style={[styles.tickSlot, { width: TICK_WIDTH }]}>
                    <View style={[styles.tick, { height: tickHeight }]} />
                  </View>
                );
              })}
            </View>

            <View style={[styles.labelRow, { width: rulerWidth }]}>
              {rulerLabels.map(({ offset, label }) => (
                <Text
                  key={label}
                  style={[styles.rulerLabel, { left: offset * TICK_WIDTH - 16 }]}
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <Text style={styles.claim}>
        We use your height to tailor workouts, form cues, and progress tracking to your body.
      </Text>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={() => {
            const heightCm = unit === 'imperial' ? inchesToCm(selectedInches) : selectedCm;
            onContinue?.(heightCm);
          }}
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
    marginBottom: 24,
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
  unitToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.primaryGold,
    padding: 3,
    marginBottom: 28,
  },
  unitOption: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  unitOptionActive: {
    backgroundColor: colors.primaryGold,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.charcoalGray,
  },
  unitTextActive: {
    color: colors.matteBlack,
    fontWeight: '700',
  },
  displayWrap: {
    alignItems: 'center',
    marginBottom: 36,
  },
  imperialDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  displayNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.matteBlack,
    lineHeight: 60,
  },
  displayGap: {
    marginLeft: 12,
  },
  displayUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoalGray,
    marginBottom: 10,
    marginLeft: 4,
    marginRight: 4,
  },
  rulerWrap: {
    height: 110,
    marginBottom: 28,
    justifyContent: 'center',
  },
  centerIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    width: 3,
    height: 52,
    backgroundColor: colors.primaryGold,
    borderRadius: 2,
    zIndex: 2,
  },
  rulerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 52,
  },
  tickSlot: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 52,
  },
  tick: {
    width: 1.5,
    backgroundColor: '#C8C8C8',
    borderRadius: 1,
  },
  labelRow: {
    position: 'relative',
    height: 24,
    marginTop: 8,
  },
  rulerLabel: {
    position: 'absolute',
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: colors.charcoalGray,
  },
  claim: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: colors.charcoalGray,
    paddingHorizontal: 8,
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
  continueText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.matteBlack,
    letterSpacing: 0.2,
  },
});
