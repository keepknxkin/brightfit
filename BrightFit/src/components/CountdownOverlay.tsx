import React, { useState, useRef, useEffect } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

const GOLD = '#FFB800';
const DIMMED = '#555568';

const glowConfig: Record<number, { size: number; opacity: number }> = {
  3: { size: 180, opacity: 0.35 },
  2: { size: 220, opacity: 0.55 },
  1: { size: 270, opacity: 0.80 },
};

export default function CountdownOverlay({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(5);
  const [phase, setPhase] = useState<'counting' | 'go'>('counting');

  const scaleAnim   = useRef(new Animated.Value(0.5)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale   = useRef(new Animated.Value(0.6)).current;

  function animateNumber(special: boolean) {
    scaleAnim.setValue(0.4);
    Animated.spring(scaleAnim, {
      toValue: 1, damping: 9, stiffness: 260, useNativeDriver: true,
    }).start();

    if (special) {
      glowOpacity.setValue(0);
      glowScale.setValue(0.5);
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
        Animated.spring(glowScale, {
          toValue: 1, damping: 7, stiffness: 180, useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(glowOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }

  useEffect(() => {
    const isSpecial = count <= 3 && count > 0;
    animateNumber(isSpecial);

    if (count === 0) {
      setPhase('go');
      scaleAnim.setValue(0.3);
      glowOpacity.setValue(0);
      glowScale.setValue(0.4);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, damping: 6, stiffness: 200, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(glowScale, { toValue: 1, damping: 6, useNativeDriver: true }),
      ]).start();
      setTimeout(() => onDone(), 500);
      return;
    }

    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  const isSpecial = count <= 3;
  const isGo      = phase === 'go';
  const cfg        = isGo ? { size: 300, opacity: 1 } : (glowConfig[count] ?? { size: 0, opacity: 0 });

  return (
    <View style={s.wrap}>
      {/* Glow ring */}
      {cfg.size > 0 && (
        <Animated.View
          style={[
            s.glow,
            {
              width: cfg.size,
              height: cfg.size,
              borderRadius: cfg.size / 2,
              opacity: Animated.multiply(glowOpacity, cfg.opacity),
              transform: [{ scale: glowScale }],
            },
          ]}
        />
      )}

      <Animated.Text
        style={[
          s.number,
          (isSpecial || isGo) && s.numberGold,
          isGo && s.numberGo,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {isGo ? 'GO!' : count}
      </Animated.Text>

      {!isGo && (
        <Text style={s.label}>
          {isSpecial ? '· · ·' : 'GET READY'}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,11,15,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  glow: {
    position: 'absolute',
    backgroundColor: GOLD,
  },
  number: {
    fontSize: 120,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -4,
    textAlign: 'center',
  },
  numberGold: { color: GOLD },
  numberGo: { fontSize: 96, letterSpacing: -2 },
  label: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: '700',
    color: DIMMED,
    letterSpacing: 3,
  },
});
