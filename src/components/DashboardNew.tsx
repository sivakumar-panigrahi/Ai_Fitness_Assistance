import { useState } from 'react';
import { FitnessRecommendation } from '@/types/fitness';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, Dumbbell, Salad, Moon, Trophy, Play, ExternalLink,
  AlertTriangle, Flame, Target, TrendingUp, Heart, Clock,
  RefreshCw, LogOut, Loader2, Sparkles, Zap, Camera,
  Sun, Sunrise, Sunset
} from 'lucide-react';
import { UserStreak, UserBadge, HealthData, Profile, ProgressRecord } from '@/hooks/useUserData';
import { ExerciseTracker } from './ExerciseTracker';
import { getAgeGroupLabel } from '@/lib/fitnessEngine';

interface DashboardNewProps {
  profile: Profile;
  healthData: HealthData;
  recommendations: FitnessRecommendation;
  streak: UserStreak | null;
  badges: UserBadge[];
  progressHistory: ProgressRecord[];
  onCompleteWorkout: () => Promise<void>;
  onUpdateData: () => void;
  onLogout: () => void;
  isGenerating?: boolean;
}

const badgeDefinitions = [
  { id: 'bronze', name: 'Bronze Badge', icon: '🥉', description: '3 day streak', daysRequired: 3, cardBg: 'bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100', border: 'border-orange-300', iconBg: 'bg-gradient-to-br from-orange-400 to-amber-500', earnedBg: 'bg-orange-500', progressColor: '[&>div]:bg-orange-400', titleColor: 'text-orange-800', iconShadow: 'shadow-[0_0_12px_rgba(234,88,12,0.5)]' },
  { id: 'silver', name: 'Silver Badge', icon: '🥈', description: '7 day streak', daysRequired: 7, cardBg: 'bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100', border: 'border-indigo-300', iconBg: 'bg-gradient-to-br from-indigo-400 to-blue-500', earnedBg: 'bg-indigo-500', progressColor: '[&>div]:bg-indigo-400', titleColor: 'text-indigo-800', iconShadow: 'shadow-[0_0_12px_rgba(99,102,241,0.5)]' },
  { id: 'gold', name: 'Gold Badge', icon: '🥇', description: '30 day streak', daysRequired: 30, cardBg: 'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100', border: 'border-yellow-400', iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-500', earnedBg: 'bg-yellow-500', progressColor: '[&>div]:bg-yellow-400', titleColor: 'text-yellow-800', iconShadow: 'shadow-[0_0_12px_rgba(234,179,8,0.5)]' },
];

const motivationalQuotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Fitness is not about being better than someone else. It's about being better than you used to be.",
  "Take care of your body. It's the only place you have to live.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Don't stop when you're tired. Stop when you're done.",
  "Small daily improvements lead to staggering long-term results.",
];

function getGreeting(): { text: string; icon: typeof Sun } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: Sunrise };
  if (hour < 17) return { text: 'Good afternoon', icon: Sun };
  return { text: 'Good evening', icon: Sunset };
}

function getDailyQuote(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return motivationalQuotes[dayOfYear % motivationalQuotes.length];
}

