import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/constants';

const STEPS = [
  'Scheduling your weekly workouts',
  'Setting your program start date',
  'Calculating your starting weights',
  'Finalizing your strength program',
];

// Step i completes at these timestamps (ms) — evenly spaced over 5s
const TOTAL_MS = 5000;
const COMPLETE_AT = STEPS.map((_, i) => Math.round(TOTAL_MS * ((i + 1) / STEPS.length)));

const RING_SIZE = 150;
const STROKE = 12;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type StepState = 'pending' | 'loading' | 'done';

interface Props {
  onBack?: () => void;
  onContinue?: () => void;
  isContinuing?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CreatingPlanScreen({ onBack, onContinue, isContinuing = false }: Props) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [stepStates, setStepStates] = useState<StepState[]>(['loading', 'pending', 'pending', 'pending']);
  const [done, setDone] = useState(false);
  const [displayPct, setDisplayPct] = useState(0);

  // Drive overall progress 0→1 over TOTAL_MS
  useEffect(() => {
    const id = progressAnim.addListener(({ value }) => {
      setDisplayPct(Math.round(value * 100));
    });
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: TOTAL_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => setDone(true));
    return () => progressAnim.removeListener(id);
  }, []);

  // Spin animation for the currently-loading step
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Mark steps complete at their scheduled times
  useEffect(() => {
    const timers = COMPLETE_AT.map((ms, i) =>
      setTimeout(() => {
        setStepStates(prev => {
          const next = [...prev] as StepState[];
          next[i] = 'done';
          if (i + 1 < STEPS.length) next[i + 1] = 'loading';
          return next;
        });
      }, ms),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const spinRotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Back */}
      <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onBack}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Creating a Fitness Experience{'\n'}Built for You</Text>
        <Text style={styles.subtitle}>
          Your custom fitness journey is being prepared for the best results possible.
        </Text>
      </View>

      {/* Circular progress ring */}
      <View style={styles.ringWrapper}>
        <Svg
          width={RING_SIZE}
          height={RING_SIZE}
          style={styles.svgRotate}
        >
          {/* Track */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={colors.borderGray}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Progress arc */}
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={colors.primaryGold}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>

        {/* Percentage label overlay */}
        <View style={styles.ringCenter} pointerEvents="none">
          <Text style={styles.percentText}>{displayPct}%</Text>
        </View>
      </View>

      {/* Step list */}
      <View style={styles.stepList}>
        {STEPS.map((label, i) => {
          const state = stepStates[i];
          return (
            <View key={i} style={styles.stepRow}>
              <StepIcon state={state} spinRotate={spinRotate} />
              <Text style={[styles.stepLabel, state === 'pending' && styles.stepLabelPending]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Continue */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, (!done || isContinuing) && styles.continueButtonDisabled]}
          activeOpacity={done && !isContinuing ? 0.85 : 1}
          disabled={!done || isContinuing}
          onPress={onContinue}
        >
          {isContinuing ? (
            <ActivityIndicator color={colors.matteBlack} />
          ) : (
            <Text style={styles.continueText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StepIcon({ state, spinRotate }: { state: StepState; spinRotate: Animated.AnimatedInterpolation<string> }) {
  if (state === 'done') {
    return (
      <View style={styles.iconDone}>
        <Text style={styles.iconCheck}>✓</Text>
      </View>
    );
  }
  if (state === 'loading') {
    return (
      <Animated.View style={[styles.iconLoading, { transform: [{ rotate: spinRotate }] }]}>
        <View style={styles.spinnerInner} />
      </Animated.View>
    );
  }
  // pending
  return <View style={styles.iconPending} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardWhite,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 32,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 32,
    color: colors.matteBlack,
    lineHeight: 36,
    marginTop: -4,
  },

  header: {
    alignItems: 'center',
    marginBottom: 36,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.matteBlack,
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: colors.charcoalGray,
    textAlign: 'center',
    lineHeight: 20,
  },

  ringWrapper: {
    alignSelf: 'center',
    width: RING_SIZE,
    height: RING_SIZE,
    marginBottom: 40,
  },
  svgRotate: {
    transform: [{ rotate: '-90deg' }],
  },
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.matteBlack,
    letterSpacing: -0.5,
  },

  stepList: {
    flex: 1,
    gap: 18,
    paddingHorizontal: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.matteBlack,
  },
  stepLabelPending: {
    color: colors.charcoalGray,
  },

  // Icons
  iconDone: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCheck: {
    fontSize: 13,
    color: colors.matteBlack,
    fontWeight: '700',
    lineHeight: 16,
  },
  iconLoading: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: colors.borderGray,
    borderTopColor: colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerInner: {
    // inner fill for visual centering — transparent
  },
  iconPending: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.borderGray,
    backgroundColor: 'transparent',
  },

  footer: {
    width: '100%',
    marginTop: 16,
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
    opacity: 0.4,
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
