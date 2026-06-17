import { WorkoutRecord, calculateStreak } from '../context/WorkoutContext';

// ── Achievement definitions ───────────────────────────────────────────────────

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  color: string;
  check: (history: WorkoutRecord[]) => boolean;
}

const c = (h: WorkoutRecord[]) => h.filter(r => r.completed);

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your very first workout',
    iconKey: 'star',
    color: '#FFB800',
    check: h => c(h).length >= 1,
  },
  {
    id: 'triple_threat',
    title: 'Triple Threat',
    description: 'Complete 3 workouts',
    iconKey: 'flame',
    color: '#FF6B35',
    check: h => c(h).length >= 3,
  },
  {
    id: 'high_five',
    title: 'High Five',
    description: 'Complete 5 workouts',
    iconKey: 'lightning',
    color: '#60A5FA',
    check: h => c(h).length >= 5,
  },
  {
    id: 'ten_strong',
    title: 'Ten Strong',
    description: 'Complete 10 workouts',
    iconKey: 'dumbbell',
    color: '#34D399',
    check: h => c(h).length >= 10,
  },
  {
    id: 'quarter_century',
    title: 'Quarter Century',
    description: 'Complete 25 workouts',
    iconKey: 'trophy',
    color: '#A78BFA',
    check: h => c(h).length >= 25,
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Complete 100 workouts',
    iconKey: 'crown',
    color: '#FFB800',
    check: h => c(h).length >= 100,
  },
  {
    id: 'three_peat',
    title: 'Three-Peat',
    description: '3-day workout streak',
    iconKey: 'chain',
    color: '#F472B6',
    check: h => calculateStreak(h) >= 3,
  },
  {
    id: 'weekly_warrior',
    title: 'Weekly Warrior',
    description: '7-day workout streak',
    iconKey: 'shield',
    color: '#EF4444',
    check: h => calculateStreak(h) >= 7,
  },
  {
    id: 'fortnight',
    title: 'Fortnight',
    description: '14-day workout streak',
    iconKey: 'gem',
    color: '#06B6D4',
    check: h => calculateStreak(h) >= 14,
  },
  {
    id: 'leg_day',
    title: 'Leg Day Legend',
    description: 'Complete a legs workout',
    iconKey: 'sneaker',
    color: '#F97316',
    check: h =>
      c(h).some(r =>
        r.musclesWorked.some(m =>
          ['quads', 'hamstrings', 'glutes', 'calves'].includes(m),
        ),
      ),
  },
  {
    id: 'core_crusher',
    title: 'Core Crusher',
    description: 'Complete a core workout',
    iconKey: 'target',
    color: '#60A5FA',
    check: h =>
      c(h).some(r =>
        r.musclesWorked.some(m => ['core', 'obliques'].includes(m)),
      ),
  },
  {
    id: 'cardio_king',
    title: 'Cardio King',
    description: 'Complete a cardio/HIIT workout',
    iconKey: 'heartbeat',
    color: '#EF4444',
    check: h =>
      c(h).some(
        r =>
          r.musclesWorked.includes('fullBody') ||
          r.title.toLowerCase().includes('hiit') ||
          r.title.toLowerCase().includes('cardio') ||
          r.title.toLowerCase().includes('sweat'),
      ),
  },
  {
    id: 'iron_bench',
    title: 'Iron Bench',
    description: 'Complete an upper body workout',
    iconKey: 'barbell',
    color: '#A78BFA',
    check: h =>
      c(h).some(r =>
        r.musclesWorked.some(m =>
          ['chest', 'upperBack', 'shoulders', 'biceps', 'triceps'].includes(m),
        ),
      ),
  },
  {
    id: 'heavy_lifter',
    title: 'Heavy Lifter',
    description: 'Lift 10,000 lbs total volume',
    iconKey: 'mountain',
    color: '#FFB800',
    check: h => c(h).reduce((s, r) => s + r.totalVolume, 0) >= 10000,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Workout before 8am',
    iconKey: 'sun',
    color: '#FACC15',
    check: h => c(h).some(r => new Date(r.date).getHours() < 8),
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Workout after 9pm',
    iconKey: 'moon',
    color: '#818CF8',
    check: h => c(h).some(r => new Date(r.date).getHours() >= 21),
  },
];

export function computeNewAchievements(
  history: WorkoutRecord[],
  alreadyEarned: string[],
): AchievementDef[] {
  const earned = new Set(alreadyEarned);
  return ACHIEVEMENTS.filter(a => !earned.has(a.id) && a.check(history));
}

// ── Rank definitions ─────────────────────────────────────────────────────────

export interface RankDef {
  name: string;
  minWorkouts: number;
  color: string;
  iconKey: string;
}

export const RANKS: RankDef[] = [
  { name: 'Rookie',      minWorkouts: 0,   color: '#9CA3AF', iconKey: 'rank_rookie'      },
  { name: 'Challenger',  minWorkouts: 5,   color: '#60A5FA', iconKey: 'rank_challenger'  },
  { name: 'Dominant',    minWorkouts: 10,  color: '#34D399', iconKey: 'rank_dominant'    },
  { name: 'Disciplined', minWorkouts: 20,  color: '#A78BFA', iconKey: 'rank_disciplined' },
  { name: 'Elite',       minWorkouts: 35,  color: '#F59E0B', iconKey: 'rank_elite'       },
  { name: 'Master',      minWorkouts: 50,  color: '#F97316', iconKey: 'rank_master'      },
  { name: 'Apex',        minWorkouts: 75,  color: '#EF4444', iconKey: 'rank_apex'        },
  { name: 'Luminary',    minWorkouts: 100, color: '#FFB800', iconKey: 'rank_luminary'    },
];

export function getCurrentRank(completedCount: number): {
  rank: RankDef;
  next: RankDef | null;
  progress: number;
} {
  let rankIdx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (completedCount >= RANKS[i].minWorkouts) rankIdx = i;
  }
  const rank = RANKS[rankIdx];
  const next = rankIdx < RANKS.length - 1 ? RANKS[rankIdx + 1] : null;
  let progress = 1;
  if (next) {
    const span = next.minWorkouts - rank.minWorkouts;
    const done = completedCount - rank.minWorkouts;
    progress = Math.min(done / span, 1);
  }
  return { rank, next, progress };
}
