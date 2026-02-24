import {
  UserProfile,
  AgeGroup,
  BMICategory,
  FitnessRecommendation,
  Exercise,
  YogaVideo,
  DietPlan,
  SleepRecommendation,
  ConditionType,
  DiseaseStage,
} from '@/types/fitness';
import { VIDEO_ROUTINES } from './videoData';

export function getDailyVideos(age: number) {
  // 1. Determine Category (Matching your existing logic)
  const group = age <= 18 ? 'teen' : age <= 45 ? 'young' : 'senior';

  // 2. Get current day (1-7)
  const day = new Date().getDay() || 7; // Sunday becomes 7

  // 3. Return the specific IDs
  return VIDEO_ROUTINES[group][day];
}

// Calculate BMI
export function calculateBMI(weight: number, height: number): number {
  return weight / (height * height);
}

// Get BMI Category
export function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

// Get Age Group
export function getAgeGroup(age: number): AgeGroup {
  if (age <= 18) return 'child';
  if (age <= 45) return 'young';
  return 'senior';
}

// Get detailed age group label for display
export function getAgeGroupLabel(age: number): string {
  if (age <= 13) return 'Child (10-13)';
  if (age <= 17) return 'Teen (14-17)';
  if (age <= 25) return 'Young Adult (18-25)';
  if (age <= 45) return 'Adult (26-45)';
  if (age <= 64) return 'Middle-aged (46-64)';
  return 'Senior (65+)';
}

// Yoga video database with real YouTube links
const yogaVideos: YogaVideo[] = [
  {
    title: 'Yoga For Diabetes',
    url: 'https://www.youtube.com/watch?v=fmh58tykgpo',
    duration: '30 min',
    difficulty: 'beginner',
    targetCondition: 'diabetes',
    thumbnail: 'https://img.youtube.com/vi/fmh58tykgpo/maxresdefault.jpg',
  },
  {
    title: 'Isha Upa Yoga Practices',
    url: 'https://www.youtube.com/watch?v=Jf5qUhz-FVk',
    duration: '45 min',
    difficulty: 'beginner',
    targetCondition: 'general',
    thumbnail: 'https://img.youtube.com/vi/Jf5qUhz-FVk/maxresdefault.jpg',
  },
  {
    title: 'Yoga for High Blood Pressure',
    url: 'https://www.youtube.com/watch?v=NDp_jRfVA5k',
    duration: '20 min',
    difficulty: 'beginner',
    targetCondition: 'hypertension',
    thumbnail: 'https://img.youtube.com/vi/NDp_jRfVA5k/maxresdefault.jpg',
  },
  {
    title: 'Morning Yoga For Beginners',
    url: 'https://www.youtube.com/watch?v=EVb7mE9VtW8',
    duration: '10 min',
    difficulty: 'beginner',
    targetCondition: 'general',
    thumbnail: 'https://img.youtube.com/vi/EVb7mE9VtW8/maxresdefault.jpg',
  },
  {
    title: 'Gentle Yoga for Seniors',
    url: 'https://www.youtube.com/watch?v=nNiRy3Gk27o',
    duration: '25 min',
    difficulty: 'beginner',
    targetCondition: 'senior',
    thumbnail: 'https://img.youtube.com/vi/nNiRy3Gk27o/maxresdefault.jpg',
  },
  {
    title: 'Yoga for Weight Loss',
    url: 'https://www.youtube.com/watch?v=Ci1cT8OmNjY',
    duration: '35 min',
    difficulty: 'intermediate',
    targetCondition: 'obesity',
    thumbnail: 'https://img.youtube.com/vi/Ci1cT8OmNjY/maxresdefault.jpg',
  },
  {
    title: 'Breathing Exercises for Asthma',
    url: 'https://www.youtube.com/watch?v=ubqaJKoErTc',
    duration: '15 min',
    difficulty: 'beginner',
    targetCondition: 'asthma',
    thumbnail: 'https://img.youtube.com/vi/ubqaJKoErTc/maxresdefault.jpg',
  },
  {
    title: 'Thyroid Yoga Routine',
    url: 'https://www.youtube.com/watch?v=IKv-VqXyB9w',
    duration: '20 min',
    difficulty: 'beginner',
    targetCondition: 'thyroid',
    thumbnail: 'https://img.youtube.com/vi/IKv-VqXyB9w/maxresdefault.jpg',
  },
];

