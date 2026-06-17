import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '@/constants';

const { width } = Dimensions.get('window');
const ILLU_SIZE = Math.min(width * 0.72, 280);

interface Props {
  onContinue?: () => void;
  onBack?: () => void;
}

function BMIChartIllustration({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.85} viewBox="0 0 200 170">
      <Defs>
        <LinearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFB800" stopOpacity="0.18" />
          <Stop offset="1" stopColor="#FFB800" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1A1A22" />
          <Stop offset="1" stopColor="#0B0B0F" />
        </LinearGradient>
        <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#4CAF7D" />
          <Stop offset="1" stopColor="#FFB800" />
        </LinearGradient>
      </Defs>

      {/* Soft glow */}
      <Circle cx="100" cy="78" r="72" fill="url(#glowGrad)" />

      {/* Tablet body — slight isometric tilt */}
      <G transform="translate(28, 38)">
        <Rect x="4" y="8" width="136" height="96" rx="8" fill="#2A2A35" />
        <Rect x="0" y="0" width="136" height="96" rx="8" fill="url(#screenGrad)" stroke="#3A3A48" strokeWidth="1.5" />

        {/* Chart bars */}
        <Rect x="22" y="58" width="18" height="22" rx="3" fill="#E85D4A" opacity={0.9} />
        <Rect x="48" y="48" width="18" height="32" rx="3" fill="#FFB800" />
        <Rect x="74" y="38" width="18" height="42" rx="3" fill="#4CAF7D" />

        {/* Trend line climbing */}
        <Path
          d="M18 62 L42 50 L68 42 L94 28 L108 22"
          stroke="url(#lineGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Circle cx="108" cy="22" r="4" fill="#FFB800" />

        {/* BMI label chip */}
        <Rect x="88" y="12" width="36" height="14" rx="4" fill="rgba(255,184,0,0.25)" />
        <Rect x="90" y="14" width="20" height="3" rx="1" fill="#FFB800" opacity={0.8} />
      </G>

      {/* Scale / body icon accent */}
      <G transform="translate(148, 52)">
        <Circle cx="16" cy="16" r="20" fill="rgba(255,184,0,0.12)" />
        <Path
          d="M16 8v16M10 14h12"
          stroke="#FFB800"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M8 28c0-4 3.6-7 8-7s8 3 8 7"
          stroke="#FFB800"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </G>
    </Svg>
  );
}

export function BMITrackingSlide() {
  return (
    <View style={slideStyles.wrap}>
      <View style={slideStyles.illustrationWrap}>
        <BMIChartIllustration size={ILLU_SIZE} />
      </View>

      <Text style={slideStyles.title}>BMI Tracking</Text>
      <Text style={slideStyles.description}>
        We track your BMI, body fat, and lean mass over time so you can see real progress. BrightFit turns your stats into clear trends as your fitness journey unfolds.
      </Text>
    </View>
  );
}

export default function BMITrackingScreen({ onContinue, onBack }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onBack}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <BMITrackingSlide />
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
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryGold,
    letterSpacing: -0.3,
    marginBottom: 14,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.charcoalGray,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
    maxWidth: 320,
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
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryGold,
    letterSpacing: -0.3,
    marginBottom: 14,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.charcoalGray,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
    maxWidth: 320,
  },
});
