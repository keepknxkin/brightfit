// ─────────────────────────────────────────────────────────────
// 150+ universal well-known exercises with muscle + equipment
// taxonomy. Used by the AddExerciseScreen picker so that
// filtering by equipment or muscle returns properly correlated
// results.
//
// Schema mirrors `SessionExercise` (see WorkoutSessionScreen.tsx)
// so picked items can be dropped straight into the workout flow.
// ─────────────────────────────────────────────────────────────

export type EquipmentId =
  | 'none'
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'machine'
  | 'cable'
  | 'plate'
  | 'band'
  | 'suspension'
  | 'bench'
  | 'pullupBar'
  | 'other';

export interface EquipmentOption {
  id: EquipmentId;
  label: string;
}

export const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  { id: 'none',        label: 'None'              },
  { id: 'barbell',     label: 'Barbell'           },
  { id: 'dumbbell',    label: 'Dumbbell'          },
  { id: 'kettlebell',  label: 'Kettlebell'        },
  { id: 'machine',     label: 'Machine'           },
  { id: 'cable',       label: 'Cable'             },
  { id: 'plate',       label: 'Plate'             },
  { id: 'band',        label: 'Resistance Band'   },
  { id: 'suspension',  label: 'Suspension Band'   },
  { id: 'bench',       label: 'Bench'             },
  { id: 'pullupBar',   label: 'Pull-Up Bar'       },
  { id: 'other',       label: 'Other'             },
];

export type MuscleId =
  | 'abs'
  | 'obliques'
  | 'abductors'
  | 'adductors'
  | 'biceps'
  | 'calves'
  | 'cardio'
  | 'chest'
  | 'forearms'
  | 'fullBody'
  | 'glutes'
  | 'hamstrings'
  | 'lats'
  | 'lowerBack'
  | 'neck'
  | 'quads'
  | 'shoulders'
  | 'traps'
  | 'triceps'
  | 'upperBack';

export interface MuscleOption {
  id: MuscleId;
  label: string;
}

export const MUSCLE_OPTIONS: MuscleOption[] = [
  { id: 'abs',        label: 'Abdominals'   },
  { id: 'obliques',   label: 'Obliques'     },
  { id: 'abductors',  label: 'Abductors'    },
  { id: 'adductors',  label: 'Adductors'    },
  { id: 'biceps',     label: 'Biceps'       },
  { id: 'calves',     label: 'Calves'       },
  { id: 'cardio',     label: 'Cardio'       },
  { id: 'chest',      label: 'Chest'        },
  { id: 'forearms',   label: 'Forearms'     },
  { id: 'fullBody',   label: 'Full Body'    },
  { id: 'glutes',     label: 'Glutes'       },
  { id: 'hamstrings', label: 'Hamstrings'   },
  { id: 'lats',       label: 'Lats'         },
  { id: 'lowerBack',  label: 'Lower Back'   },
  { id: 'neck',       label: 'Neck'         },
  { id: 'quads',      label: 'Quadriceps'   },
  { id: 'shoulders',  label: 'Shoulders'    },
  { id: 'traps',      label: 'Traps'        },
  { id: 'triceps',    label: 'Triceps'      },
  { id: 'upperBack',  label: 'Upper Back'   },
];

// Map our picker muscle IDs → internal muscle IDs used by
// WorkoutSessionScreen + WorkoutContext (these drive the
// body-highlight diagram in ProgressScreen).
const MUSCLE_TO_INTERNAL: Record<MuscleId, string[]> = {
  abs:        ['core'],
  obliques:   ['obliques'],
  abductors:  ['glutes'],
  adductors:  ['hipFlexors'],
  biceps:     ['biceps'],
  calves:     ['calves'],
  cardio:     ['fullBody'],
  chest:      ['chest'],
  forearms:   ['forearms'],
  fullBody:   ['fullBody'],
  glutes:     ['glutes'],
  hamstrings: ['hamstrings'],
  lats:       ['upperBack'],
  lowerBack:  ['lowerBack'],
  neck:       ['upperBack'],
  quads:      ['quads'],
  shoulders:  ['shoulders'],
  traps:      ['upperBack'],
  triceps:    ['triceps'],
  upperBack:  ['upperBack'],
};

// Map picker equipment → equipment strings used by WorkoutSession's
// defaultWeight() helper. Mostly cosmetic but Barbell/Dumbbells/
// Kettlebell drive sensible starting weights.
const EQUIPMENT_TO_INTERNAL: Record<EquipmentId, string[]> = {
  none:        [],
  barbell:     ['Barbell'],
  dumbbell:    ['Dumbbells'],
  kettlebell:  ['Kettlebell'],
  machine:     ['Machine'],
  cable:       ['Cable Machine'],
  plate:       ['Weight Plates'],
  band:        ['Resistance Band'],
  suspension:  ['TRX / Suspension Trainer'],
  bench:       ['Flat Bench'],
  pullupBar:   ['Pull-up Bar'],
  other:       [],
};

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: MuscleId;
  secondaryMuscles: MuscleId[];
  equipment: EquipmentId;
  emoji: string;
  defaultSets: number;
  defaultReps: string;
  suggestedWeight?: number;
}

