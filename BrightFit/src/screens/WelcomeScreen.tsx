import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants';

const { width } = Dimensions.get('window');
const WREATH_W = width * 0.7;
const WREATH_H = width * 0.45;
const STAR_SIZE = WREATH_W * 0.13;

function StarShimmer({ size }: { size: number }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    let cancelled = false;

    const runShimmer = () => {
      if (cancelled) return;
      shimmer.setValue(0);
      const duration = 2000 + Math.random() * 2000;
      animRef.current = Animated.timing(shimmer, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      });
      animRef.current.start(({ finished }) => {
        if (!finished || cancelled) return;
        const delay = 5000 + Math.random() * 5000;
        timeoutRef.current = setTimeout(runShimmer, delay);
      });
    };

    runShimmer();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      animRef.current?.stop();
      shimmer.stopAnimation();
    };
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 1.8, size * 1.8],
  });

  return (
    <View style={[styles.starShimmerHost, { width: size, height: size }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.shimmerBand,
          {
            height: size * 1.7,
            width: size * 0.72,
            transform: [{ translateX }, { rotate: '24deg' }],
            mixBlendMode: 'screen',
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.35)',
            'rgba(255,255,255,0.95)',
            'rgba(255,255,255,0.35)',
            'rgba(255,255,255,0)',
          ]}
          locations={[0, 0.35, 0.5, 0.65, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

interface Props {
  onGetStarted?: () => void;
  onSkipToHome?: () => void;
  onLogin?: () => void;
}

const TRIPLE_TAP_WINDOW_MS = 700;

export default function WelcomeScreen({ onGetStarted, onSkipToHome, onLogin }: Props) {
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMascotPress = () => {
    tapCount.current += 1;

    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }

    if (tapCount.current >= 3) {
      tapCount.current = 0;
      onSkipToHome?.();
      return;
    }

    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
      tapTimer.current = null;
    }, TRIPLE_TAP_WINDOW_MS);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>
          <Text style={styles.logoBright}>Bright</Text>
          <Text style={styles.logoFit}>Fit</Text>
        </Text>
        <Text style={styles.tagline}>STRENGTH. SIMPLICITY. SUCCESS.</Text>
      </View>

      {/* Wreath */}
      <View style={styles.wreathContainer}>
        <Image
          source={require('../../images/wreath.png')}
          style={styles.wreath}
          resizeMode="contain"
        />
        <StarShimmer size={STAR_SIZE} />
      </View>

      {/* Mascot — triple-tap to skip to home */}
      <Pressable onPress={handleMascotPress} style={styles.mascotPressable}>
        <Image
          source={require('../../images/mascot.png')}
          style={styles.mascot}
          resizeMode="contain"
        />
      </Pressable>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.getStartedButton} activeOpacity={0.85} onPress={onGetStarted}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onLogin} activeOpacity={0.7}>
          <Text style={styles.loginPrompt}>
            Already have an account?{' '}
            <Text style={styles.loginLink}>Log in</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 36,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 10,
  },
  logoText: {
    fontSize: 42,
    letterSpacing: -0.5,
  },
  logoBright: {
    fontWeight: '900',
    color: colors.matteBlack,
  },
  logoFit: {
    fontWeight: '900',
    fontStyle: 'italic',
    color: colors.primaryGold,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: colors.matteBlack,
    marginTop: 2,
  },
  wreathContainer: {
    width: WREATH_W,
    height: WREATH_H,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wreath: {
    width: '100%',
    height: '100%',
  },
  starShimmerHost: {
    position: 'absolute',
    bottom: WREATH_H * 0.01,
    left: (WREATH_W - STAR_SIZE) / 2,
    overflow: 'hidden',
  },
  shimmerBand: {
    position: 'absolute',
    top: '50%',
    marginTop: -(STAR_SIZE * 0.8),
    left: '50%',
    marginLeft: -(STAR_SIZE * 0.275),
  },
  mascotPressable: {
    flex: 1,
    width: width * 0.72,
    alignItems: 'center',
  },
  mascot: {
    flex: 1,
    width: '100%',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  getStartedButton: {
    width: '100%',
    backgroundColor: colors.primaryGold,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.deepGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.matteBlack,
    letterSpacing: 0.3,
  },
  loginPrompt: {
    fontSize: 14,
    color: colors.charcoalGray,
    textAlign: 'center',
  },
  loginLink: {
    fontWeight: '700',
    color: colors.matteBlack,
    textDecorationLine: 'underline',
  },
});
