import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Clock, Target, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

interface SessionData {
  exercise: string; reps: number; duration: number; avgFormQuality: number;
  perfectReps: number; caloriesBurned: number;
}

interface ExerciseReportProps {
  isOpen: boolean; onClose: () => void; sessionData: SessionData;
}

const CALORIES_PER_REP: Record<string, number> = { squats: 0.32, pushups: 0.36 };

export function ExerciseReport({ isOpen, onClose, sessionData }: ExerciseReportProps) {
  const { exercise, reps, duration, avgFormQuality, perfectReps, caloriesBurned } = sessionData;
  
  const formattedDuration = () => {
    const mins = Math.floor(duration / 60); const secs = duration % 60;
    return mins === 0 ? `${secs}s` : `${mins}m ${secs}s`;
  };
  
  const getGrade = () => {
    if (avgFormQuality >= 90) return { grade: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (avgFormQuality >= 80) return { grade: 'A', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (avgFormQuality >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (avgFormQuality >= 60) return { grade: 'C', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { grade: 'D', color: 'text-red-500', bg: 'bg-red-50' };
  };
  
  const grade = getGrade();
  const repsPerMinute = duration > 0 ? Math.round((reps / duration) * 60) : 0;
  const perfectRatio = reps > 0 ? Math.round((perfectReps / reps) * 100) : 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-display flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> Workout Complete!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <div className={`w-24 h-24 rounded-full ${grade.bg} mx-auto flex items-center justify-center mb-2`}>
              <span className={`text-4xl font-bold ${grade.color}`}>{grade.grade}</span>
            </div>
            <p className="text-sm text-muted-foreground">Overall Performance</p>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{exercise === 'Squats' ? '🏋️' : '💪'}</span>
                <span className="font-semibold text-lg">{exercise}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-gray-200 text-xs font-medium">{formattedDuration()}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Target className="w-4 h-4 text-gray-900" />, value: reps, label: 'Total Reps', color: 'text-gray-900' },
                { icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, value: perfectReps, label: 'Perfect Reps', color: 'text-emerald-600' },
                { icon: <Flame className="w-4 h-4 text-orange-500" />, value: caloriesBurned.toFixed(1), label: 'Calories', color: 'text-orange-500' },
                { icon: <TrendingUp className="w-4 h-4 text-blue-600" />, value: repsPerMinute, label: 'Reps/Min', color: 'text-blue-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl p-3 text-center border border-gray-100">
                  <div className="flex items-center justify-center gap-1 mb-1">{stat.icon}</div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Form Quality</span>
              <span className={`text-sm font-bold ${grade.color}`}>{avgFormQuality}%</span>
            </div>
            <Progress value={avgFormQuality} className="h-2" />
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>Perfect Rep Ratio</span><span className="font-medium text-foreground">{perfectRatio}%</span>
            </div>
            <Progress value={perfectRatio} className="h-1.5 mt-1" />
          </div>
          <div className={`rounded-2xl border p-3 ${avgFormQuality < 70 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="flex items-start gap-2">
              {avgFormQuality < 70 ? <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              <p className="text-sm">
                {avgFormQuality >= 80 ? 'Excellent work! Your form is on point.' :
                 avgFormQuality >= 60 ? 'Good job! Focus on holding positions longer.' :
                 'Keep practicing! Try to match the target angles.'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 h-10 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors">Close</button>
            <button onClick={onClose} className="flex-1 h-10 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">Continue</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function calculateCaloriesBurned(exercise: string, reps: number): number {
  const caloriesPerRep = CALORIES_PER_REP[exercise.toLowerCase()] || 0.3;
  return reps * caloriesPerRep;
}