// ─────────────────────────────────────────────────────────────
// 150+ exercises.
// Naming convention: "<Movement> (<Equipment>)" when an
// equipment-free variant also exists, so each row reads cleanly
// in the picker.
// ─────────────────────────────────────────────────────────────
export const EXERCISES: Exercise[] = [
  // ── Chest ──────────────────────────────────────────────────
  { id: 'bench-press-bb',         name: 'Bench Press (Barbell)',          primaryMuscle: 'chest',     secondaryMuscles: ['triceps', 'shoulders'], equipment: 'barbell',    emoji: '🏋️', defaultSets: 4, defaultReps: '8',  suggestedWeight: 95 },
  { id: 'bench-press-db',         name: 'Bench Press (Dumbbell)',         primaryMuscle: 'chest',     secondaryMuscles: ['triceps', 'shoulders'], equipment: 'dumbbell',   emoji: '💪', defaultSets: 4, defaultReps: '10', suggestedWeight: 35 },
  { id: 'incline-bench-bb',       name: 'Incline Bench Press (Barbell)',  primaryMuscle: 'chest',     secondaryMuscles: ['shoulders', 'triceps'], equipment: 'barbell',    emoji: '🏋️', defaultSets: 3, defaultReps: '10', suggestedWeight: 75 },
  { id: 'incline-bench-db',       name: 'Incline Bench Press (Dumbbell)', primaryMuscle: 'chest',     secondaryMuscles: ['shoulders'],            equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '10', suggestedWeight: 30 },
  { id: 'decline-bench-bb',       name: 'Decline Bench Press (Barbell)',  primaryMuscle: 'chest',     secondaryMuscles: ['triceps'],              equipment: 'barbell',    emoji: '🏋️', defaultSets: 3, defaultReps: '10', suggestedWeight: 85 },
  { id: 'db-fly',                 name: 'Dumbbell Fly',                   primaryMuscle: 'chest',     secondaryMuscles: ['shoulders'],            equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 20 },
  { id: 'incline-db-fly',         name: 'Incline Dumbbell Fly',           primaryMuscle: 'chest',     secondaryMuscles: ['shoulders'],            equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 18 },
  { id: 'cable-fly',              name: 'Cable Chest Fly',                primaryMuscle: 'chest',     secondaryMuscles: [],                       equipment: 'cable',      emoji: '🤸', defaultSets: 3, defaultReps: '12', suggestedWeight: 30 },
  { id: 'cable-crossover',        name: 'Cable Crossover',                primaryMuscle: 'chest',     secondaryMuscles: ['shoulders'],            equipment: 'cable',      emoji: '🤸', defaultSets: 3, defaultReps: '12', suggestedWeight: 25 },
  { id: 'pec-deck',               name: 'Pec Deck Fly (Machine)',         primaryMuscle: 'chest',     secondaryMuscles: [],                       equipment: 'machine',    emoji: '💪', defaultSets: 3, defaultReps: '15', suggestedWeight: 80 },
  { id: 'chest-press-machine',    name: 'Chest Press (Machine)',          primaryMuscle: 'chest',     secondaryMuscles: ['triceps'],              equipment: 'machine',    emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 90 },
  { id: 'pushup',                 name: 'Push-Up',                        primaryMuscle: 'chest',     secondaryMuscles: ['triceps', 'shoulders'], equipment: 'none',       emoji: '💪', defaultSets: 3, defaultReps: '15' },
  { id: 'wide-pushup',            name: 'Wide-Grip Push-Up',              primaryMuscle: 'chest',     secondaryMuscles: ['triceps'],              equipment: 'none',       emoji: '💪', defaultSets: 3, defaultReps: '12' },
  { id: 'diamond-pushup',         name: 'Diamond Push-Up',                primaryMuscle: 'triceps',   secondaryMuscles: ['chest'],                equipment: 'none',       emoji: '💪', defaultSets: 3, defaultReps: '12' },
  { id: 'decline-pushup',         name: 'Decline Push-Up',                primaryMuscle: 'chest',     secondaryMuscles: ['shoulders'],            equipment: 'none',       emoji: '💪', defaultSets: 3, defaultReps: '12' },
  { id: 'chest-dip',              name: 'Chest Dip',                      primaryMuscle: 'chest',     secondaryMuscles: ['triceps'],              equipment: 'other',      emoji: '🤸', defaultSets: 3, defaultReps: '10' },
  { id: 'svend-press',            name: 'Svend Press (Plate)',            primaryMuscle: 'chest',     secondaryMuscles: ['shoulders'],            equipment: 'plate',      emoji: '🏋️', defaultSets: 3, defaultReps: '12', suggestedWeight: 25 },
  { id: 'floor-press-db',         name: 'Floor Press (Dumbbell)',         primaryMuscle: 'chest',     secondaryMuscles: ['triceps'],              equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 30 },
  { id: 'band-chest-fly',         name: 'Resistance Band Chest Fly',      primaryMuscle: 'chest',     secondaryMuscles: ['shoulders'],            equipment: 'band',       emoji: '💪', defaultSets: 3, defaultReps: '15' },
  { id: 'trx-chest-press',        name: 'Suspension Chest Press',         primaryMuscle: 'chest',     secondaryMuscles: ['triceps'],              equipment: 'suspension', emoji: '🤸', defaultSets: 3, defaultReps: '12' },

  // ── Upper Back / Lats ──────────────────────────────────────
  { id: 'pull-up',                name: 'Pull-Up',                        primaryMuscle: 'lats',      secondaryMuscles: ['biceps', 'upperBack'],   equipment: 'pullupBar',  emoji: '🤸', defaultSets: 4, defaultReps: '8'  },
  { id: 'chin-up',                name: 'Chin-Up',                        primaryMuscle: 'lats',      secondaryMuscles: ['biceps'],                equipment: 'pullupBar',  emoji: '🤸', defaultSets: 4, defaultReps: '8'  },
  { id: 'wide-pullup',            name: 'Wide-Grip Pull-Up',              primaryMuscle: 'lats',      secondaryMuscles: ['upperBack'],             equipment: 'pullupBar',  emoji: '🤸', defaultSets: 3, defaultReps: '6'  },
  { id: 'lat-pulldown',           name: 'Lat Pulldown (Machine)',         primaryMuscle: 'lats',      secondaryMuscles: ['biceps'],                equipment: 'machine',    emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 80 },
  { id: 'wide-lat-pulldown',      name: 'Wide-Grip Lat Pulldown',         primaryMuscle: 'lats',      secondaryMuscles: ['upperBack'],             equipment: 'machine',    emoji: '💪', defaultSets: 3, defaultReps: '10', suggestedWeight: 75 },
  { id: 'close-lat-pulldown',     name: 'Close-Grip Lat Pulldown',        primaryMuscle: 'lats',      secondaryMuscles: ['biceps'],                equipment: 'machine',    emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 70 },
  { id: 'seated-cable-row',       name: 'Seated Cable Row',               primaryMuscle: 'upperBack', secondaryMuscles: ['lats', 'biceps'],        equipment: 'cable',      emoji: '🤸', defaultSets: 3, defaultReps: '12', suggestedWeight: 70 },
  { id: 'bent-row-bb',            name: 'Bent-Over Row (Barbell)',        primaryMuscle: 'upperBack', secondaryMuscles: ['lats', 'biceps'],        equipment: 'barbell',    emoji: '🏋️', defaultSets: 4, defaultReps: '8',  suggestedWeight: 95 },
  { id: 'bent-row-db',            name: 'Bent-Over Row (Dumbbell)',       primaryMuscle: 'upperBack', secondaryMuscles: ['lats', 'biceps'],        equipment: 'dumbbell',   emoji: '🏋️', defaultSets: 4, defaultReps: '10', suggestedWeight: 30 },
  { id: 'one-arm-row',            name: 'One-Arm Dumbbell Row',           primaryMuscle: 'lats',      secondaryMuscles: ['upperBack', 'biceps'],   equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '10', suggestedWeight: 35 },
  { id: 't-bar-row',              name: 'T-Bar Row',                      primaryMuscle: 'upperBack', secondaryMuscles: ['lats', 'lowerBack'],     equipment: 'barbell',    emoji: '🏋️', defaultSets: 3, defaultReps: '10', suggestedWeight: 90 },
  { id: 'pendlay-row',            name: 'Pendlay Row',                    primaryMuscle: 'upperBack', secondaryMuscles: ['lats'],                  equipment: 'barbell',    emoji: '🏋️', defaultSets: 4, defaultReps: '6',  suggestedWeight: 115 },
  { id: 'inverted-row',           name: 'Inverted Row (Suspension)',      primaryMuscle: 'upperBack', secondaryMuscles: ['biceps'],                equipment: 'suspension', emoji: '🤸', defaultSets: 3, defaultReps: '12' },
  { id: 'renegade-row',           name: 'Renegade Row',                   primaryMuscle: 'upperBack', secondaryMuscles: ['abs', 'biceps'],         equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '10', suggestedWeight: 25 },
  { id: 'face-pull',              name: 'Face Pull (Cable)',              primaryMuscle: 'shoulders', secondaryMuscles: ['upperBack', 'traps'],    equipment: 'cable',      emoji: '🤸', defaultSets: 3, defaultReps: '15', suggestedWeight: 30 },
  { id: 'band-row',               name: 'Resistance Band Row',            primaryMuscle: 'upperBack', secondaryMuscles: ['biceps'],                equipment: 'band',       emoji: '💪', defaultSets: 3, defaultReps: '15' },
  { id: 'straight-arm-pulldown',  name: 'Straight-Arm Pulldown',          primaryMuscle: 'lats',      secondaryMuscles: [],                        equipment: 'cable',      emoji: '🤸', defaultSets: 3, defaultReps: '12', suggestedWeight: 40 },
  { id: 'meadows-row',            name: 'Meadows Row',                    primaryMuscle: 'lats',      secondaryMuscles: ['upperBack'],             equipment: 'barbell',    emoji: '🏋️', defaultSets: 3, defaultReps: '10', suggestedWeight: 50 },
  { id: 'kb-bent-row',            name: 'Kettlebell Bent-Over Row',       primaryMuscle: 'upperBack', secondaryMuscles: ['lats', 'biceps'],        equipment: 'kettlebell', emoji: '🏋️', defaultSets: 3, defaultReps: '12', suggestedWeight: 35 },

  // ── Lower Back ─────────────────────────────────────────────
  { id: 'deadlift-bb',            name: 'Deadlift (Barbell)',             primaryMuscle: 'lowerBack', secondaryMuscles: ['hamstrings', 'glutes', 'upperBack'], equipment: 'barbell', emoji: '🏋️', defaultSets: 4, defaultReps: '5', suggestedWeight: 135 },
  { id: 'rdl-bb',                 name: 'Romanian Deadlift (Barbell)',    primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes', 'lowerBack'],  equipment: 'barbell',    emoji: '🏋️', defaultSets: 3, defaultReps: '10', suggestedWeight: 95 },
  { id: 'rdl-db',                 name: 'Romanian Deadlift (Dumbbell)',   primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes', 'lowerBack'],  equipment: 'dumbbell',   emoji: '🏋️', defaultSets: 3, defaultReps: '12', suggestedWeight: 35 },
  { id: 'good-morning',           name: 'Good Morning (Barbell)',         primaryMuscle: 'lowerBack', secondaryMuscles: ['hamstrings', 'glutes'],  equipment: 'barbell',    emoji: '🏋️', defaultSets: 3, defaultReps: '10', suggestedWeight: 65 },
  { id: 'back-extension',         name: 'Back Extension (Machine)',       primaryMuscle: 'lowerBack', secondaryMuscles: ['glutes'],                equipment: 'machine',    emoji: '🏃', defaultSets: 3, defaultReps: '15' },
  { id: 'hyperextension',         name: 'Hyperextension',                 primaryMuscle: 'lowerBack', secondaryMuscles: ['glutes', 'hamstrings'],  equipment: 'other',      emoji: '🏃', defaultSets: 3, defaultReps: '12' },
  { id: 'superman',               name: 'Superman',                       primaryMuscle: 'lowerBack', secondaryMuscles: ['glutes'],                equipment: 'none',       emoji: '🦸', defaultSets: 3, defaultReps: '15' },
  { id: 'bird-dog',               name: 'Bird Dog',                       primaryMuscle: 'lowerBack', secondaryMuscles: ['abs', 'glutes'],         equipment: 'none',       emoji: '🐕', defaultSets: 3, defaultReps: '10' },

  // ── Traps ──────────────────────────────────────────────────
  { id: 'shrug-bb',               name: 'Barbell Shrug',                  primaryMuscle: 'traps',     secondaryMuscles: ['forearms'],              equipment: 'barbell',    emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 135 },
  { id: 'shrug-db',               name: 'Dumbbell Shrug',                 primaryMuscle: 'traps',     secondaryMuscles: ['forearms'],              equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '15', suggestedWeight: 50 },
  { id: 'trap-bar-shrug',         name: 'Trap Bar Shrug',                 primaryMuscle: 'traps',     secondaryMuscles: ['forearms'],              equipment: 'barbell',    emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 155 },
  { id: 'cable-shrug',            name: 'Cable Shrug',                    primaryMuscle: 'traps',     secondaryMuscles: [],                        equipment: 'cable',      emoji: '💪', defaultSets: 3, defaultReps: '15', suggestedWeight: 80 },
  { id: 'farmers-walk',           name: "Farmer's Walk",                  primaryMuscle: 'traps',     secondaryMuscles: ['forearms', 'fullBody'],  equipment: 'dumbbell',   emoji: '🚶', defaultSets: 3, defaultReps: '30s', suggestedWeight: 60 },

  // ── Shoulders ──────────────────────────────────────────────
  { id: 'ohp-bb',                 name: 'Overhead Press (Barbell)',       primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'],               equipment: 'barbell',    emoji: '🏋️', defaultSets: 4, defaultReps: '8',  suggestedWeight: 65 },
  { id: 'military-press',         name: 'Military Press (Barbell)',       primaryMuscle: 'shoulders', secondaryMuscles: ['triceps', 'abs'],        equipment: 'barbell',    emoji: '🪖', defaultSets: 3, defaultReps: '8',  suggestedWeight: 65 },
  { id: 'push-press',             name: 'Push Press (Barbell)',           primaryMuscle: 'shoulders', secondaryMuscles: ['triceps', 'quads'],      equipment: 'barbell',    emoji: '🏋️', defaultSets: 3, defaultReps: '6',  suggestedWeight: 85 },
  { id: 'seated-ohp-bb',          name: 'Seated Overhead Press (Barbell)',primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'],               equipment: 'barbell',    emoji: '🏋️', defaultSets: 3, defaultReps: '10', suggestedWeight: 60 },
  { id: 'db-shoulder-press',      name: 'Dumbbell Shoulder Press',        primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'],               equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '10', suggestedWeight: 30 },
  { id: 'arnold-press',           name: 'Arnold Press',                   primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'],               equipment: 'dumbbell',   emoji: '🤸', defaultSets: 3, defaultReps: '12', suggestedWeight: 25 },
  { id: 'seated-db-press',        name: 'Seated Dumbbell Press',          primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'],               equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '10', suggestedWeight: 30 },
  { id: 'lateral-raise',          name: 'Lateral Raise (Dumbbell)',       primaryMuscle: 'shoulders', secondaryMuscles: [],                        equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '15', suggestedWeight: 15 },
  { id: 'front-raise',            name: 'Front Raise (Dumbbell)',         primaryMuscle: 'shoulders', secondaryMuscles: [],                        equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 15 },
  { id: 'rear-delt-fly',          name: 'Rear Delt Fly (Dumbbell)',       primaryMuscle: 'shoulders', secondaryMuscles: ['upperBack'],             equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '15', suggestedWeight: 12 },
  { id: 'reverse-pec-deck',       name: 'Reverse Pec Deck (Machine)',     primaryMuscle: 'shoulders', secondaryMuscles: ['upperBack'],             equipment: 'machine',    emoji: '💪', defaultSets: 3, defaultReps: '15', suggestedWeight: 50 },
  { id: 'cable-lateral-raise',    name: 'Cable Lateral Raise',            primaryMuscle: 'shoulders', secondaryMuscles: [],                        equipment: 'cable',      emoji: '🤸', defaultSets: 3, defaultReps: '15', suggestedWeight: 15 },
  { id: 'upright-row-bb',         name: 'Upright Row (Barbell)',          primaryMuscle: 'shoulders', secondaryMuscles: ['traps', 'biceps'],       equipment: 'barbell',    emoji: '🏋️', defaultSets: 3, defaultReps: '12', suggestedWeight: 65 },
  { id: 'pike-pushup',            name: 'Pike Push-Up',                   primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'],               equipment: 'none',       emoji: '🤸', defaultSets: 3, defaultReps: '10' },
  { id: 'handstand-pushup',       name: 'Handstand Push-Up',              primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'],               equipment: 'none',       emoji: '🤸', defaultSets: 3, defaultReps: '6'  },
  { id: 'plate-front-raise',      name: 'Plate Front Raise',              primaryMuscle: 'shoulders', secondaryMuscles: [],                        equipment: 'plate',      emoji: '🏋️', defaultSets: 3, defaultReps: '15', suggestedWeight: 25 },
  { id: 'band-pull-apart',        name: 'Band Pull-Apart',                primaryMuscle: 'shoulders', secondaryMuscles: ['upperBack'],             equipment: 'band',       emoji: '💪', defaultSets: 3, defaultReps: '20' },
  { id: 'kb-overhead-press',      name: 'Kettlebell Overhead Press',      primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'],               equipment: 'kettlebell', emoji: '🏋️', defaultSets: 3, defaultReps: '8',  suggestedWeight: 35 },

  // ── Biceps ─────────────────────────────────────────────────
  { id: 'barbell-curl',           name: 'Barbell Curl',                   primaryMuscle: 'biceps',    secondaryMuscles: ['forearms'],              equipment: 'barbell',    emoji: '💪', defaultSets: 3, defaultReps: '10', suggestedWeight: 55 },
  { id: 'ez-bar-curl',            name: 'EZ-Bar Curl',                    primaryMuscle: 'biceps',    secondaryMuscles: ['forearms'],              equipment: 'barbell',    emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 45 },
  { id: 'preacher-curl',          name: 'Preacher Curl (EZ Bar)',         primaryMuscle: 'biceps',    secondaryMuscles: [],                        equipment: 'barbell',    emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 40 },
  { id: 'db-curl',                name: 'Dumbbell Curl',                  primaryMuscle: 'biceps',    secondaryMuscles: ['forearms'],              equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 25 },
  { id: 'alt-db-curl',            name: 'Alternating Dumbbell Curl',      primaryMuscle: 'biceps',    secondaryMuscles: [],                        equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 25 },
  { id: 'hammer-curl',            name: 'Hammer Curl',                    primaryMuscle: 'biceps',    secondaryMuscles: ['forearms'],              equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 22 },
  { id: 'incline-db-curl',        name: 'Incline Dumbbell Curl',          primaryMuscle: 'biceps',    secondaryMuscles: [],                        equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 20 },
  { id: 'concentration-curl',     name: 'Concentration Curl',             primaryMuscle: 'biceps',    secondaryMuscles: [],                        equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 20 },
  { id: 'cable-curl',             name: 'Cable Curl',                     primaryMuscle: 'biceps',    secondaryMuscles: [],                        equipment: 'cable',      emoji: '🤸', defaultSets: 3, defaultReps: '15', suggestedWeight: 40 },
  { id: 'cable-hammer-curl',      name: 'Cable Hammer Curl (Rope)',       primaryMuscle: 'biceps',    secondaryMuscles: ['forearms'],              equipment: 'cable',      emoji: '🤸', defaultSets: 3, defaultReps: '12', suggestedWeight: 35 },
  { id: 'spider-curl',            name: 'Spider Curl',                    primaryMuscle: 'biceps',    secondaryMuscles: [],                        equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 20 },
  { id: 'reverse-curl',           name: 'Reverse Curl',                   primaryMuscle: 'forearms',  secondaryMuscles: ['biceps'],                equipment: 'barbell',    emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 35 },
  { id: 'band-curl',              name: 'Band Curl',                      primaryMuscle: 'biceps',    secondaryMuscles: [],                        equipment: 'band',       emoji: '💪', defaultSets: 3, defaultReps: '15' },

  // ── Triceps ────────────────────────────────────────────────
  { id: 'close-grip-bench',       name: 'Close-Grip Bench Press',         primaryMuscle: 'triceps',   secondaryMuscles: ['chest'],                 equipment: 'barbell',    emoji: '🏋️', defaultSets: 3, defaultReps: '8',  suggestedWeight: 85 },
  { id: 'skull-crusher-ez',       name: 'Skull Crusher (EZ Bar)',         primaryMuscle: 'triceps',   secondaryMuscles: [],                        equipment: 'barbell',    emoji: '💀', defaultSets: 3, defaultReps: '12', suggestedWeight: 40 },
  { id: 'skull-crusher-db',       name: 'Skull Crusher (Dumbbell)',       primaryMuscle: 'triceps',   secondaryMuscles: [],                        equipment: 'dumbbell',   emoji: '💀', defaultSets: 3, defaultReps: '12', suggestedWeight: 18 },
  { id: 'overhead-tri-db',        name: 'Overhead Tricep Extension (DB)', primaryMuscle: 'triceps',   secondaryMuscles: [],                        equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '12', suggestedWeight: 30 },
  { id: 'overhead-tri-cable',     name: 'Overhead Tricep Extension (Cable)', primaryMuscle: 'triceps',secondaryMuscles: [],                        equipment: 'cable',      emoji: '🤸', defaultSets: 3, defaultReps: '15', suggestedWeight: 35 },
  { id: 'tricep-pushdown',        name: 'Tricep Pushdown (Cable)',        primaryMuscle: 'triceps',   secondaryMuscles: [],                        equipment: 'cable',      emoji: '🤸', defaultSets: 3, defaultReps: '12', suggestedWeight: 45 },
  { id: 'tricep-rope-pushdown',   name: 'Tricep Rope Pushdown',           primaryMuscle: 'triceps',   secondaryMuscles: [],                        equipment: 'cable',      emoji: '🤸', defaultSets: 3, defaultReps: '15', suggestedWeight: 40 },
  { id: 'bench-dip',              name: 'Bench Dip',                      primaryMuscle: 'triceps',   secondaryMuscles: ['chest'],                 equipment: 'bench',      emoji: '🤸', defaultSets: 3, defaultReps: '15' },
  { id: 'parallel-dip',           name: 'Parallel Bar Dip',               primaryMuscle: 'triceps',   secondaryMuscles: ['chest'],                 equipment: 'other',      emoji: '🤸', defaultSets: 3, defaultReps: '10' },
  { id: 'tricep-kickback',        name: 'Tricep Kickback (Dumbbell)',     primaryMuscle: 'triceps',   secondaryMuscles: [],                        equipment: 'dumbbell',   emoji: '💪', defaultSets: 3, defaultReps: '15', suggestedWeight: 15 },
  { id: 'band-tri-pushdown',      name: 'Band Tricep Pushdown',           primaryMuscle: 'triceps',   secondaryMuscles: [],                        equipment: 'band',       emoji: '💪', defaultSets: 3, defaultReps: '15' },

  // ── Forearms ───────────────────────────────────────────────
  { id: 'wrist-curl-bb',          name: 'Wrist Curl (Barbell)',           primaryMuscle: 'forearms',  secondaryMuscles: [],                        equipment: 'barbell',    emoji: '✊', defaultSets: 3, defaultReps: '15', suggestedWeight: 30 },
  { id: 'wrist-curl-db',          name: 'Wrist Curl (Dumbbell)',          primaryMuscle: 'forearms',  secondaryMuscles: [],                        equipment: 'dumbbell',   emoji: '✊', defaultSets: 3, defaultReps: '15', suggestedWeight: 15 },
  { id: 'reverse-wrist-curl',     name: 'Reverse Wrist Curl',             primaryMuscle: 'forearms',  secondaryMuscles: [],                        equipment: 'dumbbell',   emoji: '✊', defaultSets: 3, defaultReps: '15', suggestedWeight: 10 },
  { id: 'plate-pinch',            name: 'Plate Pinch',                    primaryMuscle: 'forearms',  secondaryMuscles: [],                        equipment: 'plate',      emoji: '🤏', defaultSets: 3, defaultReps: '30s', suggestedWeight: 25 },
  { id: 'dead-hang',              name: 'Dead Hang',                      primaryMuscle: 'forearms',  secondaryMuscles: ['lats'],                  equipment: 'pullupBar',  emoji: '🤸', defaultSets: 3, defaultReps: '45s' },

  // ── Abs / Core ─────────────────────────────────────────────
  { id: 'crunch',                 name: 'Crunch',                         primaryMuscle: 'abs',       secondaryMuscles: [],                        equipment: 'none',       emoji: '⚡', defaultSets: 3, defaultReps: '20' },
  { id: 'sit-up',                 name: 'Sit-Up',                         primaryMuscle: 'abs',       secondaryMuscles: ['adductors'],             equipment: 'none',       emoji: '⚡', defaultSets: 3, defaultReps: '15' },
  { id: 'bicycle-crunch',         name: 'Bicycle Crunch',                 primaryMuscle: 'abs',       secondaryMuscles: ['obliques'],              equipment: 'none',       emoji: '🌀', defaultSets: 3, defaultReps: '20' },
  { id: 'plank',                  name: 'Plank',                          primaryMuscle: 'abs',       secondaryMuscles: ['lowerBack'],             equipment: 'none',       emoji: '🧘', defaultSets: 3, defaultReps: '60s' },
  { id: 'side-plank',             name: 'Side Plank',                     primaryMuscle: 'obliques',  secondaryMuscles: ['abs'],                   equipment: 'none',       emoji: '🧘', defaultSets: 3, defaultReps: '45s' },
  { id: 'hanging-leg-raise',      name: 'Hanging Leg Raise',              primaryMuscle: 'abs',       secondaryMuscles: ['adductors'],             equipment: 'pullupBar',  emoji: '🤸', defaultSets: 3, defaultReps: '12' },
  { id: 'hanging-knee-raise',     name: 'Hanging Knee Raise',             primaryMuscle: 'abs',       secondaryMuscles: [],                        equipment: 'pullupBar',  emoji: '🤸', defaultSets: 3, defaultReps: '15' },
  { id: 'cable-crunch',           name: 'Cable Crunch',                   primaryMuscle: 'abs',       secondaryMuscles: [],                        equipment: 'cable',      emoji: '⚡', defaultSets: 3, defaultReps: '15', suggestedWeight: 60 },
  { id: 'russian-twist',          name: 'Russian Twist',                  primaryMuscle: 'obliques',  secondaryMuscles: ['abs'],                   equipment: 'plate',      emoji: '🌀', defaultSets: 3, defaultReps: '20', suggestedWeight: 10 },
  { id: 'ab-wheel-rollout',       name: 'Ab Wheel Rollout',               primaryMuscle: 'abs',       secondaryMuscles: ['lowerBack'],             equipment: 'other',      emoji: '⚡', defaultSets: 3, defaultReps: '10' },
  { id: 'toes-to-bar',            name: 'Toes-to-Bar',                    primaryMuscle: 'abs',       secondaryMuscles: ['lats'],                  equipment: 'pullupBar',  emoji: '🤸', defaultSets: 3, defaultReps: '8'  },
  { id: 'dead-bug',               name: 'Dead Bug',                       primaryMuscle: 'abs',       secondaryMuscles: ['lowerBack'],             equipment: 'none',       emoji: '🐛', defaultSets: 3, defaultReps: '12' },
  { id: 'hollow-hold',            name: 'Hollow Body Hold',               primaryMuscle: 'abs',       secondaryMuscles: [],                        equipment: 'none',       emoji: '🧘', defaultSets: 3, defaultReps: '30s' },
  { id: 'v-up',                   name: 'V-Up',                           primaryMuscle: 'abs',       secondaryMuscles: ['adductors'],             equipment: 'none',       emoji: '⚡', defaultSets: 3, defaultReps: '15' },
  { id: 'mountain-climber',       name: 'Mountain Climber',               primaryMuscle: 'abs',       secondaryMuscles: ['cardio'],                equipment: 'none',       emoji: '⛰️', defaultSets: 3, defaultReps: '30' },
  { id: 'flutter-kick',           name: 'Flutter Kick',                   primaryMuscle: 'abs',       secondaryMuscles: ['adductors'],             equipment: 'none',       emoji: '🦵', defaultSets: 3, defaultReps: '30' },
  { id: 'wood-chopper',           name: 'Wood Chopper (Cable)',           primaryMuscle: 'obliques',  secondaryMuscles: ['abs'],                   equipment: 'cable',      emoji: '🪓', defaultSets: 3, defaultReps: '12', suggestedWeight: 30 },

  // ── Quadriceps ─────────────────────────────────────────────
  { id: 'back-squat',             name: 'Back Squat (Barbell)',           primaryMuscle: 'quads',     secondaryMuscles: ['glutes', 'hamstrings'],  equipment: 'barbell',    emoji: '🦵', defaultSets: 4, defaultReps: '8',  suggestedWeight: 135 },
  { id: 'front-squat',            name: 'Front Squat (Barbell)',          primaryMuscle: 'quads',     secondaryMuscles: ['glutes', 'abs'],         equipment: 'barbell',    emoji: '🦵', defaultSets: 3, defaultReps: '6',  suggestedWeight: 95 },
  { id: 'goblet-squat-db',        name: 'Goblet Squat (Dumbbell)',        primaryMuscle: 'quads',     secondaryMuscles: ['glutes'],                equipment: 'dumbbell',   emoji: '🦵', defaultSets: 3, defaultReps: '12', suggestedWeight: 40 },
  { id: 'goblet-squat-kb',        name: 'Goblet Squat (Kettlebell)',      primaryMuscle: 'quads',     secondaryMuscles: ['glutes'],                equipment: 'kettlebell', emoji: '🦵', defaultSets: 3, defaultReps: '12', suggestedWeight: 35 },
  { id: 'bulgarian-split-squat',  name: 'Bulgarian Split Squat',          primaryMuscle: 'quads',     secondaryMuscles: ['glutes'],                equipment: 'dumbbell',   emoji: '🦵', defaultSets: 3, defaultReps: '10', suggestedWeight: 20 },
  { id: 'walking-lunge',          name: 'Walking Lunge (Dumbbell)',       primaryMuscle: 'quads',     secondaryMuscles: ['glutes'],                equipment: 'dumbbell',   emoji: '🚶', defaultSets: 3, defaultReps: '12', suggestedWeight: 25 },
  { id: 'reverse-lunge',          name: 'Reverse Lunge (Dumbbell)',       primaryMuscle: 'quads',     secondaryMuscles: ['glutes'],                equipment: 'dumbbell',   emoji: '🦵', defaultSets: 3, defaultReps: '10', suggestedWeight: 25 },
  { id: 'step-up',                name: 'Step-Up (Dumbbell)',             primaryMuscle: 'quads',     secondaryMuscles: ['glutes'],                equipment: 'dumbbell',   emoji: '🚶', defaultSets: 3, defaultReps: '10', suggestedWeight: 25 },
  { id: 'box-jump',               name: 'Box Jump',                       primaryMuscle: 'quads',     secondaryMuscles: ['glutes', 'calves'],      equipment: 'other',      emoji: '📦', defaultSets: 4, defaultReps: '8'  },
  { id: 'leg-press',              name: 'Leg Press (Machine)',            primaryMuscle: 'quads',     secondaryMuscles: ['glutes'],                equipment: 'machine',    emoji: '🦵', defaultSets: 4, defaultReps: '12', suggestedWeight: 180 },
  { id: 'hack-squat',             name: 'Hack Squat (Machine)',           primaryMuscle: 'quads',     secondaryMuscles: ['glutes'],                equipment: 'machine',    emoji: '🦵', defaultSets: 3, defaultReps: '12', suggestedWeight: 135 },
  { id: 'leg-extension',          name: 'Leg Extension (Machine)',        primaryMuscle: 'quads',     secondaryMuscles: [],                        equipment: 'machine',    emoji: '🦵', defaultSets: 3, defaultReps: '15', suggestedWeight: 70 },
  { id: 'sissy-squat',            name: 'Sissy Squat',                    primaryMuscle: 'quads',     secondaryMuscles: [],                        equipment: 'none',       emoji: '🦵', defaultSets: 3, defaultReps: '12' },
  { id: 'wall-sit',               name: 'Wall Sit',                       primaryMuscle: 'quads',     secondaryMuscles: ['glutes'],                equipment: 'none',       emoji: '🧱', defaultSets: 3, defaultReps: '60s' },
  { id: 'pistol-squat',           name: 'Pistol Squat',                   primaryMuscle: 'quads',     secondaryMuscles: ['glutes', 'abs'],         equipment: 'none',       emoji: '🦵', defaultSets: 3, defaultReps: '6'  },
  { id: 'jump-squat',             name: 'Jump Squat',                     primaryMuscle: 'quads',     secondaryMuscles: ['glutes', 'cardio'],      equipment: 'none',       emoji: '🦘', defaultSets: 3, defaultReps: '15' },

  // ── Hamstrings ─────────────────────────────────────────────
  { id: 'stiff-leg-deadlift',     name: 'Stiff-Leg Deadlift (Barbell)',   primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes', 'lowerBack'],  equipment: 'barbell',    emoji: '🏋️', defaultSets: 3, defaultReps: '10', suggestedWeight: 105 },
  { id: 'leg-curl',               name: 'Lying Leg Curl (Machine)',       primaryMuscle: 'hamstrings', secondaryMuscles: [],                       equipment: 'machine',    emoji: '🦵', defaultSets: 3, defaultReps: '12', suggestedWeight: 55 },
  { id: 'seated-leg-curl',        name: 'Seated Leg Curl (Machine)',      primaryMuscle: 'hamstrings', secondaryMuscles: [],                       equipment: 'machine',    emoji: '🦵', defaultSets: 3, defaultReps: '12', suggestedWeight: 60 },
  { id: 'nordic-curl',            name: 'Nordic Hamstring Curl',          primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes'],               equipment: 'none',       emoji: '🦵', defaultSets: 3, defaultReps: '8'  },
  { id: 'ghr',                    name: 'Glute-Ham Raise',                primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes'],               equipment: 'machine',    emoji: '🍑', defaultSets: 3, defaultReps: '10' },
  { id: 'kb-swing',               name: 'Kettlebell Swing',               primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes', 'fullBody'],   equipment: 'kettlebell', emoji: '🔥', defaultSets: 4, defaultReps: '15', suggestedWeight: 35 },
  { id: 'single-leg-rdl',         name: 'Single-Leg RDL (Dumbbell)',      primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes'],               equipment: 'dumbbell',   emoji: '🦵', defaultSets: 3, defaultReps: '10', suggestedWeight: 25 },

  // ── Glutes ─────────────────────────────────────────────────
  { id: 'hip-thrust-bb',          name: 'Hip Thrust (Barbell)',           primaryMuscle: 'glutes',    secondaryMuscles: ['hamstrings'],            equipment: 'barbell',    emoji: '🍑', defaultSets: 4, defaultReps: '10', suggestedWeight: 135 },
  { id: 'hip-thrust-db',          name: 'Hip Thrust (Dumbbell)',          primaryMuscle: 'glutes',    secondaryMuscles: ['hamstrings'],            equipment: 'dumbbell',   emoji: '🍑', defaultSets: 3, defaultReps: '12', suggestedWeight: 45 },
  { id: 'glute-bridge',           name: 'Glute Bridge',                   primaryMuscle: 'glutes',    secondaryMuscles: ['hamstrings'],            equipment: 'none',       emoji: '🍑', defaultSets: 3, defaultReps: '15' },
  { id: 'single-leg-bridge',      name: 'Single-Leg Glute Bridge',        primaryMuscle: 'glutes',    secondaryMuscles: ['hamstrings'],            equipment: 'none',       emoji: '🍑', defaultSets: 3, defaultReps: '12' },
  { id: 'cable-kickback',         name: 'Cable Glute Kickback',           primaryMuscle: 'glutes',    secondaryMuscles: ['hamstrings'],            equipment: 'cable',      emoji: '🍑', defaultSets: 3, defaultReps: '15', suggestedWeight: 25 },
  { id: 'sumo-deadlift',          name: 'Sumo Deadlift',                  primaryMuscle: 'glutes',    secondaryMuscles: ['hamstrings', 'adductors'], equipment: 'barbell',  emoji: '🏋️', defaultSets: 4, defaultReps: '6',  suggestedWeight: 145 },
  { id: 'sumo-squat',             name: 'Sumo Squat',                     primaryMuscle: 'glutes',    secondaryMuscles: ['adductors', 'quads'],    equipment: 'dumbbell',   emoji: '🦵', defaultSets: 3, defaultReps: '12', suggestedWeight: 40 },
  { id: 'frog-pump',              name: 'Frog Pump',                      primaryMuscle: 'glutes',    secondaryMuscles: [],                        equipment: 'none',       emoji: '🐸', defaultSets: 3, defaultReps: '20' },

  // ── Calves ─────────────────────────────────────────────────
  { id: 'standing-calf-bb',       name: 'Standing Calf Raise (Barbell)',  primaryMuscle: 'calves',    secondaryMuscles: [],                        equipment: 'barbell',    emoji: '🦶', defaultSets: 4, defaultReps: '15', suggestedWeight: 95 },
  { id: 'standing-calf-db',       name: 'Standing Calf Raise (Dumbbell)', primaryMuscle: 'calves',    secondaryMuscles: [],                        equipment: 'dumbbell',   emoji: '🦶', defaultSets: 3, defaultReps: '20', suggestedWeight: 40 },
  { id: 'seated-calf-raise',      name: 'Seated Calf Raise (Machine)',    primaryMuscle: 'calves',    secondaryMuscles: [],                        equipment: 'machine',    emoji: '🦶', defaultSets: 3, defaultReps: '20', suggestedWeight: 50 },
  { id: 'bw-calf-raise',          name: 'Bodyweight Calf Raise',          primaryMuscle: 'calves',    secondaryMuscles: [],                        equipment: 'none',       emoji: '🦶', defaultSets: 3, defaultReps: '25' },
  { id: 'donkey-calf-raise',      name: 'Donkey Calf Raise',              primaryMuscle: 'calves',    secondaryMuscles: [],                        equipment: 'machine',    emoji: '🦶', defaultSets: 3, defaultReps: '15', suggestedWeight: 90 },

  // ── Abductors ──────────────────────────────────────────────
  { id: 'hip-abduction-machine',  name: 'Hip Abduction (Machine)',        primaryMuscle: 'abductors', secondaryMuscles: ['glutes'],                equipment: 'machine',    emoji: '🦵', defaultSets: 3, defaultReps: '15', suggestedWeight: 70 },
  { id: 'side-leg-raise',         name: 'Side-Lying Leg Raise',           primaryMuscle: 'abductors', secondaryMuscles: ['glutes'],                equipment: 'none',       emoji: '🦵', defaultSets: 3, defaultReps: '20' },
  { id: 'banded-lateral-walk',    name: 'Banded Lateral Walk',            primaryMuscle: 'abductors', secondaryMuscles: ['glutes'],                equipment: 'band',       emoji: '🚶', defaultSets: 3, defaultReps: '15' },
  { id: 'fire-hydrant',           name: 'Fire Hydrant',                   primaryMuscle: 'abductors', secondaryMuscles: ['glutes'],                equipment: 'none',       emoji: '🚒', defaultSets: 3, defaultReps: '15' },

  // ── Adductors ──────────────────────────────────────────────
  { id: 'hip-adduction-machine',  name: 'Hip Adduction (Machine)',        primaryMuscle: 'adductors', secondaryMuscles: [],                        equipment: 'machine',    emoji: '🦵', defaultSets: 3, defaultReps: '15', suggestedWeight: 70 },
  { id: 'cossack-squat',          name: 'Cossack Squat',                  primaryMuscle: 'adductors', secondaryMuscles: ['quads', 'glutes'],       equipment: 'kettlebell', emoji: '🦵', defaultSets: 3, defaultReps: '10', suggestedWeight: 25 },
  { id: 'copenhagen-plank',       name: 'Copenhagen Plank',               primaryMuscle: 'adductors', secondaryMuscles: ['abs'],                   equipment: 'bench',      emoji: '🧘', defaultSets: 3, defaultReps: '30s' },

  // ── Neck ───────────────────────────────────────────────────
  { id: 'neck-curl',              name: 'Neck Curl (Plate)',              primaryMuscle: 'neck',      secondaryMuscles: [],                        equipment: 'plate',      emoji: '👤', defaultSets: 3, defaultReps: '15', suggestedWeight: 10 },
  { id: 'neck-extension',         name: 'Neck Extension (Plate)',         primaryMuscle: 'neck',      secondaryMuscles: [],                        equipment: 'plate',      emoji: '👤', defaultSets: 3, defaultReps: '15', suggestedWeight: 10 },
  { id: 'neck-bridge',            name: 'Neck Bridge',                    primaryMuscle: 'neck',      secondaryMuscles: ['upperBack'],             equipment: 'none',       emoji: '👤', defaultSets: 3, defaultReps: '20s' },

  // ── Cardio ─────────────────────────────────────────────────
  { id: 'treadmill-run',          name: 'Treadmill Run',                  primaryMuscle: 'cardio',    secondaryMuscles: ['fullBody'],              equipment: 'machine',    emoji: '🏃', defaultSets: 1, defaultReps: '20m' },
  { id: 'stationary-bike',        name: 'Stationary Bike',                primaryMuscle: 'cardio',    secondaryMuscles: ['quads'],                 equipment: 'machine',    emoji: '🚴', defaultSets: 1, defaultReps: '20m' },
  { id: 'rowing-machine',         name: 'Rowing Machine',                 primaryMuscle: 'cardio',    secondaryMuscles: ['upperBack', 'fullBody'], equipment: 'machine',    emoji: '🚣', defaultSets: 1, defaultReps: '15m' },
  { id: 'elliptical',             name: 'Elliptical',                     primaryMuscle: 'cardio',    secondaryMuscles: ['fullBody'],              equipment: 'machine',    emoji: '🏃', defaultSets: 1, defaultReps: '20m' },
  { id: 'jump-rope',              name: 'Jump Rope',                      primaryMuscle: 'cardio',    secondaryMuscles: ['calves'],                equipment: 'other',      emoji: '🤸', defaultSets: 3, defaultReps: '60s' },
  { id: 'battle-ropes',           name: 'Battle Ropes',                   primaryMuscle: 'cardio',    secondaryMuscles: ['shoulders', 'fullBody'], equipment: 'other',      emoji: '🌊', defaultSets: 3, defaultReps: '30s' },
  { id: 'burpee',                 name: 'Burpee',                         primaryMuscle: 'fullBody',  secondaryMuscles: ['cardio', 'chest', 'abs'],equipment: 'none',       emoji: '🔥', defaultSets: 3, defaultReps: '12' },
  { id: 'high-knees',             name: 'High Knees',                     primaryMuscle: 'cardio',    secondaryMuscles: ['quads', 'abs'],          equipment: 'none',       emoji: '🏃', defaultSets: 3, defaultReps: '30s' },

  // ── Full Body / Olympic ────────────────────────────────────
  { id: 'clean-and-press',        name: 'Clean & Press (Barbell)',        primaryMuscle: 'fullBody',  secondaryMuscles: ['shoulders', 'quads', 'traps'], equipment: 'barbell', emoji: '🏋️', defaultSets: 3, defaultReps: '5',  suggestedWeight: 95 },
  { id: 'power-clean',            name: 'Power Clean',                    primaryMuscle: 'fullBody',  secondaryMuscles: ['traps', 'quads'],        equipment: 'barbell',    emoji: '🏋️', defaultSets: 4, defaultReps: '3',  suggestedWeight: 115 },
  { id: 'snatch',                 name: 'Snatch',                         primaryMuscle: 'fullBody',  secondaryMuscles: ['shoulders', 'quads'],    equipment: 'barbell',    emoji: '🏋️', defaultSets: 3, defaultReps: '3',  suggestedWeight: 95 },
  { id: 'thruster-db',            name: 'Thruster (Dumbbell)',            primaryMuscle: 'fullBody',  secondaryMuscles: ['shoulders', 'quads'],    equipment: 'dumbbell',   emoji: '🔥', defaultSets: 3, defaultReps: '12', suggestedWeight: 25 },
  { id: 'turkish-get-up',         name: 'Turkish Get-Up',                 primaryMuscle: 'fullBody',  secondaryMuscles: ['shoulders', 'abs'],      equipment: 'kettlebell', emoji: '🤸', defaultSets: 3, defaultReps: '5',  suggestedWeight: 25 },
  { id: 'man-maker',              name: 'Man Maker',                      primaryMuscle: 'fullBody',  secondaryMuscles: ['cardio'],                equipment: 'dumbbell',   emoji: '🔥', defaultSets: 3, defaultReps: '8',  suggestedWeight: 25 },
  { id: 'kb-snatch',              name: 'Kettlebell Snatch',              primaryMuscle: 'fullBody',  secondaryMuscles: ['shoulders'],             equipment: 'kettlebell', emoji: '🏋️', defaultSets: 3, defaultReps: '8',  suggestedWeight: 35 },
  { id: 'kb-clean',               name: 'Kettlebell Clean',               primaryMuscle: 'fullBody',  secondaryMuscles: ['traps', 'quads'],        equipment: 'kettlebell', emoji: '🏋️', defaultSets: 3, defaultReps: '8',  suggestedWeight: 35 },
  { id: 'sandbag-clean-press',    name: 'Sandbag Clean & Press',          primaryMuscle: 'fullBody',  secondaryMuscles: ['shoulders'],             equipment: 'other',      emoji: '🔥', defaultSets: 3, defaultReps: '8'  },
  { id: 'sled-push',              name: 'Sled Push',                      primaryMuscle: 'fullBody',  secondaryMuscles: ['quads', 'cardio'],       equipment: 'other',      emoji: '🛷', defaultSets: 3, defaultReps: '30s' },
];

// ─────────────────────────────────────────────────────────────
// Helpers consumed by AddExerciseScreen + downstream session
// ─────────────────────────────────────────────────────────────

/** Convert a picker Exercise into the SessionExercise shape that
 *  WorkoutSessionScreen + WorkoutContext speak in. */
export function toSessionExercise(ex: Exercise) {
  const muscleIds = [ex.primaryMuscle, ...ex.secondaryMuscles];
  const internal = new Set<string>();
  for (const m of muscleIds) {
    for (const i of MUSCLE_TO_INTERNAL[m] ?? []) internal.add(i);
  }
  return {
    name:             ex.name,
    muscles:          [...internal],
    equipment:        EQUIPMENT_TO_INTERNAL[ex.equipment] ?? [],
    sets:             ex.defaultSets,
    reps:             ex.defaultReps,
    emoji:            ex.emoji,
    suggestedWeight:  ex.suggestedWeight,
  };
}

/** Quick label lookups for the rows. */
export function muscleLabel(id: MuscleId): string {
  return MUSCLE_OPTIONS.find(m => m.id === id)?.label ?? id;
}

export function equipmentLabel(id: EquipmentId): string {
  return EQUIPMENT_OPTIONS.find(e => e.id === id)?.label ?? id;
}

/** Apply the search + filter state to the exercise list. */
export function filterExercises(opts: {
  search: string;
  equipment: EquipmentId[];   // empty array = all
  muscles:   MuscleId[];      // empty array = all
}): Exercise[] {
  const q = opts.search.trim().toLowerCase();
  return EXERCISES.filter(ex => {
    if (q && !ex.name.toLowerCase().includes(q)) return false;
    if (opts.equipment.length > 0 && !opts.equipment.includes(ex.equipment)) return false;
    if (opts.muscles.length > 0) {
      const ms = [ex.primaryMuscle, ...ex.secondaryMuscles];
      if (!ms.some(m => opts.muscles.includes(m))) return false;
    }
    return true;
  });
}
