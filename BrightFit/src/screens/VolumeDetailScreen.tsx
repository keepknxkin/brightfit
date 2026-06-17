import React, { useMemo } from 'react';
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
import { useWorkout, weeklyVolume, type WorkoutRecord } from '../context/WorkoutContext';

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

function getThisWeekWorkouts(history: WorkoutRecord[]): WorkoutRecord[] {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return history.filter((r) => new Date(r.date) >= weekStart);
}

interface Props {
  onBack: () => void;
}

export default function VolumeDetailScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { history } = useWorkout();

  const volThisWeek = weeklyVolume(history);
  const allTimeVolume = history.reduce((sum, r) => sum + r.totalVolume, 0);
  const thisWeekWorkouts = useMemo(() => getThisWeekWorkouts(history), [history]);
  const avgPerWorkout =
    thisWeekWorkouts.length > 0
      ? Math.round(volThisWeek / thisWeekWorkouts.length)
      : 0;

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
          <Text style={styles.headerTitle}>Volume</Text>
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
          <Text style={styles.heroLabel}>THIS WEEK</Text>
          <Text style={styles.heroValue}>
            {volThisWeek > 0 ? `${volThisWeek.toLocaleString()} lbs` : '0 lbs'}
          </Text>
          <Text style={styles.heroHint}>
            {thisWeekWorkouts.length > 0
              ? `Across ${thisWeekWorkouts.length} workout${thisWeekWorkouts.length !== 1 ? 's' : ''}`
              : 'Complete a workout to start tracking volume'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg / Workout</Text>
            <Text style={styles.statValue}>
              {avgPerWorkout > 0 ? `${avgPerWorkout.toLocaleString()} lbs` : '—'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>All Time</Text>
            <Text style={styles.statValue}>
              {allTimeVolume > 0 ? `${allTimeVolume.toLocaleString()} lbs` : '0 lbs'}
            </Text>
          </View>
        </View>

        {thisWeekWorkouts.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>WORKOUTS THIS WEEK</Text>
            {thisWeekWorkouts.map((record) => {
              const d = new Date(record.date);
              const dateStr = d.toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              });
              const setsTotal = record.exercises.reduce((n, ex) => n + ex.sets.length, 0);

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
                    <Text style={styles.workoutMeta}>
                      {dateStr} · {setsTotal} set{setsTotal !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Text style={styles.workoutVolume}>
                    {record.totalVolume > 0
                      ? `${record.totalVolume.toLocaleString()} lbs`
                      : '—'}
                  </Text>
                </View>
              );
            })}
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No volume logged yet</Text>
            <Text style={styles.emptyBody}>
              Your weekly volume will appear here after you finish a workout.
            </Text>
          </View>
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
    marginBottom: 14,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.dimmed,
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 40,
    fontWeight: '900',
    color: C.gold,
    lineHeight: 44,
    marginBottom: 6,
  },
  heroHint: {
    fontSize: 13,
    fontWeight: '500',
    color: C.muted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 6,
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
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.dimmed,
    letterSpacing: 1.8,
    marginBottom: 12,
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
  workoutVolume: {
    fontSize: 15,
    fontWeight: '800',
    color: C.gold,
  },
  emptyCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },
  emptyBody: {
    fontSize: 13,
    fontWeight: '500',
    color: C.muted,
    lineHeight: 19,
  },
});
