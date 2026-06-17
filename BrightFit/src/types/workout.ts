// Shared workout types (no React/context imports — safe for storage + auth layers)

export interface CompletedSet {
  reps: number;
  weight: number;
}

export interface CompletedExercise {
  name: string;
  muscles: string[];
  emoji: string;
  sets: CompletedSet[];
}

export interface ResumeExercise {
  name: string;
  muscles: string[];
  equipment: string[];
  sets: number;
  reps: string;
  emoji: string;
  suggestedWeight?: number;
}

export interface ResumeSetRow {
  weight: number;
  reps: number;
  done: boolean;
}

export interface ResumeData {
  title: string;
  exercises: ResumeExercise[];
  setData: ResumeSetRow[][];
  exIdx: number;
  elapsed: number;
}

export interface WorkoutRecord {
  id: string;
  date: Date;
  durationSeconds: number;
  title: string;
  exercises: CompletedExercise[];
  totalVolume: number;
  musclesWorked: string[];
  completed: boolean;
  resumeData?: ResumeData;
}

export interface Routine {
  id: string;
  title: string;
  createdAt: Date;
  exercises: ResumeExercise[];
}

export interface BodyMeasurements {
  height: string;
  weight: string;
  age: string;
  gender: string;
  chest: string;
  waist: string;
  hips: string;
  bicepL: string;
  bicepR: string;
  thighL: string;
  thighR: string;
}

export const EMPTY_MEASUREMENTS: BodyMeasurements = {
  height: '', weight: '', age: '', gender: '',
  chest: '', waist: '', hips: '',
  bicepL: '', bicepR: '', thighL: '', thighR: '',
};

export interface MeasurementLog {
  id: string;
  date: Date;
  measurements: BodyMeasurements;
}

export interface ProgressPhoto {
  id: string;
  date: Date;
  uri: string;
  isDay1: boolean;
}
