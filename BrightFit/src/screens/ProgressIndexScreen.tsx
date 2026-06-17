import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/constants';
import {
  useWorkout,
  weeklyVolume,
  weeklyMinutes,
  totalIronPoints,
  calculateStreak,
  bestStreak,
  weeklyWorkoutCount,
  getThisWeekWorkoutDays,
  type WorkoutRecord,
} from '../context/WorkoutContext';

const C = {
  bg: '#0B0B0F',
  surface: '#141418',
  border: '#252530',
  gold: colors.primaryGold,
  white: '#FFFFFF',
  muted: '#9999AA',
  dimmed: '#555568',
  green: '#4CAF7D',
};

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getWeekRangeLabel(): string {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${fmt(weekStart)} – ${fmt(weekEnd)}`;
}

function weeklyStarPoints(history: WorkoutRecord[]): number {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return history
    .filter((r) => new Date(r.date) >= weekStart)
    .reduce((sum, r) => sum + (r.completed ? 10 : 2), 0);
}

interface Props {
  onBack: () => void;
  workoutsPerWeek?: string;
  onOpenVolume?: () => void;
  onOpenWorkoutTime?: () => void;
}

export default function ProgressIndexScreen({
  onBack,
  workoutsPerWeek = '',
  onOpenVolume,
  onOpenWorkoutTime,
}: Props) {
  const insets = useSafeAreaInsets();
  const { history } = useWorkout();

  const weekCount = weeklyWorkoutCount(history);
  const weekGoal = parseInt(workoutsPerWeek, 10) || 5;
  const indexScore = Math.min(100, Math.round((weekCount / weekGoal) * 100));
  const barPercent = Math.min(100, weekCount * 20);
  const weekDays = getThisWeekWorkoutDays(history);
  const today = new Date().getDay();

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const thisWeekWorkouts = history.filter((r) => new Date(r.date) >= weekStart);

  const streak = calculateStreak(history);
  const best = bestStreak(history);
  const volThisWeek = weeklyVolume(history);
  const minThisWeek = weeklyMinutes(history);
  const pointsThisWeek = weeklyStarPoints(history);
  const totalPoints = totalIronPoints(history);

  const weekLabel =
    weekCount === 0
      ? 'Week Just Started'
      : `${weekCount} Workout${weekCount > 1 ? 's' : ''} This Week`;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={onBack}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke={C.gold}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Progress Index</Text>
          <Text style={styles.headerSub}>{getWeekRangeLabel()}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroStar}>✦</Text>
            <View style={styles.heroScoreWrap}>
              <Text style={styles.heroScore}>{indexScore}</Text>
              <Text style={styles.heroScoreMax}>/100</Text>
            </View>
          </View>
          <Text style={styles.heroWeek}>{weekLabel}</Text>
          <Text style={styles.heroGoal}>
            {weekCount}/{weekGoal} weekly goal
          </Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${barPercent}%` }]} />
            <View style={[styles.progressDot, { left: `${barPercent}%` }]} />
          </View>

          <View style={styles.dayRow}>
            {DAY_LABELS.map((d, i) => {
              const isToday = i === today;
              const done = weekDays[i];
              const isFuture = i > today;
              return (
                <View key={i} style={styles.dayCol}>
                  <Text style={[styles.dayLabel, isToday && { color: C.gold }]}>{d}</Text>
                  <View style={[
                    styles.dayDot,
                    done && styles.dayDotDone,
                    isToday && !done && styles.dayDotToday,
                    isFuture && { opacity: 0.35 },
                  ]}>
                    {done && (
                      <Svg width={8} height={8} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M5 12l5 5L19 7"
                          stroke="#0B0B0F"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionLabel}>THIS WEEK</Text>
        <View style={styles.statsGrid}>
          {[
            {
              label: 'Volume',
              value: volThisWeek > 0 ? `${volThisWeek.toLocaleString()} lbs` : '0 lbs',
              onPress: onOpenVolume,
            },
            {
              label: 'Workout Time',
              value: minThisWeek > 0 ? `${minThisWeek}m` : '0m',
              onPress: onOpenWorkoutTime,
            },
            { label: 'Star Points', value: `+${pointsThisWeek}` },
            { label: 'Streak', value: `${streak} day${streak !== 1 ? 's' : ''}` },
          ].map((stat) => {
            const CardWrapper = stat.onPress ? TouchableOpacity : View;
            return (
              <CardWrapper
                key={stat.label}
                style={styles.statCard}
                {...(stat.onPress
                  ? {
                      activeOpacity: 0.75,
                      onPress: stat.onPress,
                      accessibilityRole: 'button' as const,
                      accessibilityLabel: `Open ${stat.label} details`,
                    }
                  : {})}
              >
                <View style={styles.statCardTop}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  {stat.onPress && <Text style={styles.statChevron}>›</Text>}
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
              </CardWrapper>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>ALL TIME</Text>
        <View style={styles.allTimeRow}>
          <View style={styles.allTimeCard}>
            <Text style={styles.allTimeLabel}>Total Star Points</Text>
            <Text style={styles.allTimeValue}>{totalPoints}</Text>
          </View>
          <View style={styles.allTimeCard}>
            <Text style={styles.allTimeLabel}>Best Streak</Text>
            <Text style={styles.allTimeValue}>{best} day{best !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {thisWeekWorkouts.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>WORKOUTS THIS WEEK</Text>
            {thisWeekWorkouts.map((record) => {
              const d = new Date(record.date);
              const dateStr = d.toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              });
              const mins = Math.round(record.durationSeconds / 60);
              return (
                <View
                  key={record.id}
                  style={[
                    styles.workoutRow,
                    !record.completed && styles.workoutRowAbandoned,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.workoutTitle}>{record.title}</Text>
                    <Text style={styles.workoutMeta}>{dateStr} · {mins}m</Text>
                  </View>
                  <Text style={[
                    styles.workoutStatus,
                    { color: record.completed ? C.green : C.gold },
                  ]}>
                    {record.completed ? 'Done' : 'Partial'}
                  </Text>
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
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
    paddingTop: 4,
  },
  heroCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginBottom: 28,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroStar: {
    fontSize: 18,
    color: C.gold,
    marginTop: 4,
  },
  heroScoreWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  heroScore: {
    fontSize: 48,
    fontWeight: '900',
    color: C.gold,
    lineHeight: 52,
  },
  heroScoreMax: {
    fontSize: 18,
    fontWeight: '600',
    color: C.dimmed,
    marginBottom: 8,
  },
  heroWeek: {
    fontSize: 17,
    fontWeight: '800',
    color: C.gold,
    marginBottom: 4,
  },
  heroGoal: {
    fontSize: 12,
    fontWeight: '500',
    color: C.dimmed,
    marginBottom: 18,
  },
  progressTrack: {
    height: 6,
    backgroundColor: C.border,
    borderRadius: 3,
    overflow: 'visible',
    position: 'relative',
    marginBottom: 20,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: C.gold,
    borderRadius: 3,
  },
  progressDot: {
    position: 'absolute',
    top: -4,
    marginLeft: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.gold,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.dimmed,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A1A22',
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotDone: {
    backgroundColor: C.gold,
    borderColor: C.gold,
  },
  dayDotToday: {
    borderColor: C.gold,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.dimmed,
    letterSpacing: 1.8,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 6,
  },
  statCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statChevron: {
    fontSize: 18,
    fontWeight: '300',
    color: C.dimmed,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.muted,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: C.white,
  },
  allTimeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  allTimeCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 6,
  },
  allTimeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.muted,
  },
  allTimeValue: {
    fontSize: 18,
    fontWeight: '800',
    color: C.white,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  workoutRowAbandoned: {
    borderColor: 'rgba(255,184,0,0.25)',
  },
  workoutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
    marginBottom: 2,
  },
  workoutMeta: {
    fontSize: 12,
    fontWeight: '500',
    color: C.dimmed,
  },
  workoutStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