// Exercise database
const exerciseDatabase: Record<string, Exercise[]> = {
  lowIntensity: [
    { name: 'Walking', duration: '30 min', intensity: 'low', description: 'Gentle walk at comfortable pace', icon: '🚶' },
    { name: 'Stretching', duration: '15 min', intensity: 'low', description: 'Full body gentle stretches', icon: '🧘' },
    { name: 'Chair Exercises', duration: '20 min', intensity: 'low', description: 'Seated exercises for mobility', icon: '🪑' },
    { name: 'Light Swimming', duration: '20 min', intensity: 'low', description: 'Gentle laps or water walking', icon: '🏊' },
  ],
  mediumIntensity: [
    { name: 'Brisk Walking', duration: '40 min', intensity: 'medium', description: 'Fast-paced walking', icon: '🏃' },
    { name: 'Cycling', duration: '30 min', intensity: 'medium', description: 'Moderate cycling pace', icon: '🚴' },
    { name: 'Dance Workout', duration: '30 min', intensity: 'medium', description: 'Fun cardio dance moves', icon: '💃' },
    { name: 'Bodyweight Training', duration: '25 min', intensity: 'medium', description: 'Push-ups, squats, lunges', icon: '💪' },
  ],
  highIntensity: [
    { name: 'HIIT Workout', duration: '25 min', intensity: 'high', description: 'High-intensity intervals', icon: '⚡' },
    { name: 'Running', duration: '30 min', intensity: 'high', description: 'Jogging or running', icon: '🏃‍♂️' },
    { name: 'Jump Rope', duration: '20 min', intensity: 'high', description: 'Cardio jump rope session', icon: '⏭️' },
    { name: 'CrossFit', duration: '45 min', intensity: 'high', description: 'Functional fitness training', icon: '🏋️' },
  ],
};

// Get exercise recommendations based on profile
function getExerciseRecommendations(profile: UserProfile, bmiCategory: BMICategory, ageGroup: AgeGroup): Exercise[] {
  const exercises: Exercise[] = [];
  const hasSerious = profile.healthConditions.some(c => c.stage === 'stage2');
  const hasMild = profile.healthConditions.some(c => c.stage === 'stage1');

  if (ageGroup === 'senior' || hasSerious) {
    exercises.push(...exerciseDatabase.lowIntensity.slice(0, 3));
  }
  else if (hasMild || bmiCategory === 'overweight') {
    exercises.push(...exerciseDatabase.lowIntensity.slice(0, 2));
    exercises.push(...exerciseDatabase.mediumIntensity.slice(0, 2));
  }
  else if (ageGroup === 'young' && bmiCategory === 'normal') {
    exercises.push(...exerciseDatabase.mediumIntensity.slice(0, 2));
    exercises.push(...exerciseDatabase.highIntensity.slice(0, 2));
  }
  else if (ageGroup === 'child') {
    exercises.push(...exerciseDatabase.mediumIntensity.slice(0, 3));
  }
  else {
    exercises.push(...exerciseDatabase.lowIntensity.slice(0, 2));
    exercises.push(...exerciseDatabase.mediumIntensity.slice(0, 1));
  }

  return exercises;
}

// Get yoga recommendations
function getYogaRecommendations(profile: UserProfile, ageGroup: AgeGroup): YogaVideo[] {
  const videos: YogaVideo[] = [];

  const morningYoga = yogaVideos.find(v => v.title.includes('Morning'));
  if (morningYoga) videos.push(morningYoga);

  profile.healthConditions.forEach(condition => {
    const conditionVideo = yogaVideos.find(
      v => v.targetCondition === condition.type
    );
    if (conditionVideo && !videos.includes(conditionVideo)) {
      videos.push(conditionVideo);
    }
  });

  if (ageGroup === 'senior') {
    const seniorYoga = yogaVideos.find(v => v.targetCondition === 'senior');
    if (seniorYoga && !videos.includes(seniorYoga)) {
      videos.push(seniorYoga);
    }
  }

  if (videos.length < 3) {
    const generalYoga = yogaVideos.find(
      v => v.targetCondition === 'general' && !videos.includes(v)
    );
    if (generalYoga) videos.push(generalYoga);
  }

  return videos.slice(0, 4);
}