export function DashboardNew({ 
  profile, healthData, recommendations, streak, badges, progressHistory,
  onCompleteWorkout, onUpdateData, onLogout, isGenerating 
}: DashboardNewProps) {
  const [completingWorkout, setCompletingWorkout] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('fitcoach-active-tab') || 'exercises');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('fitcoach-active-tab', value);
  };

  const bmi = healthData.weight / (healthData.height * healthData.height);
  const bmiCategory = bmi < 18.5 ? 'underweight' : bmi < 25 ? 'normal' : bmi < 30 ? 'overweight' : 'obese';
  const ageGroupLabel = getAgeGroupLabel(healthData.age);
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const handleCompleteWorkout = async () => {
    setCompletingWorkout(true);
    await onCompleteWorkout();
    setCompletingWorkout(false);
  };

  const weightChange = progressHistory.length >= 2
    ? progressHistory[0].weight - progressHistory[progressHistory.length - 1].weight
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8eaf6] via-[#f0f2ff] to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-5">
            <span className="font-display font-bold text-xl text-foreground">FitCoach AI</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onUpdateData} className="text-xs rounded-full">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Update
              </Button>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground text-xs">
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout
              </Button>
            </div>
          </div>

          {/* Greeting */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-2xl">
              {healthData.gender === 'male' ? '👨' : healthData.gender === 'female' ? '👩' : '🧑'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <GreetingIcon className="w-4 h-4 text-amber-500" />
                <h2 className="text-lg font-display font-semibold text-foreground truncate">
                  {greeting.text}, {profile.name}!
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {ageGroupLabel} • BMI: <span className={
                  bmiCategory === 'normal' ? 'text-emerald-600' :
                  bmiCategory === 'underweight' ? 'text-amber-600' : 'text-red-500'
                }>{bmi.toFixed(1)}</span> ({bmiCategory})
                {weightChange !== 0 && (
                  <span className={weightChange < 0 ? 'text-emerald-600' : 'text-amber-600'}>
                    {' '}• {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                  </span>
                )}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic mt-3 px-1">"{getDailyQuote()}"</p>
        </div>
      </header>

      {/* Warnings */}
      {recommendations.warnings && recommendations.warnings.length > 0 && (
        <div className="container max-w-6xl mx-auto px-4 pt-5">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            {recommendations.warnings.map((warning, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-foreground">{warning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Message */}
      {(recommendations as any).personalizedMessage && (
        <div className="container max-w-6xl mx-auto px-4 pt-4">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{(recommendations as any).personalizedMessage}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="container max-w-6xl mx-auto px-4 py-5">
        <div className="grid grid-cols-4 gap-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/50 rounded-2xl border border-indigo-100/80 p-4 shadow-sm">
          <div className="col-span-2 md:col-span-1 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gray-900 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{streak?.current_streak || 0}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </div>
          {[
            { label: 'Workouts', value: streak?.total_workouts || 0 },
            { label: 'Best Streak', value: streak?.best_streak || 0 },
            { label: 'Badges', value: badges.length },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 pb-8">
        {isGenerating ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-foreground" />
            <h3 className="text-lg font-display font-semibold mb-2">Generating Your Plan...</h3>
            <p className="text-sm text-muted-foreground">Analyzing your health profile</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-5">
            <TabsList className="grid w-full grid-cols-5 h-11 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="exercises" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Dumbbell className="w-3.5 h-3.5 sm:mr-1.5 text-orange-500" /><span className="hidden sm:inline">Exercise</span>
              </TabsTrigger>
              <TabsTrigger value="tracker" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Camera className="w-3.5 h-3.5 sm:mr-1.5 text-blue-500" /><span className="hidden sm:inline">Tracker</span>
              </TabsTrigger>
              <TabsTrigger value="yoga" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Heart className="w-3.5 h-3.5 sm:mr-1.5 text-rose-500" /><span className="hidden sm:inline">Yoga</span>
              </TabsTrigger>
              <TabsTrigger value="diet" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Salad className="w-3.5 h-3.5 sm:mr-1.5 text-emerald-500" /><span className="hidden sm:inline">Diet</span>
              </TabsTrigger>
              <TabsTrigger value="sleep" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Moon className="w-3.5 h-3.5 sm:mr-1.5 text-indigo-500" /><span className="hidden sm:inline">Sleep</span>
              </TabsTrigger>
            </TabsList>

            {/* Exercises Tab */}
            <TabsContent value="exercises" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-semibold">Today's Workout</h3>
                <button onClick={handleCompleteWorkout} disabled={completingWorkout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 disabled:opacity-50">
                  {completingWorkout ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  Complete Workout
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {recommendations.exercises?.map((exercise, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
                    {(exercise as any).imageUrl && (
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        <img src={(exercise as any).imageUrl} alt={`${exercise.name} demonstration`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">
                          {exercise.icon || '🏋️'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-semibold text-foreground">{exercise.name}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{exercise.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" /> {exercise.duration}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              exercise.intensity === 'low' ? 'bg-emerald-100 text-emerald-700' :
                              exercise.intensity === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>{exercise.intensity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tracker" className="space-y-4">
              <ExerciseTracker />
            </TabsContent>

            {/* Yoga Tab */}
            <TabsContent value="yoga" className="space-y-4">
              <h3 className="text-lg font-display font-semibold">Recommended Yoga</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {recommendations.yogaVideos?.map((video, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                      <img src={video.thumbnail || `https://img.youtube.com/vi/${video.url.split('v=')[1]?.split('&')[0]}/hqdefault.jpg`}
                        alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={video.url} target="_blank" rel="noopener noreferrer"
                          className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-gray-900 fill-gray-900" />
                        </a>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-display font-semibold text-sm mb-1">{video.title}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-muted-foreground">{video.duration}</span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-muted-foreground capitalize">{video.difficulty}</span>
                        <a href={video.url} target="_blank" rel="noopener noreferrer"
                          className="ml-auto text-blue-600 hover:underline text-xs flex items-center gap-1">
                          Watch <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Diet Tab */}
            <TabsContent value="diet" className="space-y-5">
              <h3 className="text-lg font-display font-semibold">Your Diet Plan</h3>
              <div className="space-y-3">
                {recommendations.dietPlan?.meals?.map((meal, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="font-display font-semibold text-sm">{meal.name}</h4>
                          <span className="text-xs text-muted-foreground">{meal.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{meal.items?.join(' • ')}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{meal.calories} kcal</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {recommendations.dietPlan?.guidelines && recommendations.dietPlan.guidelines.length > 0 && (
                  <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
                    <h4 className="text-sm font-semibold text-emerald-700 mb-2">✓ Guidelines</h4>
                    <ul className="space-y-1.5 text-xs">
                      {recommendations.dietPlan.guidelines.map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground">
                          <span className="text-emerald-500">•</span>{g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {recommendations.dietPlan?.restrictions && recommendations.dietPlan.restrictions.length > 0 && (
                  <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
                    <h4 className="text-sm font-semibold text-red-700 mb-2">✗ Avoid</h4>
                    <ul className="space-y-1.5 text-xs">
                      {recommendations.dietPlan.restrictions.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground">
                          <span className="text-red-500">•</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Sleep Tab */}
            <TabsContent value="sleep" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-semibold">Sleep Recommendations</h3>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{ageGroupLabel}</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                {/* Sleep schedule bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Recommended Schedule</span>
                    <span className="text-xs text-blue-600 font-medium">
                      {recommendations.sleepRecommendation?.minHours || 7}-{recommendations.sleepRecommendation?.maxHours || 9}h
                    </span>
                  </div>
                  <div className="relative h-10 rounded-xl bg-gray-100 overflow-hidden">
                    <div className="absolute inset-0 flex">
                      <div className="bg-amber-100/60 border-r border-gray-200/50" style={{ width: '29%' }} />
                      <div className="bg-emerald-100/60 border-r border-gray-200/50" style={{ width: '38%' }} />
                      <div className="bg-blue-100/60 border-r border-gray-200/50" style={{ width: '8%' }} />
                      <div className="bg-blue-200/60" style={{ width: '25%' }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] text-muted-foreground">
                      <span>6AM</span><span>12PM</span><span>6PM</span><span>10PM</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Moon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">
                      {recommendations.sleepRecommendation?.minHours || 7} - {recommendations.sleepRecommendation?.maxHours || 9} hours
                    </p>
                    <p className="text-xs text-muted-foreground">Recommended for {ageGroupLabel.toLowerCase()}</p>
                  </div>
                </div>

                {recommendations.sleepRecommendation?.tips && recommendations.sleepRecommendation.tips.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-display font-semibold text-sm">Sleep Tips for Your Age</h4>
                    <ul className="space-y-2">
                      {recommendations.sleepRecommendation.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                          <span className="text-blue-500 mt-0.5 text-sm">💤</span>
                          <span className="text-xs text-foreground">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Achievements */}
        <div className="mt-8">
          <h3 className="text-lg font-display font-semibold mb-4">Achievements</h3>
          <div className="grid grid-cols-3 gap-3">
            {badgeDefinitions.map((badge) => {
              const isEarned = badges.some(b => b.badge_id === badge.id);
              const progress = Math.min((streak?.current_streak || 0) / badge.daysRequired * 100, 100);
              return (
                <div key={badge.id} className={`${badge.cardBg} rounded-2xl border ${badge.border} p-3 text-center shadow-sm transition-all hover:scale-105 hover:shadow-md ${isEarned ? 'ring-2 ring-offset-2 ring-current' : ''}`}>
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-xl ${badge.iconBg} ${badge.iconShadow} flex items-center justify-center ${isEarned ? 'animate-badge-bounce' : 'opacity-50 grayscale'}`}>
                    <span className={`text-2xl drop-shadow-md ${badge.id === 'bronze' ? 'drop-shadow-[0_0_6px_rgba(205,127,50,0.7)]' : badge.id === 'silver' ? 'drop-shadow-[0_0_6px_rgba(99,102,241,0.7)]' : 'drop-shadow-[0_0_6px_rgba(234,179,8,0.7)]'}`}>{badge.icon}</span>
                  </div>
                  <h4 className={`font-display font-bold text-xs ${badge.titleColor}`}>{badge.name}</h4>
                  <p className="text-[10px] text-muted-foreground mb-1.5">{badge.description}</p>
                  {!isEarned && (
                    <div className="space-y-1">
                      <Progress value={progress} className={`h-1.5 rounded-full bg-white/60 ${badge.progressColor}`} />
                      <p className="text-[10px] text-muted-foreground font-medium">{streak?.current_streak || 0}/{badge.daysRequired}</p>
                    </div>
                  )}
                  {isEarned && (
                    <span className={`inline-block px-2 py-0.5 rounded-full ${badge.earnedBg} text-white text-[10px] font-bold shadow-sm`}>Earned! ✨</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
