import { useState, useEffect } from 'react';
import { UserProfile, FitnessRecommendation, UserProgress } from '@/types/fitness';
import { calculateBMI, getBMICategory, getAgeGroup, badgeDefinitions, getDailyVideos } from '@/lib/fitnessEngine';
import { VideoPlayer } from './VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BadgeCelebration } from '@/components/BadgeCelebration';
import {
  Activity,
  Dumbbell,
  Salad,
  Moon,
  Trophy,
  Play,
  ExternalLink,
  AlertTriangle,
  Flame,
  Target,
  TrendingUp,
  Heart,
  Clock,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  recommendations: FitnessRecommendation;
  onLogout: () => void;
}

export function Dashboard({ profile, recommendations, onLogout }: DashboardProps) {
  const [progress, setProgress] = useState<UserProgress>({
    currentStreak: 5,
    longestStreak: 12,
    totalWorkouts: 23,
    badges: badgeDefinitions.map((b, i) => ({
      ...b,
      earned: i < 2,
      earnedDate: i < 2 ? new Date() : undefined,
    })),
  });

  // Badge celebration state
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<{ name: string; id: string } | null>(null);

  const bmi = calculateBMI(profile.weight, profile.height);
  const bmiCategory = getBMICategory(bmi);
  const ageGroup = getAgeGroup(profile.age);
  const dailyVideos = getDailyVideos(profile.age);

  const handleCompleteWorkout = () => {
    const newStreak = progress.currentStreak + 1;
    const newTotalWorkouts = progress.totalWorkouts + 1;

    // Check if any new badge is earned
    const updatedBadges = progress.badges.map(badge => {
      if (!badge.earned && newStreak >= badge.daysRequired) {
        // Show celebration for newly earned badge
        setTimeout(() => {
          setEarnedBadge({ name: badge.name, id: badge.id });
          setShowBadgeCelebration(true);
        }, 500);
        return { ...badge, earned: true, earnedDate: new Date() };
      }
      return badge;
    });

    setProgress(prev => ({
      ...prev,
      currentStreak: newStreak,
      totalWorkouts: newTotalWorkouts,
      lastWorkoutDate: new Date(),
      badges: updatedBadges,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">FitCoach AI</h1>
                <p className="text-primary-foreground/80 text-sm">Your Personal Wellness Guide</p>
              </div>
            </div>
            <Button variant="glass" onClick={onLogout}>
              Logout
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center text-3xl">
              {profile.gender === 'male' ? '👨' : profile.gender === 'female' ? '👩' : '🧑'}
            </div>
            <div>
              <h2 className="text-xl font-semibold">Welcome back, {profile.name}!</h2>
              <p className="text-primary-foreground/80">
                {ageGroup === 'child' ? 'Teen' : ageGroup === 'young' ? 'Adult' : 'Senior'} •
                {profile.age} years •
                BMI: {bmi.toFixed(1)} ({bmiCategory})
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Warnings */}
      {recommendations.warnings.length > 0 && (
        <div className="container max-w-6xl mx-auto px-4 -mt-4">
          <Card className="border-warning bg-warning/10 shadow-soft">
            <CardContent className="p-4">
              {recommendations.warnings.map((warning, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <p>{warning}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Cards */}
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-hover shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-xl gradient-hero mx-auto mb-2 flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary-foreground" />
              </div>
              <p className="text-2xl font-bold">{progress.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>

          <Card className="card-hover shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-xl gradient-warm mx-auto mb-2 flex items-center justify-center">
                <Target className="w-6 h-6 text-secondary-foreground" />
              </div>
              <p className="text-2xl font-bold">{progress.totalWorkouts}</p>
              <p className="text-sm text-muted-foreground">Workouts</p>
            </CardContent>
          </Card>

          <Card className="card-hover shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-info mx-auto mb-2 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-info-foreground" />
              </div>
              <p className="text-2xl font-bold">{progress.longestStreak}</p>
              <p className="text-sm text-muted-foreground">Best Streak</p>
            </CardContent>
          </Card>

          <Card className="card-hover shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-success mx-auto mb-2 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-success-foreground" />
              </div>
              <p className="text-2xl font-bold">{progress.badges.filter(b => b.earned).length}</p>
              <p className="text-sm text-muted-foreground">Badges</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="container max-w-6xl mx-auto px-4 pb-8">
        <Tabs defaultValue="exercises" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-14 bg-muted p-1 rounded-xl">
            <TabsTrigger value="exercises" className="rounded-lg data-[state=active]:gradient-hero data-[state=active]:text-primary-foreground">
              <Dumbbell className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Exercises</span>
            </TabsTrigger>
            <TabsTrigger value="yoga" className="rounded-lg data-[state=active]:gradient-hero data-[state=active]:text-primary-foreground">
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Yoga</span>
            </TabsTrigger>
            <TabsTrigger value="diet" className="rounded-lg data-[state=active]:gradient-hero data-[state=active]:text-primary-foreground">
              <Salad className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Diet</span>
            </TabsTrigger>
            <TabsTrigger value="sleep" className="rounded-lg data-[state=active]:gradient-hero data-[state=active]:text-primary-foreground">
              <Moon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sleep</span>
            </TabsTrigger>
          </TabsList>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-semibold">Today's Workout</h3>
              <Button variant="hero" size="sm" onClick={handleCompleteWorkout}>
                Complete Workout
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.exercises.map((exercise, i) => (
                <Card key={i} className="card-hover shadow-soft overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl">
                        {exercise.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{exercise.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="w-3 h-3" />
                            {exercise.duration}
                          </Badge>
                          <Badge
                            className={
                              exercise.intensity === 'low' ? 'bg-success text-success-foreground' :
                                exercise.intensity === 'medium' ? 'bg-warning text-warning-foreground' :
                                  'bg-destructive text-destructive-foreground'
                            }
                          >
                            {exercise.intensity} intensity
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Yoga Tab */}
          <TabsContent value="yoga" className="space-y-4 animate-fade-in">
            <div className="space-y-6">
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  <h4 className="font-display font-semibold text-lg">Today's Recommended Routines</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {dailyVideos.exercise.map((id) => (
                    <VideoPlayer key={id} videoId={id} title="Workout Session" />
                  ))}
                </div>
              </div>

              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  <h4 className="font-display font-semibold text-lg">Today's Guided Yoga</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {dailyVideos.yoga.map((id) => (
                    <VideoPlayer key={id} videoId={id} title="Yoga Practice" />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Diet Tab */}
          <TabsContent value="diet" className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-display font-semibold">Your Diet Plan</h3>

            {/* Meals */}
            <div className="space-y-4">
              {recommendations.dietPlan.meals.map((meal, i) => (
                <Card key={i} className="shadow-soft" style={{ animationDelay: `${i * 100}ms` }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{meal.name}</h4>
                          <span className="text-sm text-muted-foreground">{meal.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{meal.items.join(' • ')}</p>
                        <Badge variant="secondary" className="mt-2">{meal.calories} kcal</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Guidelines */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-soft border-success/30 bg-success/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-success">
                    ✓ Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm">
                    {recommendations.dietPlan.guidelines.map((g, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-success">•</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {recommendations.dietPlan.restrictions.length > 0 && (
                <Card className="shadow-soft border-destructive/30 bg-destructive/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-destructive">
                      ✗ Avoid
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 text-sm">
                      {recommendations.dietPlan.restrictions.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-destructive">•</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Sleep Tab */}
          <TabsContent value="sleep" className="space-y-4 animate-fade-in">
            <h3 className="text-xl font-display font-semibold">Sleep Recommendations</h3>

            <Card className="shadow-soft overflow-hidden">
              <div className="gradient-hero p-6 text-primary-foreground">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Moon className="w-8 h-8" />
                </div>
                <p className="text-center text-5xl font-display font-bold mb-2">
                  {recommendations.sleepRecommendation.minHours}–{recommendations.sleepRecommendation.maxHours}
                </p>
                <p className="text-center text-primary-foreground/80">hours of sleep recommended</p>
              </div>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Tips for Better Sleep</h4>
                <ul className="space-y-3">
                  {recommendations.sleepRecommendation.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-primary text-xs font-semibold">{i + 1}</span>
                      </div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Badges Section */}
        <div className="mt-8">
          <h3 className="text-xl font-display font-semibold mb-4">Your Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {progress.badges.map((badge, i) => (
              <Card
                key={badge.id}
                className={`card-hover shadow-soft text-center ${badge.earned ? '' : 'opacity-50 grayscale'}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="p-4">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h4 className="font-semibold text-sm">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  {badge.earned && (
                    <Badge variant="secondary" className="mt-2 text-xs">Earned!</Badge>
                  )}
                  {!badge.earned && (
                    <div className="mt-2">
                      <Progress value={(progress.currentStreak / badge.daysRequired) * 100} className="h-1" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {progress.currentStreak}/{badge.daysRequired} days
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Badge Celebration Modal */}
      <BadgeCelebration
        isOpen={showBadgeCelebration}
        onClose={() => setShowBadgeCelebration(false)}
        badgeName={earnedBadge?.name || ''}
        badgeId={earnedBadge?.id || ''}
      />
    </div>
  );
}