// Get diet plan
function getDietPlan(profile: UserProfile, bmiCategory: BMICategory): DietPlan {
  const guidelines: string[] = [];
  const restrictions: string[] = [];

  profile.healthConditions.forEach(condition => {
    switch (condition.type) {
      case 'diabetes':
        guidelines.push('Choose whole grains over refined carbs');
        guidelines.push('Include fiber-rich vegetables');
        restrictions.push('Limit sugar and sweetened beverages');
        restrictions.push('Avoid white rice, opt for brown rice');
        break;
      case 'hypertension':
        guidelines.push('Include potassium-rich foods (bananas, spinach)');
        guidelines.push('Use herbs and spices instead of salt');
        restrictions.push('Limit sodium intake to 1500mg/day');
        restrictions.push('Avoid processed and packaged foods');
        break;
      case 'obesity':
        guidelines.push('Practice portion control');
        guidelines.push('Eat slowly and mindfully');
        restrictions.push('Limit fried and high-calorie foods');
        restrictions.push('Avoid sugary snacks and drinks');
        break;
      case 'thyroid':
        guidelines.push('Include selenium-rich foods (nuts, fish)');
        guidelines.push('Ensure adequate iodine intake');
        restrictions.push('Limit soy products');
        restrictions.push('Avoid cruciferous vegetables in excess');
        break;
    }
  });

  if (bmiCategory === 'underweight') {
    guidelines.push('Include calorie-dense healthy foods');
    guidelines.push('Add nuts and dry fruits to meals');
  } else if (bmiCategory === 'overweight' || bmiCategory === 'obese') {
    guidelines.push('Focus on high-protein, low-carb meals');
    guidelines.push('Fill half your plate with vegetables');
  }

  if (guidelines.length === 0) {
    guidelines.push('Eat a balanced diet with all food groups');
    guidelines.push('Stay hydrated - drink 8 glasses of water daily');
    guidelines.push('Include fruits and vegetables in every meal');
  }

  const meals: DietPlan['meals'] = [
    {
      time: '7:00 AM',
      name: 'Breakfast',
      items: ['Oats porridge with nuts', 'Fresh fruits', 'Green tea'],
      calories: 350,
    },
    {
      time: '10:00 AM',
      name: 'Mid-Morning Snack',
      items: ['Handful of almonds', 'Buttermilk'],
      calories: 150,
    },
    {
      time: '1:00 PM',
      name: 'Lunch',
      items: ['Brown rice/roti', 'Dal', 'Vegetable curry', 'Salad'],
      calories: 500,
    },
    {
      time: '4:00 PM',
      name: 'Evening Snack',
      items: ['Sprouts chaat', 'Coconut water'],
      calories: 150,
    },
    {
      time: '7:30 PM',
      name: 'Dinner',
      items: ['Light roti', 'Grilled vegetables', 'Lentil soup'],
      calories: 400,
    },
  ];

  return { meals, guidelines, restrictions };
}

