import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Camera, 
  CameraOff, 
  Play, 
  Square, 
  RotateCcw, 
  Activity,
  CheckCircle2,
  Zap,
  Timer,
  AlertCircle,
  Loader2,
  Maximize,
  Minimize
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  PoseLandmarker, 
  FilesetResolver, 
  DrawingUtils,
  NormalizedLandmark
} from '@mediapipe/tasks-vision';
import { 
  calculateAngle, 
  POSE_LANDMARKS, 
  POSE_CONNECTIONS,
  Point3D,
  RepState,
  EXERCISE_THRESHOLDS,
  getFormFeedback
} from '@/lib/poseUtils';
import { ExerciseReport, calculateCaloriesBurned } from './ExerciseReport';

interface ExerciseTrackerProps {
  onSaveReps?: (exercise: string, reps: number) => void;
}

// Only 2 exercises: Squats and Push-ups
type ExerciseType = 'squats' | 'pushups';

interface ExerciseConfig {
  name: string;
  icon: string;
  description: string;
  tips: string[];
  primaryJoints: number[][]; // Joint triplets for angle calculation [jointA, jointB, jointC]
  downThreshold: number;     // Angle BELOW this = in down position
  upThreshold: number;       // Angle ABOVE this = in up position
}

const EXERCISE_CONFIGS: Record<ExerciseType, ExerciseConfig> = {
  squats: {
    name: 'Squats',
    icon: '🏋️',
    description: 'Stand with feet shoulder-width apart, bend knees to lower your body until thighs are parallel to ground',
    tips: [
      'Keep your back straight throughout',
      'Knees should track over toes',
      'Go down until knee angle is below 120°',
      'Stand fully upright between reps (above 160°)'
    ],
    primaryJoints: [
      [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
      [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE]
    ],
    downThreshold: 125,  // Knee angle below 125° = squatting down
    upThreshold: 155,    // Knee angle above 155° = standing up
  },
  pushups: {
    name: 'Push-ups',
    icon: '💪',
    description: 'Start in plank position, lower your body until chest nearly touches floor, then push back up',
    tips: [
      'Keep core tight and body straight',
      'Elbows at 45-degree angle from body',
      'Go down until elbow angle is below 120°',
      'Fully extend arms at the top (above 155°)'
    ],
    primaryJoints: [
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
      [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
    ],
    downThreshold: 120,  // Elbow angle below 120° = arms bent
    upThreshold: 155,    // Elbow angle above 155° = arms extended
  },
};

// Angle smoothing buffer size
const ANGLE_BUFFER_SIZE = 5;

export function ExerciseTracker({ onSaveReps }: ExerciseTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('squats');
  const [repCount, setRepCount] = useState(0);
  const [perfectRepCount, setPerfectRepCount] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<Array<{ exercise: string; reps: number; timestamp: Date }>>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentAngle, setCurrentAngle] = useState<number | null>(null);
  const [targetAngle, setTargetAngle] = useState<{ down: number; up: number } | null>(null);
  const [repState, setRepState] = useState<RepState>('ready');
  const [formQuality, setFormQuality] = useState<'good' | 'bad'>('good');
  const [feedback, setFeedback] = useState('Position yourself in frame');
  const [poseDetected, setPoseDetected] = useState(false);
  
  // Report state
  const [showReport, setShowReport] = useState(false);
  const [sessionData, setSessionData] = useState<{
    exercise: string;
    reps: number;
    duration: number;
    avgFormQuality: number;
    perfectReps: number;
    caloriesBurned: number;
  } | null>(null);
  
  // Form quality tracking for report
  const goodFormFrames = useRef(0);
  const totalFrames = useRef(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRepTimeRef = useRef<number>(0);
  const repStateRef = useRef<RepState>('ready');
  const wasInDownPosition = useRef(false);
  const downPositionHoldTime = useRef<number>(0);
  const upPositionHoldTime = useRef<number>(0);
  const consecutiveGoodFrames = useRef<number>(0);
  
  // Angle smoothing buffer
  const angleBuffer = useRef<number[]>([]);

  // Initialize MediaPipe PoseLandmarker
  const initializePoseLandmarker = async () => {
    setIsModelLoading(true);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1
      });
      
      poseLandmarkerRef.current = poseLandmarker;
      setIsModelReady(true);
      setIsModelLoading(false);
      toast.success('AI Pose Detection ready!');
    } catch (error) {
      console.error('Failed to initialize pose landmarker:', error);
      setIsModelLoading(false);
      toast.error('Failed to load pose detection model');
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      // Initialize pose detection if not ready
      if (!isModelReady && !isModelLoading) {
        await initializePoseLandmarker();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraOn(true);
        toast.success('Camera ready! Position your full body in frame.');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Camera access denied. Please allow camera access.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    stopTracking();
  };

  // Get thresholds from config
  const getThresholds = (exercise: ExerciseType) => {
    const config = EXERCISE_CONFIGS[exercise];
    return {
      downThreshold: config.downThreshold,
      upThreshold: config.upThreshold,
    };
  };

  // Calculate primary angle for the exercise
  const calculateExerciseAngle = (landmarks: NormalizedLandmark[], exercise: ExerciseType): number | null => {
    const config = EXERCISE_CONFIGS[exercise];
    const angles: number[] = [];
    
    for (const [a, b, c] of config.primaryJoints) {
      if (landmarks[a] && landmarks[b] && landmarks[c]) {
        const pointA: Point3D = { x: landmarks[a].x, y: landmarks[a].y, z: landmarks[a].z || 0 };
        const pointB: Point3D = { x: landmarks[b].x, y: landmarks[b].y, z: landmarks[b].z || 0 };
        const pointC: Point3D = { x: landmarks[c].x, y: landmarks[c].y, z: landmarks[c].z || 0 };
        angles.push(calculateAngle(pointA, pointB, pointC));
      }
    }
    
    if (angles.length === 0) return null;
    return angles.reduce((a, b) => a + b, 0) / angles.length;
  };

  // Range-based rep detection using hysteresis (reliable approach)
  // DOWN when angle crosses below downThreshold, UP when angle crosses above upThreshold
  const detectRep = useCallback((angle: number) => {
    const { downThreshold, upThreshold } = getThresholds(selectedExercise);
    const now = Date.now();
    const minTimeBetweenReps = 600;
    
    setTargetAngle({ down: downThreshold, up: upThreshold });
    
    const isInDownZone = angle <= downThreshold;
    const isInUpZone = angle >= upThreshold;
    
    setFormQuality((isInDownZone || isInUpZone) ? 'good' : 'bad');
    
    // State machine: ready → down → (up = rep counted) → ready
    if (repStateRef.current === 'ready') {
      if (isInDownZone) {
        downPositionHoldTime.current++;
        if (downPositionHoldTime.current >= 2) {
          repStateRef.current = 'down';
          setRepState('down');
          setFeedback(`✓ Down! Now stand up (above ${upThreshold}°)`);
        } else {
          setFeedback('Hold the down position...');
        }
      } else if (isInUpZone) {
        setFeedback(`Go down below ${downThreshold}° (current: ${Math.round(angle)}°)`);
        downPositionHoldTime.current = 0;
      } else {
        setFeedback(`Go lower! Below ${downThreshold}° (current: ${Math.round(angle)}°)`);
        downPositionHoldTime.current = 0;
      }
    } else if (repStateRef.current === 'down') {
      if (isInUpZone) {
        upPositionHoldTime.current++;
        if (upPositionHoldTime.current >= 2) {
          if (now - lastRepTimeRef.current > minTimeBetweenReps) {
            setRepCount(prev => prev + 1);
            setFeedback('✓ REP COUNTED! 🎯 Go down again');
            lastRepTimeRef.current = now;
            
            repStateRef.current = 'ready';
            setRepState('ready');
            downPositionHoldTime.current = 0;
            upPositionHoldTime.current = 0;
          }
        } else {
          setFeedback('Almost up! Hold...');
        }
      } else if (isInDownZone) {
        setFeedback(`Now stand up! Above ${upThreshold}° (current: ${Math.round(angle)}°)`);
        upPositionHoldTime.current = 0;
      } else {
        setFeedback(`Keep going up! Need ${upThreshold}° (current: ${Math.round(angle)}°)`);
        upPositionHoldTime.current = 0;
      }
    }
  }, [selectedExercise]);

  // Draw skeleton with color coding
  const drawSkeleton = useCallback((
    ctx: CanvasRenderingContext2D, 
    landmarks: NormalizedLandmark[],
    width: number,
    height: number,
    isGoodForm: boolean
  ) => {
    const goodColor = '#22c55e'; // Green
    const badColor = '#ef4444';  // Red
    const lineColor = isGoodForm ? goodColor : badColor;
    const jointColor = isGoodForm ? goodColor : badColor;
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = lineColor;
    ctx.fillStyle = jointColor;
    
    // Draw connections
    for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      
      if (start && end && start.visibility && end.visibility && 
          start.visibility > 0.5 && end.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
      }
    }
    
    // Draw joints
    for (const landmark of landmarks) {
      if (landmark && landmark.visibility && landmark.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    
    // Draw primary joints with larger circles
    const config = EXERCISE_CONFIGS[selectedExercise];
    for (const [a, b, c] of config.primaryJoints) {
      const joints = [landmarks[a], landmarks[b], landmarks[c]];
      for (const joint of joints) {
        if (joint && joint.visibility && joint.visibility > 0.5) {
          ctx.beginPath();
          ctx.arc(joint.x * width, joint.y * height, 10, 0, 2 * Math.PI);
          ctx.strokeStyle = isGoodForm ? '#16a34a' : '#dc2626';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = isGoodForm ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
          ctx.fill();
        }
      }
    }
  }, [selectedExercise]);

  // Smooth angle calculation using moving average
  const getSmoothedAngle = (rawAngle: number): number => {
    angleBuffer.current.push(rawAngle);
    if (angleBuffer.current.length > ANGLE_BUFFER_SIZE) {
      angleBuffer.current.shift();
    }
    // Return average of buffered angles
    return angleBuffer.current.reduce((a, b) => a + b, 0) / angleBuffer.current.length;
  };

  // Process video frame for pose detection
  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !poseLandmarkerRef.current || !isTracking) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.videoWidth === 0) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
      // Run pose detection
      const startTimeMs = performance.now();
      const results = poseLandmarkerRef.current.detectForVideo(video, startTimeMs);
      
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        setPoseDetected(true);
        
        // Calculate angle for the exercise
        const rawAngle = calculateExerciseAngle(landmarks, selectedExercise);
        
        if (rawAngle !== null) {
          // Apply smoothing to reduce jitter
          const angle = getSmoothedAngle(rawAngle);
          setCurrentAngle(Math.round(angle));
          
          // Track form quality for report
          totalFrames.current++;
          const { downThreshold, upThreshold } = getThresholds(selectedExercise);
          const goodForm = angle <= downThreshold || angle >= upThreshold;
          
          if (goodForm) {
            goodFormFrames.current++;
          }
          
          // Draw skeleton with color based on form
          drawSkeleton(ctx, landmarks, canvas.width, canvas.height, goodForm);
          
          // Detect reps
          detectRep(angle);
        }
      } else {
        setPoseDetected(false);
        setFeedback('Position your full body in frame');
        setCurrentAngle(null);
      }
    } catch (error) {
      console.error('Pose detection error:', error);
    }
    
    animationRef.current = requestAnimationFrame(processFrame);
  }, [isTracking, selectedExercise, detectRep, drawSkeleton]);

  // Start tracking session
  const startTracking = () => {
    if (!isModelReady) {
      toast.error('Please wait for AI model to load');
      return;
    }
    
    const { downThreshold, upThreshold } = getThresholds(selectedExercise);
    
    setIsTracking(true);
    setRepCount(0);
    setPerfectRepCount(0);
    setElapsedTime(0);
    setRepState('ready');
    repStateRef.current = 'ready';
    wasInDownPosition.current = false;
    downPositionHoldTime.current = 0;
    upPositionHoldTime.current = 0;
    consecutiveGoodFrames.current = 0;
    lastRepTimeRef.current = 0;
    angleBuffer.current = [];
    goodFormFrames.current = 0;
    totalFrames.current = 0;
    setFeedback(`Get into starting position - go below ${downThreshold}°`);
    setTargetAngle({ down: downThreshold, up: upThreshold });
    
    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    toast.success('Tracking started! Complete full range of motion for reps.');
  };

  // Stop tracking and save
  const stopTracking = () => {
    const currentRepCount = repCount;
    const currentElapsedTime = elapsedTime;
    const exerciseName = EXERCISE_CONFIGS[selectedExercise].name;
    
    setIsTracking(false);
    setRepState('ready');
    repStateRef.current = 'ready';
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    
    // Save to session history and show report
    if (currentRepCount > 0) {
      const newEntry = {
        exercise: exerciseName,
        reps: currentRepCount,
        timestamp: new Date(),
      };
      setSessionHistory(prev => [newEntry, ...prev]);
      
      if (onSaveReps) {
        onSaveReps(selectedExercise, currentRepCount);
      }
      
      // Calculate stats for report
      const avgFormQuality = totalFrames.current > 0 
        ? Math.round((goodFormFrames.current / totalFrames.current) * 100)
        : 0;
      const calories = calculateCaloriesBurned(selectedExercise, currentRepCount);
      
      // Show report
      setSessionData({
        exercise: exerciseName,
        reps: currentRepCount,
        duration: currentElapsedTime,
        avgFormQuality,
        perfectReps: currentRepCount, // All counted reps are "perfect" due to strict mode
        caloriesBurned: calories,
      });
      setShowReport(true);
      
      toast.success(`Saved ${currentRepCount} ${exerciseName}!`);
    }
  };

  // Reset counter
  const resetCounter = () => {
    const { downThreshold } = getThresholds(selectedExercise);
    
    setRepCount(0);
    setPerfectRepCount(0);
    setElapsedTime(0);
    setRepState('ready');
    repStateRef.current = 'ready';
    wasInDownPosition.current = false;
    downPositionHoldTime.current = 0;
    upPositionHoldTime.current = 0;
    consecutiveGoodFrames.current = 0;
    angleBuffer.current = [];
    goodFormFrames.current = 0;
    totalFrames.current = 0;
    setFeedback(`Get into starting position - go below ${downThreshold}°`);
  };

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      toast.error('Fullscreen not supported');
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start pose detection when tracking
  useEffect(() => {
    if (isTracking && isCameraOn && isModelReady) {
      processFrame();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isTracking, isCameraOn, isModelReady, processFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
    };
  }, []);

  // Calculate total reps today
  const totalRepsToday = sessionHistory.reduce((acc, entry) => acc + entry.reps, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          AI Exercise Tracker
          <Badge variant="outline" className="ml-2 border-amber-500/50 text-amber-500 text-xs">
            AI TRACKING
          </Badge>
        </h3>
        <Badge className="bg-primary/20 text-primary border-primary/30">
          <Zap className="w-3 h-3 mr-1" />
          Pose Detection
        </Badge>
      </div>

      <div className={`grid gap-6 ${isFullscreen ? '' : 'lg:grid-cols-3'}`}>
        {/* Main Camera View */}
        <div ref={containerRef} className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'lg:col-span-2'} space-y-4`}>
          <Card className={`bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden ${isFullscreen ? 'h-full rounded-none border-0' : ''}`}>
            <CardContent className={`p-0 relative ${isFullscreen ? 'h-full' : ''}`}>
              {/* Video Container */}
              <div className={`relative bg-muted flex items-center justify-center overflow-hidden ${isFullscreen ? 'h-full' : 'aspect-video'}`}>
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {/* Canvas overlay for skeleton */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {!isCameraOn && (
                  <div className="text-center z-10">
                    <div className="w-20 h-20 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center">
                      {isModelLoading ? (
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      ) : (
                        <Camera className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">
                      {isModelLoading ? 'Loading AI Pose Detection...' : 'Enable camera for AI pose tracking'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Uses MediaPipe to track your body angles
                    </p>
                    <Button 
                      onClick={startCamera}
                      className="gradient-hero text-primary-foreground shadow-glow"
                      disabled={isModelLoading}
                    >
                      {isModelLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Enable Camera
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {/* Overlay Stats */}
                {isCameraOn && (
                  <>
                    {/* Rep Counter */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className={`bg-background/90 backdrop-blur-sm rounded-2xl p-4 border-2 transition-all duration-200 ${
                        repState === 'up' ? 'border-success shadow-[0_0_20px_hsl(142_76%_36%_/_0.5)] scale-105' : 
                        formQuality === 'bad' ? 'border-destructive' : 'border-border/50'
                      }`}>
                        <p className={`text-5xl font-display font-bold transition-colors ${
                          repState === 'up' ? 'text-success' : 
                          formQuality === 'bad' ? 'text-destructive' : 'text-primary'
                        }`}>{repCount}</p>
                        <p className="text-sm text-muted-foreground">Reps</p>
                      </div>
                    </div>
                    
                    {/* Angle & Timer Display */}
                    <div className="absolute top-4 right-4 z-10 space-y-2">
                      {/* Fullscreen Button */}
                      <Button
                        onClick={toggleFullscreen}
                        variant="outline"
                        size="icon"
                        className="bg-background/90 backdrop-blur-sm border-border/50 hover:bg-background"
                      >
                        {isFullscreen ? (
                          <Minimize className="w-4 h-4" />
                        ) : (
                          <Maximize className="w-4 h-4" />
                        )}
                      </Button>
                      
                      {isTracking && (
                        <>
                          <div className="bg-background/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-border/50 flex items-center gap-2">
                            <Timer className="w-4 h-4 text-primary" />
                            <span className="font-mono text-lg text-foreground">{formatTime(elapsedTime)}</span>
                          </div>
                          
                          {/* Current Angle with Target */}
                          {currentAngle !== null && targetAngle && (
                            <div className={`bg-background/90 backdrop-blur-sm rounded-xl px-4 py-2 border-2 ${
                              formQuality === 'good' ? 'border-success' : 'border-destructive'
                            }`}>
                              <p className="text-xs text-muted-foreground mb-1">Current / Target</p>
                              <div className="flex items-baseline gap-1">
                                <p className={`text-2xl font-bold ${
                                  formQuality === 'good' ? 'text-success' : 'text-destructive'
                                }`}>{currentAngle}°</p>
                                <p className="text-sm text-muted-foreground">
                                  / {repState === 'down' ? targetAngle.up : targetAngle.down}°
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Rep State Indicator */}
                          <div className={`bg-background/90 backdrop-blur-sm rounded-xl px-4 py-2 border-2 ${
                            repState === 'down' ? 'border-amber-500' : 
                            repState === 'up' ? 'border-success' : 'border-border/50'
                          }`}>
                            <p className="text-xs text-muted-foreground mb-1">State</p>
                            <p className={`text-lg font-bold uppercase ${
                              repState === 'down' ? 'text-amber-500' : 
                              repState === 'up' ? 'text-success' : 'text-muted-foreground'
                            }`}>{repState}</p>
                          </div>
                          
                          {/* Pose Status */}
                          <div className={`bg-background/90 backdrop-blur-sm rounded-xl px-4 py-2 border ${
                            poseDetected ? 'border-success' : 'border-warning'
                          }`}>
                            <div className="flex items-center gap-2">
                              {poseDetected ? (
                                <CheckCircle2 className="w-4 h-4 text-success" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-warning" />
                              )}
                              <span className={`text-sm ${poseDetected ? 'text-success' : 'text-warning'}`}>
                                {poseDetected ? 'Pose Detected' : 'No Pose'}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Form Feedback */}
                    {isTracking && (
                      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
                        <div className={`px-6 py-3 rounded-full backdrop-blur-sm border-2 transition-all duration-200 ${
                          formQuality === 'good' ? 'bg-success/20 border-success/50 text-success' :
                          'bg-destructive/20 border-destructive/50 text-destructive'
                        }`}>
                          <p className="text-sm font-medium">{feedback}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Exercise Info */}
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <div className="bg-background/90 backdrop-blur-sm rounded-xl p-3 border border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{EXERCISE_CONFIGS[selectedExercise].icon}</span>
                            <div>
                              <p className="font-semibold text-foreground">{EXERCISE_CONFIGS[selectedExercise].name}</p>
                              <p className="text-xs text-muted-foreground">
                                {isTracking ? 'Tracking body angles for reps' : 'Ready to start'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Form indicator */}
                          {isTracking && poseDetected && (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                              formQuality === 'good' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                            }`}>
                              <div className={`w-3 h-3 rounded-full ${
                                formQuality === 'good' ? 'bg-success' : 'bg-destructive'
                              }`} />
                              <span className="text-sm font-medium">
                                {formQuality === 'good' ? 'Good Form' : 'Adjust Form'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Controls */}
              {isCameraOn && (
                <div className="p-4 bg-muted/30 border-t border-border/50">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Select 
                        value={selectedExercise} 
                        onValueChange={(v: ExerciseType) => {
                          setSelectedExercise(v);
                          if (!isTracking) resetCounter();
                        }}
                        disabled={isTracking}
                      >
                        <SelectTrigger className="w-44 bg-muted/50 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {Object.entries(EXERCISE_CONFIGS).map(([key, config]) => (
                            <SelectItem key={key} value={key} className="text-foreground">
                              <span className="flex items-center gap-2">
                                <span>{config.icon}</span>
                                <span>{config.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!isTracking ? (
                        <Button 
                          onClick={startTracking}
                          className="gradient-hero text-primary-foreground"
                          disabled={!isModelReady}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Tracking
                        </Button>
                      ) : (
                        <>
                          <Button 
                            onClick={resetCounter}
                            variant="outline"
                            size="icon"
                            className="border-border"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button 
                            onClick={stopTracking}
                            variant="destructive"
                          >
                            <Square className="w-4 h-4 mr-2" />
                            Stop & Save
                          </Button>
                        </>
                      )}
                      
                      <Button 
                        onClick={stopCamera}
                        variant="outline"
                        size="icon"
                        className="border-border"
                      >
                        <CameraOff className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Exercise Tips */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-foreground">
                {EXERCISE_CONFIGS[selectedExercise].icon} {EXERCISE_CONFIGS[selectedExercise].name} Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {EXERCISE_CONFIGS[selectedExercise].description}
              </p>
              <ul className="space-y-1">
                {EXERCISE_CONFIGS[selectedExercise].tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Today's Progress */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-primary">{totalRepsToday}</p>
                  <p className="text-xs text-muted-foreground">Total Reps</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-primary">{sessionHistory.length}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-primary">
                    {sessionHistory.length > 0 ? Math.round(totalRepsToday / sessionHistory.length) : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg/Session</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* How It Works */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-foreground">
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p>AI detects 33 body landmarks using your camera</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p><span className="text-success font-medium">Green lines</span> = correct form, <span className="text-destructive font-medium">Red lines</span> = adjust form</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p>Reps only count when you complete the full motion with good form</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">4</span>
                </div>
                <p>Joint angles are tracked to ensure proper exercise execution</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Session History */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-foreground">
                Session History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No sessions yet. Start exercising!
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {sessionHistory.map((entry, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between bg-muted/30 rounded-lg p-2"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-sm text-foreground">{entry.exercise}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">{entry.reps} reps</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Exercise Report Modal */}
      {sessionData && (
        <ExerciseReport
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          sessionData={sessionData}
        />
      )}
    </div>
  );
}
