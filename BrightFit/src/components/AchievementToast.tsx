import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AchievementIcon from './AchievementIcon';
import type { AchievementDef } from '../data/achievements';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  achievement: AchievementDef;
  onDone: () => void;
}

export default function AchievementToast({ achievement, onDone }: Props) {
  const translateY = useRef(new Animated.Value(180)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 7,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 65,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 180,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start(() => onDone());
    }, 3400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }, { scale }],
          borderColor: achievement.color + '70',
          shadowColor: achievement.color,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity activeOpacity={0.95} onPress={onDone} style={styles.inner}>

        {/* Top label row */}
        <View style={styles.labelRow}>
          <View style={[styles.labelDot, { backgroundColor: achievement.color }]} />
          <Text style={[styles.labelText, { color: achievement.color }]}>
            ACHIEVEMENT UNLOCKED
          </Text>
          {/* Sparkle accent */}
          <Svg width={12} height={12} viewBox="0 0 24 24">
            <Path
              d="M12 2l1.8 5.5H20l-5 3.6 1.9 5.9L12 13.6l-4.9 3.4 1.9-5.9-5-3.6h6.2z"
              fill={achievement.color}
            />
          </Svg>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View
            style={[
              styles.iconRing,
              {
                borderColor: achievement.color,
                backgroundColor: achievement.color + '18',
                shadowColor: achievement.color,
              },
            ]}
          >
            <AchievementIcon
              iconKey={achievement.iconKey}
              color={achievement.color}
              size={38}
            />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {achievement.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {achievement.description}
            </Text>
          </View>
        </View>

        {/* Glow bar at top */}
        <View style={[styles.glowBar, { backgroundColor: achievement.color }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 92,
    left: 14,
    right: 14,
    backgroundColor: '#141418',
    borderRadius: 18,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 24,
    overflow: 'hidden',
    zIndex: 9999,
  },
  glowBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
    opacity: 0.9,
  },
  inner: {
    padding: 16,
    paddingTop: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    flex: 1,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  textBlock: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9999AA',
    lineHeight: 17,
  },
});
