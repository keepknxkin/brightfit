import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Path,
  Rect,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
  Line,
} from 'react-native-svg';
import { colors } from '@/constants';

const { width } = Dimensions.get('window');
const ILLU_SIZE = Math.min(width * 0.72, 280);

interface Props {
  onContinue?: () => void;
  onBack?: () => void;
}

function AIPlansIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.88} viewBox="0 0 200 176">
      <Defs>
        <LinearGradient id="aiGlow" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFB800" stopOpacity="0.24" />
          <Stop offset="1" stopColor="#FFB800" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="aiRing" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFD84D" />
          <Stop offset="0.5" stopColor="#FFB800" />
          <Stop offset="1" stopColor="#D89200" />
        </LinearGradient>
        <LinearGradient id="aiCard" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1E1E28" />
          <Stop offset="1" stopColor="#0B0B0F" />
        </LinearGradient>
        <LinearGradient id="aiSpark" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#FFB800" />
        </LinearGradient>
        <LinearGradient id="aiLine" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#4CAF7D" />
          <Stop offset="1" stopColor="#FFB800" />
        </LinearGradient>
      </Defs>

      <Circle cx="100" cy="82" r="76" fill="url(#aiGlow)" />

      {/* Outer badge ring */}
      <Circle cx="100" cy="82" r="58" fill="none" stroke="url(#aiRing)" strokeWidth="3" opacity={0.95} />
      <Circle cx="100" cy="82" r="50" fill="url(#aiCard)" stroke="#2E2E3A" strokeWidth="1.5" />

      {/* Neural network */}
      <G opacity={0.9}>
        <Line x1="58" y1="58" x2="82" y2="72" stroke="#FFB800" strokeWidth="1.4" opacity={0.55} />
        <Line x1="82" y1="72" x2="100" y2="54" stroke="#FFB800" strokeWidth="1.4" opacity={0.55} />
        <Line x1="100" y1="54" x2="118" y2="72" stroke="#FFB800" strokeWidth="1.4" opacity={0.55} />
        <Line x1="118" y1="72" x2="142" y2="58" stroke="#FFB800" strokeWidth="1.4" opacity={0.55} />
        <Line x1="82" y1="72" x2="76" y2="96" stroke="#4CAF7D" strokeWidth="1.4" opacity={0.5} />
        <Line x1="118" y1="72" x2="124" y2="96" stroke="#4CAF7D" strokeWidth="1.4" opacity={0.5} />
        <Line x1="76" y1="96" x2="100" y2="108" stroke="url(#aiLine)" strokeWidth="1.6" opacity={0.7} />
        <Line x1="124" y1="96" x2="100" y2="108" stroke="url(#aiLine)" strokeWidth="1.6" opacity={0.7} />
        <Line x1="100" y1="54" x2="100" y2="72" stroke="#FFFFFF" strokeWidth="1.2" opacity={0.35} />

        <Circle cx="58" cy="58" r="4" fill="#FFB800" />
        <Circle cx="82" cy="72" r="3.5" fill="#FFB800" opacity={0.85} />
        <Circle cx="100" cy="54" r="4.5" fill="#FFFFFF" />
        <Circle cx="118" cy="72" r="3.5" fill="#FFB800" opacity={0.85} />
        <Circle cx="142" cy="58" r="4" fill="#FFB800" />
        <Circle cx="76" cy="96" r="3" fill="#4CAF7D" />
        <Circle cx="124" cy="96" r="3" fill="#4CAF7D" />
        <Circle cx="100" cy="108" r="4" fill="#FFB800" />
      </G>

      {/* Central AI spark */}
      <Path
        d="M100 68l2.2 6.8h7.1l-5.7 4.1 2.2 6.8L100 81.6l-5.8 4.1 2.2-6.8-5.7-4.1h7.1L100 68z"
        fill="url(#aiSpark)"
      />

      {/* Plan card accent — bottom */}
      <G transform="translate(62, 118)">
        <Rect x="0" y="0" width="76" height="34" rx="8" fill="#14141C" stroke="#3A3A48" strokeWidth="1.2" />
        <Rect x="10" y="10" width="28" height="4" rx="2" fill="#FFB800" opacity={0.9} />
        <Rect x="10" y="18" width="48" height="3" rx="1.5" fill="#555568" />
        <Rect x="10" y="24" width="36" height="3" rx="1.5" fill="#555568" opacity={0.7} />
        <Circle cx="62" cy="17" r="9" fill="rgba(255,184,0,0.15)" stroke="#FFB800" strokeWidth="1.2" />
        <Path
          d="M62 12v10M57 17h10"
          stroke="#FFB800"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </G>

      {/* Floating metric chips */}
      <G>
        <Rect x="24" y="118" width="30" height="16" rx="6" fill="rgba(76,175,125,0.18)" stroke="#4CAF7D" strokeWidth="1" />
        <Rect x="30" y="124" width="18" height="3" rx="1.5" fill="#4CAF7D" opacity={0.9} />
        <Rect x="146" y="112" width="30" height="16" rx="6" fill="rgba(255,184,0,0.14)" stroke="#FFB800" strokeWidth="1" />
        <Rect x="152" y="118" width="18" height="3" rx="1.5" fill="#FFB800" opacity={0.9} />
      </G>
    </Svg>
  );
}

export function AIWorkoutPlansSlide() {
  return (
    <View style={slideStyles.wrap}>
      <View style={slideStyles.iconFrame}>
        <View style={slideStyles.iconInner}>
          <AIPlansIcon size={ILLU_SIZE} />
        </View>
      </View>

      <Text style={slideStyles.eyebrow}>PERSONALIZED TRAINING</Text>
      <Text style={slideStyles.title}>AI-Optimized Workout Plans</Text>
      <Text style={slideStyles.description}>
        BrightFit analyzes your body composition, fitness level, and recovery data to build training programs engineered specifically for you. Every plan adapts as you progress — precise, efficient, and designed around how your body actually responds.
      </Text>
    </View>
  );
}

export default function AIWorkoutPlansScreen({ onContinue, onBack }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onBack}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <AIWorkoutPlansSlide />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} activeOpacity={0.85} onPress={onContinue}>
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
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 32,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  backArrow: {
    fontSize: 32,
    color: colors.matteBlack,
    lineHeight: 36,
    marginTop: -4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
  },
  iconFrame: {
    width: ILLU_SIZE + 24,
    height: ILLU_SIZE * 0.88 + 24,
    borderRadius: 28,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  iconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.deepGold,
    letterSpacing: 1.4,
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryGold,
    letterSpacing: -0.4,
    marginBottom: 14,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.charcoalGray,
    textAlign: 'center',
    lineHeight: 25,
    paddingHorizontal: 4,
    maxWidth: 330,
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

const slideStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  iconFrame: {
    width: ILLU_SIZE + 24,
    height: ILLU_SIZE * 0.88 + 24,
    borderRadius: 28,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  iconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.deepGold,
    letterSpacing: 1.4,
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryGold,
    letterSpacing: -0.4,
    marginBottom: 14,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.charcoalGray,
    textAlign: 'center',
    lineHeight: 25,
    paddingHorizontal: 4,
    maxWidth: 330,
  },
});