// Enhanced age-based sleep recommendation with medically-backed data
function getSleepRecommendation(age: number): SleepRecommendation {
  if (age <= 13) {
    return {
      minHours: 9,
      maxHours: 11,
      tips: [
        'Set a consistent bedtime and wake time every day',
        'No screen time at least 1 hour before bed',
        'Avoid caffeine entirely — it affects young bodies more',
        'Create a calming bedtime routine (reading, soft music)',
        'Keep the bedroom cool, dark, and quiet',
      ],
    };
  }

  if (age <= 17) {
    return {
      minHours: 8,
      maxHours: 10,
      tips: [
        'Avoid late-night studying — it hurts memory consolidation',
        'Reduce blue light exposure after 8 PM (use night mode)',
        'Keep a regular sleep schedule, even on weekends',
        'Avoid energy drinks and excessive caffeine',
        'Exercise during the day, but not close to bedtime',
      ],
    };
  }

  if (age <= 25) {
    return {
      minHours: 7,
      maxHours: 9,
      tips: [
        'Limit alcohol — it disrupts sleep quality even if you fall asleep faster',
        'Maintain a consistent wake-up time, even on weekends',
        'Exercise earlier in the day for better sleep quality',
        'Avoid heavy meals within 2 hours of bedtime',
        'Use relaxation techniques like deep breathing before sleep',
      ],
    };
  }

  if (age <= 45) {
    return {
      minHours: 7,
      maxHours: 9,
      tips: [
        'Manage stress with mindfulness or meditation before bed',
        'Avoid screens 1 hour before bed — read a physical book instead',
        'Keep your bedroom cool (18-20°C / 65-68°F) for optimal sleep',
        'Limit caffeine after 2 PM',
        'Consider a consistent wind-down routine of 30 minutes',
      ],
    };
  }

  if (age <= 64) {
    return {
      minHours: 7,
      maxHours: 8,
      tips: [
        'Watch for signs of sleep apnea (snoring, daytime fatigue)',
        'Limit evening fluids to reduce nighttime bathroom trips',
        'Practice relaxation techniques like progressive muscle relaxation',
        'Avoid long naps after 3 PM — they can interfere with night sleep',
        'Maintain regular physical activity but finish 3+ hours before bed',
      ],
    };
  }

  // 65+
  return {
    minHours: 7,
    maxHours: 8,
    tips: [
      'Short naps (20-30 min) before 3 PM are OK and beneficial',
      'Consider an earlier bedtime aligned with natural circadian rhythm',
      'A light evening walk can improve sleep onset',
      'Keep your sleep environment safe — use nightlights for bathroom trips',
      'Discuss sleep medications with your doctor if sleep quality declines',
      'Expose yourself to morning sunlight to regulate your body clock',
    ],
  };
}

// Get warnings based on conditions
function getWarnings(profile: UserProfile): string[] {
  const warnings: string[] = [];

  profile.healthConditions.forEach(condition => {
    if (condition.stage === 'stage2') {
      warnings.push(
        `⚠️ You have ${condition.type} at Stage 2. Please consult a medical professional before starting any exercise program.`
      );
    }
  });

  if (profile.age > 60) {
    warnings.push('👨‍⚕️ For individuals over 60, we recommend a health check-up before starting new exercises.');
  }

  const bmi = calculateBMI(profile.weight, profile.height);
  if (bmi > 35) {
    warnings.push('🏥 Your BMI indicates severe obesity. Please consult a doctor for a personalized plan.');
  }

  return warnings;
}

// Main recommendation engine
export function generateRecommendations(profile: UserProfile): FitnessRecommendation {
  const bmi = calculateBMI(profile.weight, profile.height);
  const bmiCategory = getBMICategory(bmi);
  const ageGroup = getAgeGroup(profile.age);

  return {
    exercises: getExerciseRecommendations(profile, bmiCategory, ageGroup),
    yogaVideos: getYogaRecommendations(profile, ageGroup),
    dietPlan: getDietPlan(profile, bmiCategory),
    sleepRecommendation: getSleepRecommendation(profile.age),
    warnings: getWarnings(profile),
  };
}

// Badge definitions
export const badgeDefinitions = [
  {
    id: 'bronze',
    name: 'Bronze Warrior',
    icon: '🥉',
    description: 'Complete 3 days streak',
    daysRequired: 3,
  },
  {
    id: 'silver',
    name: 'Silver Champion',
    icon: '🥈',
    description: 'Complete 7 days streak',
    daysRequired: 7,
  },
  {
    id: 'gold',
    name: 'Gold Legend',
    icon: '🥇',
    description: 'Complete 30 days streak',
    daysRequired: 30,
  },
  {
    id: 'diamond',
    name: 'Diamond Master',
    icon: '💎',
    description: 'Complete 100 days streak',
    daysRequired: 100,
  },
];
