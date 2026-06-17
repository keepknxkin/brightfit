import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/constants';
import { useWorkout } from '../context/WorkoutContext';
import {
  ACHIEVEMENTS,
  RANKS,
  getCurrentRank,
} from '../data/achievements';
import AchievementIcon from '../components/AchievementIcon';

const GOLD = colors.primaryGold;

interface Props {
  onBack: () => void;
}

export default function AllAchievementsScreen({ onBack }: Props) {
  const { history, earnedAchievements } = useWorkout();

  const completedCount = history.filter(r => r.completed).length;
  const { rank: currentRank, next: nextRank, progress: rankProgress } = getCurrentRank(completedCount);
  const earnedCount = ACHIEVEMENTS.filter(a => earnedAchievements.includes(a.id)).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={onBack}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke={GOLD}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>All Achievements</Text>
          <Text style={styles.headerSub}>
            {earnedCount} of {ACHIEVEMENTS.length} unlocked
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current rank */}
        <View style={[styles.rankCard, { borderColor: currentRank.color + '50' }]}>
          <View style={[styles.rankGlow, { backgroundColor: currentRank.color }]} />
          <View style={[styles.rankIconRing, { borderColor: currentRank.color, backgroundColor: currentRank.color + '18' }]}>
            <AchievementIcon iconKey={currentRank.iconKey} color={currentRank.color} size={40} />
          </View>
          <View style={styles.rankInfo}>
            <Text style={styles.rankLabel}>CURRENT RANK</Text>
            <Text style={[styles.rankName, { color: currentRank.color }]}>
              {currentRank.name.toUpperCase()}
            </Text>
            {nextRank ? (
              <>
                <Text style={styles.rankSubtitle}>
                  {nextRank.minWorkouts - completedCount} workouts to{' '}
                  <Text style={{ color: nextRank.color }}>{nextRank.name}</Text>
                </Text>
                <View style={styles.rankProgressTrack}>
                  <View
                    style={[
                      styles.rankProgressFill,
                      { width: `${rankProgress * 100}%`, backgroundColor: currentRank.color },
                    ]}
                  />
                </View>
              </>
            ) : (
              <Text style={styles.rankSubtitle}>Legendary status achieved ✦</Text>
            )}
          </View>
        </View>

        {/* Rank ladder */}
        <Text style={styles.sectionLabel}>RANK PROGRESSION</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ranksScroll}
        >
          {RANKS.map((rank, idx) => {
            const unlocked = completedCount >= rank.minWorkouts;
            const isCurrent = rank.name === currentRank.name;
            return (
              <View
                key={rank.name}
                style={[
                  styles.rankStep,
                  unlocked && { borderColor: rank.color + '60', backgroundColor: rank.color + '10' },
                  isCurrent && { borderColor: rank.color, backgroundColor: rank.color + '18' },
                ]}
              >
                <AchievementIcon
                  iconKey={rank.iconKey}
                  color={unlocked ? rank.color : '#3A3A4A'}
                  size={22}
                />
                <Text style={[styles.rankStepName, unlocked && { color: rank.color }]}>
                  {rank.name}
                </Text>
                <Text style={styles.rankStepReq}>{rank.minWorkouts} workouts</Text>
                {isCurrent && <View style={[styles.currentDot, { backgroundColor: rank.color }]} />}
                {idx < RANKS.length - 1 && (
                  <View style={[styles.rankConnector, unlocked && { backgroundColor: rank.color + '40' }]} />
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* All badges */}
        <Text style={styles.sectionLabel}>BADGES</Text>
        {ACHIEVEMENTS.map(achievement => {
          const isEarned = earnedAchievements.includes(achievement.id);
          return (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                isEarned
                  ? { borderColor: achievement.color + '45', backgroundColor: achievement.color + '08' }
                  : { borderColor: '#252530', backgroundColor: '#111116' },
              ]}
            >
              <View
                style={[
                  styles.achievementIconWrap,
                  isEarned
                    ? { borderColor: achievement.color, backgroundColor: achievement.color + '18' }
                    : { borderColor: '#252530', backgroundColor: '#0B0B0F' },
                ]}
              >
                <AchievementIcon
                  iconKey={achievement.iconKey}
                  color={isEarned ? achievement.color : '#3A3A4A'}
                  size={28}
                />
                {!isEarned && (
                  <View style={styles.lockBadge}>
                    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M8 11V7a4 4 0 018 0v4"
                        stroke="#555568"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <Path d="M4 11h16v11a1 1 0 01-1 1H5a1 1 0 01-1-1V11z" fill="#555568" />
                    </Svg>
                  </View>
                )}
              </View>
              <View style={styles.achievementText}>
                <Text style={[styles.achievementTitle, isEarned && { color: '#F0F0F5' }]}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDesc}>{achievement.description}</Text>
              </View>
              <View style={[styles.statusPill, isEarned && { backgroundColor: achievement.color + '22' }]}>
                <Text style={[styles.statusText, isEarned && { color: achievement.color }]}>
                  {isEarned ? 'Unlocked' : 'Locked'}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#141418',
    borderWidth: 1,
    borderColor: '#252530',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F0F0F5',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666678',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141418',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  rankGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -50,
    right: -40,
    opacity: 0.07,
  },
  rankIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankInfo: {
    flex: 1,
    gap: 3,
  },
  rankLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#555568',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  rankName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 1,
  },
  rankSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#9999AA',
    marginTop: 2,
  },
  rankProgressTrack: {
    height: 5,
    backgroundColor: '#252530',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  rankProgressFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 6,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#555568',
    letterSpacing: 1.8,
    marginBottom: 12,
  },
  ranksScroll: {
    gap: 10,
    paddingBottom: 24,
    paddingRight: 8,
  },
  rankStep: {
    width: 88,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#252530',
    backgroundColor: '#111116',
    gap: 6,
  },
  rankStepName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555568',
    textAlign: 'center',
  },
  rankStepReq: {
    fontSize: 9,
    fontWeight: '500',
    color: '#444455',
    textAlign: 'center',
  },
  currentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  rankConnector: {
    display: 'none',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 14,
  },
  achievementIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#141418',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#252530',
  },
  achievementText: {
    flex: 1,
    gap: 3,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#888899',
  },
  achievementDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555568',
    lineHeight: 16,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#1A1A22',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#555568',
    letterSpacing: 0.5,
  },
});
