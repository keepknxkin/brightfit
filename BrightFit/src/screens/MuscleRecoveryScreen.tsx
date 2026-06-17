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

/**
 * Recovery dashboard widget — zone-based load tracking, not anatomical body maps.
 */
function RecoveryDashboardIllustration({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.94} viewBox="0 0 200 188">
      <Defs>
        <LinearGradient id="rcGlow" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFB800" stopOpacity="0.24" />
          <Stop offset="1" stopColor="#FFB800" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="rcPanel" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1E1E28" />
          <Stop offset="1" stopColor="#0B0B0F" />
        </LinearGradient>
        <LinearGradient id="rcArc" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#4CAF7D" />
          <Stop offset="0.6" stopColor="#6FBE92" />
          <Stop offset="1" stopColor="#FFB800" />
        </LinearGradient>
        <LinearGradient id="rcBarGreen" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#3A9468" />
          <Stop offset="1" stopColor="#4CAF7D" />
        </LinearGradient>
        <LinearGradient id="rcBarGold" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#C99200" />
          <Stop offset="1" stopColor="#FFB800" />
        </LinearGradient>
        <LinearGradient id="rcBarGray" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#353545" />
          <Stop offset="1" stopColor="#555568" />
        </LinearGradient>
      </Defs>

      <Circle cx="100" cy="90" r="80" fill="url(#rcGlow)" />

      {/* Main dashboard card */}
      <Rect x="22" y="14" width="156" height="156" rx="18" fill="url(#rcPanel)" stroke="#2E2E3A" strokeWidth="1.5" />

      {/* Header */}
      <Rect x="34" y="26" width="48" height="5" rx="2.5" fill="#FFB800" opacity={0.9} />
      <Rect x="34" y="35" width="72" height="3.5" rx="1.75" fill="#555568" opacity={0.65} />
      <Rect x="132" y="24" width="34" height="16" rx="6" fill="rgba(76,175,125,0.14)" stroke="#4CAF7D" strokeWidth="1" />
      <Rect x="138" y="30" width="22" height="3" rx="1.5" fill="#4CAF7D" opacity={0.85} />

      {/* Recovery score ring */}
      <G transform="translate(100, 72)">
        <Circle cx="0" cy="0" r="36" fill="none" stroke="#252530" strokeWidth="5.5" />
        <Path
          d="M 0 -36 A 36 36 0 1 1 -24 26"
          fill="none"
          stroke="url(#rcArc)"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <Circle cx="0" cy="0" r="26" fill="#101018" stroke="#2A2A35" strokeWidth="1" />
        <Rect x="-16" y="-12" width="32" height="9" rx="2.5" fill="#FFB800" />
        <Rect x="-12" y="2" width="24" height="4" rx="2" fill="#666678" />
      </G>

      {/* Zone rows with abstract hex node icons */}
      {[
        { y: 112, fill: 'url(#rcBarGreen)', w: 46, node: '#4CAF7D' },
        { y: 132, fill: 'url(#rcBarGold)', w: 26, node: '#FFB800' },
        { y: 152, fill: 'url(#rcBarGray)', w: 38, node: '#555568' },
      ].map((row, i) => (
        <G key={i}>
          <Rect x="34" y={row.y} width="132" height="16" rx="7" fill="#14141C" stroke="#2A2A35" strokeWidth="1" />
          <Path
            d={`M44 ${row.y + 8} l4 -3.5 4 3.5 4 -3.5 4 3.5`}
            stroke={row.node}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Rect x="66" y={row.y + 5.5} width="28" height="2.5" rx="1.25" fill="#888898" opacity={0.5} />
          <Rect x="66" y={row.y + 10} width="18" height="2" rx="1" fill="#555568" opacity={0.4} />
          <Rect x="98" y={row.y + 5} width="56" height="6" rx="3" fill="#252530" />
          <Rect x="98" y={row.y + 5} width={row.w} height="6" rx="3" fill={row.fill} />
        </G>
      ))}

      {/* Floating alert chip */}
      <G transform="translate(16, 118)">
        <Rect x="0" y="0" width="16" height="16" rx="5" fill="rgba(255,184,0,0.14)" stroke="#FFB800" strokeWidth="1" />
        <Line x1="8" y1="5" x2="8" y2="11" stroke="#FFB800" strokeWidth="1.6" strokeLinecap="round" />
        <Circle cx="8" cy="12.5" r="0.9" fill="#FFB800" />
      </G>

      {/* Activity timeline */}
      <G opacity={0.9}>
        <Path
          d="M34 176 Q48 170 62 176 T90 172 T118 176 T146 170 T166 174"
          stroke="#FFB800"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity={0.4}
        />
        <Circle cx="62" cy="176" r="2.5" fill="#4CAF7D" />
        <Circle cx="90" cy="172" r="2.5" fill="#FFB800" />
        <Circle cx="118" cy="176" r="2.5" fill="#4CAF7D" />
        <Circle cx="146" cy="170" r="2.5" fill="#555568" />
      </G>
    </Svg>
  );
}

export function MuscleRecoverySlide() {
  return (
    <View style={slideStyles.wrap}>
      <View style={slideStyles.iconFrame}>
        <View style={slideStyles.iconInner}>
          <RecoveryDashboardIllustration size={ILLU_SIZE} />
        </View>
      </View>

      <Text style={slideStyles.eyebrow}>INTELLIGENT LOAD MANAGEMENT</Text>
      <Text style={slideStyles.title}>Fatigue & Recovery Tracking</Text>
      <Text style={slideStyles.description}>
        BrightFit monitors training load across every muscle group and surfaces recovery readiness in real time. Know when to push, when to deload, and exactly which regions are primed for your next session — so every workout lands with precision.
      </Text>

      <View style={slideStyles.legendRow}>
        <View style={slideStyles.legendItem}>
          <View style={[slideStyles.legendDot, slideStyles.legendReady]} />
          <Text style={slideStyles.legendText}>Ready</Text>
        </View>
        <View style={slideStyles.legendItem}>
          <View style={[slideStyles.legendDot, slideStyles.legendFatigued]} />
          <Text style={slideStyles.legendText}>Fatigued</Text>
        </View>
        <View style={slideStyles.legendItem}>
          <View style={[slideStyles.legendDot, slideStyles.legendResting]} />
          <Text style={slideStyles.legendText}>Resting</Text>
        </View>
      </View>
    </View>
  );
}

export default function MuscleRecoveryScreen({ onContinue, onBack }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onBack}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <MuscleRecoverySlide />
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
    paddingBottom: 16,
  },
  iconFrame: {
    width: ILLU_SIZE + 24,
    height: ILLU_SIZE * 0.94 + 24,
    borderRadius: 28,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
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
    marginBottom: 22,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendReady: {
    backgroundColor: '#4CAF7D',
  },
  legendFatigued: {
    backgroundColor: colors.primaryGold,
  },
  legendResting: {
    backgroundColor: '#42425A',
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoalGray,
    letterSpacing: 0.2,
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
    height: ILLU_SIZE * 0.94 + 24,
    borderRadius: 28,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
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
    marginBottom: 22,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendReady: {
    backgroundColor: '#4CAF7D',
  },
  legendFatigued: {
    backgroundColor: colors.primaryGold,
  },
  legendResting: {
    backgroundColor: '#42425A',
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoalGray,
    letterSpacing: 0.2,
  },
});
