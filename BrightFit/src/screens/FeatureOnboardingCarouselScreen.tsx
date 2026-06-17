import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants';
import { BMITrackingSlide } from './BMITrackingScreen';
import { AIWorkoutPlansSlide } from './AIWorkoutPlansScreen';
import { MuscleRecoverySlide } from './MuscleRecoveryScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 28;
const PAGE_COUNT = 3;

interface Props {
  onContinue?: () => void;
  onBack?: () => void;
}

export default function FeatureOnboardingCarouselScreen({ onContinue, onBack }: Props) {
  const pagerRef = useRef<ScrollView>(null);
  const [activePage, setActivePage] = useState(0);
  const isLastPage = activePage === PAGE_COUNT - 1;

  const syncPageFromOffset = useCallback((offsetX: number) => {
    const page = Math.max(0, Math.min(PAGE_COUNT - 1, Math.round(offsetX / SCREEN_WIDTH)));
    setActivePage(page);
  }, []);

  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncPageFromOffset(e.nativeEvent.contentOffset.x);
  }, [syncPageFromOffset]);

  const goToPage = useCallback((index: number) => {
    setActivePage(index);
    pagerRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  }, []);

  const slides = [
    { key: 'bmi', content: <BMITrackingSlide /> },
    { key: 'ai', content: <AIWorkoutPlansSlide /> },
    { key: 'recovery', content: <MuscleRecoverySlide /> },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onBack}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        style={styles.pager}
        contentContainerStyle={styles.pagerContent}
      >
        {slides.map((slide) => (
          <View key={slide.key} style={styles.slide}>
            <View style={styles.slideInner}>{slide.content}</View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.dotsRow}>
          {slides.map((slide, index) => {
            const active = index === activePage;
            return (
              <TouchableOpacity
                key={slide.key}
                style={[styles.dot, active && styles.dotActive]}
                activeOpacity={0.8}
                onPress={() => goToPage(index)}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${index + 1} of ${PAGE_COUNT}`}
                accessibilityState={{ selected: active }}
              />
            );
          })}
        </View>

        {isLastPage ? (
          <TouchableOpacity
            style={styles.continueButton}
            activeOpacity={0.85}
            onPress={onContinue}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.swipeHint}>Swipe to explore</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardWhite,
    paddingBottom: 32,
  },
  topBar: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
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
  pager: {
    flex: 1,
  },
  pagerContent: {
    alignItems: 'stretch',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
  },
  slideInner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  bottomBar: {
    width: '100%',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
    gap: 18,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderGray,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.primaryGold,
  },
  swipeHint: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoalGray,
    textAlign: 'center',
    paddingVertical: 18,
    opacity: 0.65,
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
