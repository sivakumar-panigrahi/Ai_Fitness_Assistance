export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in meters
  weight: number; // in kg
  healthConditions: HealthCondition[];
}

export interface HealthCondition {
  type: ConditionType;
  stage: DiseaseStage;
}

export type ConditionType = 
  | 'diabetes'
  | 'hypertension'
  | 'obesity'
  | 'asthma'
  | 'thyroid'
  | 'none';

export type DiseaseStage = 'normal' | 'stage1' | 'stage2';

export type AgeGroup = 'child' | 'young' | 'senior';

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface FitnessRecommendation {
  exercises: Exercise[];
  yogaVideos: YogaVideo[];
  dietPlan: DietPlan;
  sleepRecommendation: SleepRecommendation;
  warnings: string[];
}

export interface Exercise {
  name: string;
  duration: string;
  intensity: 'low' | 'medium' | 'high';
  description: string;
  icon: string;
  imageUrl?: string; // URL to exercise demonstration image/GIF
}

export type DietPreference = 'vegan' | 'vegetarian' | 'non_vegetarian';

export interface YogaVideo {
  title: string;
  url: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetCondition: string;
  thumbnail?: string;
}

export interface DietPlan {
  meals: Meal[];
  guidelines: string[];
  restrictions: string[];
}

export interface Meal {
  time: string;
  name: string;
  items: string[];
  calories: number;
}

export interface SleepRecommendation {
  minHours: number;
  maxHours: number;
  tips: string[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  daysRequired: number;
  earned: boolean;
  earnedDate?: Date;
}

export interface UserProgress {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  badges: Badge[];
  lastWorkoutDate?: Date;
}
