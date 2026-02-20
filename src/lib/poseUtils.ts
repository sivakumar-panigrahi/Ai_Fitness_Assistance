// Pose detection utility functions

export interface Point3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

// Calculate angle between three points (in degrees)
export function calculateAngle(a: Point3D, b: Point3D, c: Point3D): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

// MediaPipe Pose Landmark indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

// Skeleton connections for drawing
export const POSE_CONNECTIONS = [
  // Torso
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
  // Left arm
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  // Right arm
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
  // Left leg
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
  // Right leg
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
];

export type RepState = 'ready' | 'down' | 'up';

export interface ExerciseAngles {
  primary: number;
  secondary?: number;
}

// Get angles for specific exercises
export function getExerciseAngles(landmarks: Point3D[], exercise: string): ExerciseAngles | null {
  if (landmarks.length < 33) return null;

  const L = POSE_LANDMARKS;

  switch (exercise) {
    case 'squats': {
      // Track knee angle (hip -> knee -> ankle)
      const leftKneeAngle = calculateAngle(
        landmarks[L.LEFT_HIP],
        landmarks[L.LEFT_KNEE],
        landmarks[L.LEFT_ANKLE]
      );
      const rightKneeAngle = calculateAngle(
        landmarks[L.RIGHT_HIP],
        landmarks[L.RIGHT_KNEE],
        landmarks[L.RIGHT_ANKLE]
      );
      return { primary: (leftKneeAngle + rightKneeAngle) / 2 };
    }

    case 'pushups': {
      // Track elbow angle (shoulder -> elbow -> wrist)
      const leftElbowAngle = calculateAngle(
        landmarks[L.LEFT_SHOULDER],
        landmarks[L.LEFT_ELBOW],
        landmarks[L.LEFT_WRIST]
      );
      const rightElbowAngle = calculateAngle(
        landmarks[L.RIGHT_SHOULDER],
        landmarks[L.RIGHT_ELBOW],
        landmarks[L.RIGHT_WRIST]
      );
      return { primary: (leftElbowAngle + rightElbowAngle) / 2 };
    }

    case 'bicep_curls': {
      // Track elbow angle (shoulder -> elbow -> wrist)
      const leftElbowAngle = calculateAngle(
        landmarks[L.LEFT_SHOULDER],
        landmarks[L.LEFT_ELBOW],
        landmarks[L.LEFT_WRIST]
      );
      const rightElbowAngle = calculateAngle(
        landmarks[L.RIGHT_SHOULDER],
        landmarks[L.RIGHT_ELBOW],
        landmarks[L.RIGHT_WRIST]
      );
      return { primary: (leftElbowAngle + rightElbowAngle) / 2 };
    }

    case 'jumping_jacks': {
      // Track arm elevation (hip -> shoulder -> wrist angle)
      const leftArmAngle = calculateAngle(
        landmarks[L.LEFT_HIP],
        landmarks[L.LEFT_SHOULDER],
        landmarks[L.LEFT_WRIST]
      );
      const rightArmAngle = calculateAngle(
        landmarks[L.RIGHT_HIP],
        landmarks[L.RIGHT_SHOULDER],
        landmarks[L.RIGHT_WRIST]
      );
      return { primary: (leftArmAngle + rightArmAngle) / 2 };
    }

    case 'lunges': {
      // Track front knee angle
      const leftKneeAngle = calculateAngle(
        landmarks[L.LEFT_HIP],
        landmarks[L.LEFT_KNEE],
        landmarks[L.LEFT_ANKLE]
      );
      const rightKneeAngle = calculateAngle(
        landmarks[L.RIGHT_HIP],
        landmarks[L.RIGHT_KNEE],
        landmarks[L.RIGHT_ANKLE]
      );
      // Use the smaller angle (the bent knee)
      return { primary: Math.min(leftKneeAngle, rightKneeAngle) };
    }

    default:
      return null;
  }
}

// Exercise-specific thresholds
export interface ExerciseThresholds {
  downAngle: number;  // Angle when in "down" position
  upAngle: number;    // Angle when in "up" position
  tolerance: number;  // Tolerance for angle matching
}

export const EXERCISE_THRESHOLDS: Record<string, ExerciseThresholds> = {
  squats: {
    downAngle: 90,   // Knees bent at 90 degrees
    upAngle: 160,    // Standing straight
    tolerance: 15,
  },
  pushups: {
    downAngle: 90,   // Arms bent
    upAngle: 160,    // Arms extended
    tolerance: 15,
  },
  bicep_curls: {
    downAngle: 40,   // Arms curled up (small angle)
    upAngle: 150,    // Arms extended down
    tolerance: 15,
  },
  jumping_jacks: {
    downAngle: 30,   // Arms down
    upAngle: 140,    // Arms up
    tolerance: 20,
  },
  lunges: {
    downAngle: 90,   // Front knee bent
    upAngle: 160,    // Standing
    tolerance: 15,
  },
};

// Determine form quality based on angle
export function getFormQuality(
  angle: number,
  thresholds: ExerciseThresholds,
  state: RepState
): 'good' | 'adjust' | 'poor' {
  if (state === 'down') {
    const diff = Math.abs(angle - thresholds.downAngle);
    if (diff <= thresholds.tolerance) return 'good';
    if (diff <= thresholds.tolerance * 2) return 'adjust';
    return 'poor';
  }
  return 'good';
}

// Get form feedback message
export function getFormFeedback(
  exercise: string,
  angle: number,
  state: RepState,
  thresholds: ExerciseThresholds
): string {
  if (state === 'ready') {
    return 'Get into starting position';
  }

  switch (exercise) {
    case 'squats':
      if (state === 'down' && angle > thresholds.downAngle + thresholds.tolerance) {
        return 'Go lower! Bend your knees more';
      }
      break;
    case 'pushups':
      if (state === 'down' && angle > thresholds.downAngle + thresholds.tolerance) {
        return 'Go lower! Bend your elbows more';
      }
      break;
    case 'bicep_curls':
      if (state === 'down' && angle > thresholds.downAngle + thresholds.tolerance) {
        return 'Curl higher! Bring hands to shoulders';
      }
      break;
    case 'jumping_jacks':
      if (state === 'up' && angle < thresholds.upAngle - thresholds.tolerance) {
        return 'Raise arms higher!';
      }
      break;
    case 'lunges':
      if (state === 'down' && angle > thresholds.downAngle + thresholds.tolerance) {
        return 'Go lower! Bend front knee more';
      }
      break;
  }

  if (state === 'down') return 'Good form! Hold it...';
  if (state === 'up') return 'Great! Keep going!';
  return '';
}
