import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants';

interface SocialProofScreenProps {
  onContinue?: () => void;
  onBack?: () => void;
}

export default function SocialProofScreen({ onContinue, onBack }: SocialProofScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onBack}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      {/* Main content */}
      <View style={styles.content}>
        {/* Headline */}
        <Text style={styles.headline}>
          <Text style={styles.brandName}>BrightFit </Text>
          <Text style={styles.headlineText}>was made for people just like you!</Text>
        </Text>

        {/* Stat block */}
        <View style={styles.statBlock}>
          <Text style={styles.statLine}>
            <Text style={styles.statNumber}>90%</Text>
            <Text style={styles.statLabel}> of users</Text>
          </Text>
          <Text style={styles.statDescription}>
            Claim that workout plans offered met all physique expectations, endurance goals, and body transformation results.
          </Text>
        </View>
      </View>

      {/* Continue button */}
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
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  backArrow: {
    fontSize: 32,
    color: colors.matteBlack,
    lineHeight: 36,
    marginTop: -4,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 56,
    paddingBottom: 40,
  },

  headline: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  brandName: {
    color: colors.primaryGold,
    fontWeight: '800',
  },
  headlineText: {
    color: colors.matteBlack,
    fontWeight: '800',
  },

  statBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  statLine: {
    textAlign: 'center',
  },
  statNumber: {
    fontSize: 52,
    fontWeight: '800',
    color: colors.primaryGold,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.matteBlack,
  },
  statDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.charcoalGray,
    textAlign: 'center',
    lineHeight: 22,
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
