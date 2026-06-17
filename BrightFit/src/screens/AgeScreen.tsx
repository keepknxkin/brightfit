import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants';

const TOTAL_STEPS = 9;
const CURRENT_STEP = 2;

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 7;
const HALF = Math.floor(VISIBLE_ITEMS / 2); // 3
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const MIN_AGE = 13;
const MAX_AGE = 99;
const DEFAULT_AGE = 25;

const AGES: number[] = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

// Null padding so the first/last ages can snap to centre
const PADDED: (number | null)[] = [
  ...Array<null>(HALF).fill(null),
  ...AGES,
  ...Array<null>(HALF).fill(null),
];

interface AgeScreenProps {
  onContinue?: (age: number) => void;
  onBack?: () => void;
}

export default function AgeScreen({ onContinue, onBack }: AgeScreenProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<number | null>>(null);
  const [selectedAge, setSelectedAge] = useState(DEFAULT_AGE);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true },
  );

  const handleMomentumEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    const index = Math.round(offset / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, AGES.length - 1));
    setSelectedAge(AGES[clamped]);
  }, []);

  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    const index = Math.round(offset / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, AGES.length - 1));
    setSelectedAge(AGES[clamped]);
  }, []);

  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<number | null>) => {
    if (item === null) return <View style={styles.item} />;

    // scrollY when this item sits exactly at the centre
    const centreOffset = (index - HALF) * ITEM_HEIGHT;

    const inputRange = [
      centreOffset - ITEM_HEIGHT * 3,
      centreOffset - ITEM_HEIGHT * 2,
      centreOffset - ITEM_HEIGHT,
      centreOffset,
      centreOffset + ITEM_HEIGHT,
      centreOffset + ITEM_HEIGHT * 2,
      centreOffset + ITEM_HEIGHT * 3,
    ];

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.15, 0.25, 0.5, 1, 0.5, 0.25, 0.15],
      extrapolate: 'clamp',
    });

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.72, 0.80, 0.90, 1.0, 0.90, 0.80, 0.72],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.item, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.itemText}>{item}</Text>
      </Animated.View>
    );
  }, [scrollY]);

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
        <Text style={styles.title}>What is your age?</Text>
        <Text style={styles.subtitle}>Personalizing your BrightFit plan...</Text>
      </View>

      {/* Scroll wheel — dead centre of remaining space */}
      <View style={styles.pickerOuter}>
        <View style={styles.pickerContainer}>

          {/* Selection pill behind the list */}
          <View style={styles.selectionPill} pointerEvents="none" />

          {/* Top edge line */}
          <View style={[styles.separatorLine, styles.separatorTop]} pointerEvents="none" />

          {/* Bottom edge line */}
          <View style={[styles.separatorLine, styles.separatorBottom]} pointerEvents="none" />

          <Animated.FlatList<number | null>
            ref={flatListRef}
            data={PADDED}
            keyExtractor={(item, index) => `${item ?? 'pad'}_${index}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            initialScrollIndex={DEFAULT_AGE - MIN_AGE}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onMomentumScrollEnd={handleMomentumEnd}
            onScrollEndDrag={handleScrollEnd}
            style={styles.flatList}
          />
        </View>
      </View>

      {/* Info card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <View style={styles.infoTextBlock}>
          <Text style={styles.infoTitle}>We use your age to build a more accurate fitness experience</Text>
          <Text style={styles.infoBody}>Older people tend to have more body fat than younger people</Text>
        </View>
      </View>

      {/* Continue */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={() => onContinue?.(selectedAge)}
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

  // ── Top bar ───────────────────────────────────────────
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

  // ── Header ────────────────────────────────────────────
  header: {
    marginBottom: 28,
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

  // ── Picker ────────────────────────────────────────────
  pickerOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    width: 200,
    height: PICKER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  flatList: {
    width: 200,
    height: PICKER_HEIGHT,
    flexGrow: 0,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
  },
  itemText: {
    fontSize: 30,
    fontWeight: '400',
    color: colors.matteBlack,
    letterSpacing: 0.5,
  },

  // Highlight pill at centre row
  selectionPill: {
    position: 'absolute',
    width: 200,
    height: ITEM_HEIGHT,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    zIndex: 0,
  },

  // Hairline separators top & bottom of the centre cell
  separatorLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#DCDCDC',
    zIndex: 2,
  },
  separatorTop: {
    top: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
  },
  separatorBottom: {
    top: PICKER_HEIGHT / 2 + ITEM_HEIGHT / 2,
  },

  // ── Info card ─────────────────────────────────────────
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoIcon: {
    fontSize: 20,
    lineHeight: 24,
    marginTop: 1,
  },
  infoTextBlock: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.matteBlack,
    lineHeight: 18,
  },
  infoBody: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.charcoalGray,
    lineHeight: 18,
  },

  // ── Footer ────────────────────────────────────────────
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
