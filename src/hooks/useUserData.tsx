import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
}

export interface HealthData {
  id: string;
  user_id: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  health_conditions: string[];
  disease_stages: Record<string, string>;
  diet_preference: 'vegan' | 'vegetarian' | 'non_vegetarian';
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  best_streak: number;
  total_workouts: number;
  last_workout_date: string | null;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge_name: string;
  earned_at: string;
}

export interface ProgressRecord {
  id: string;
  user_id: string;
  weight: number;
  bmi: number;
  health_conditions: string[];
  workout_completed: boolean;
  notes: string | null;
  recorded_at: string;
}

interface DataCache {
  data: {
    profile: Profile | null;
    healthData: HealthData | null;
    streak: UserStreak | null;
    badges: UserBadge[];
    progressHistory: ProgressRecord[];
  } | null;
  timestamp: number;
  userId: string | null;
}

let dataCache: DataCache = { data: null, timestamp: 0, userId: null };
const DATA_CACHE_MAX_AGE_MS = 2 * 60 * 1000; // 2 minutes

export function useUserData() {
  const { user } = useAuth();

  const cachedForUser = dataCache.userId === user?.id && dataCache.data && (Date.now() - dataCache.timestamp < DATA_CACHE_MAX_AGE_MS);

  const [profile, setProfile] = useState<Profile | null>(cachedForUser ? dataCache.data!.profile : null);
  const [healthData, setHealthData] = useState<HealthData | null>(cachedForUser ? dataCache.data!.healthData : null);
  const [streak, setStreak] = useState<UserStreak | null>(cachedForUser ? dataCache.data!.streak : null);
  const [badges, setBadges] = useState<UserBadge[]>(cachedForUser ? dataCache.data!.badges : []);
  const [progressHistory, setProgressHistory] = useState<ProgressRecord[]>(cachedForUser ? dataCache.data!.progressHistory : []);
  const [loading, setLoading] = useState(!cachedForUser);
  const workoutLockRef = useRef(false);

  const fetchUserData = useCallback(async (background = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (!background) setLoading(true);
    try {
      const [profileRes, healthRes, streakRes, badgesRes, progressRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('health_data').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_badges').select('*').eq('user_id', user.id),
        supabase.from('progress_history').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(30),
      ]);

      if (profileRes.data) setProfile(profileRes.data as Profile);
      if (healthRes.data) setHealthData(healthRes.data as HealthData);
      if (streakRes.data) setStreak(streakRes.data as UserStreak);
      if (badgesRes.data) setBadges(badgesRes.data as UserBadge[]);
      if (progressRes.data) setProgressHistory(progressRes.data as ProgressRecord[]);

      dataCache = {
        data: {
          profile: (profileRes.data as Profile) || null,
          healthData: (healthRes.data as HealthData) || null,
          streak: (streakRes.data as UserStreak) || null,
          badges: (badgesRes.data as UserBadge[]) || [],
          progressHistory: (progressRes.data as ProgressRecord[]) || [],
        },
        timestamp: Date.now(),
        userId: user.id,
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (!background) toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const isCached = dataCache.userId === user?.id && dataCache.data && (Date.now() - dataCache.timestamp < DATA_CACHE_MAX_AGE_MS);
    fetchUserData(!!isCached);
  }, [fetchUserData]);

  const saveHealthData = async (data: Omit<HealthData, 'id' | 'user_id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      if (healthData) {
        const { error } = await supabase
          .from('health_data')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('health_data')
          .insert({ user_id: user.id, ...data });

        if (error) throw error;
      }

      const bmi = data.weight / (data.height * data.height);
      await supabase.from('progress_history').insert({
        user_id: user.id,
        weight: data.weight,
        bmi,
        health_conditions: data.health_conditions,
      });

      await fetchUserData();
      return { error: null };
    } catch (error) {
      console.error('Error saving health data:', error);
      return { error: error as Error };
    }
  };

  const completeWorkout = async () => {
    if (!user || !streak) return;

    // Prevent concurrent calls via ref lock
    if (workoutLockRef.current) {
      toast.info('Workout is being saved...');
      return;
    }

    workoutLockRef.current = true;

    try {
      // Use atomic database function for race-condition-safe workout completion
      const { data, error } = await supabase.rpc('complete_workout_atomic', {
        p_user_id: user.id,
      });

      if (error) throw error;

      const result = data as any;

      if (result?.already_completed) {
        toast.info('You already completed your workout today! 🎯');
        return;
      }

      // Show badge notifications
      if (result?.new_badges && result.new_badges.length > 0) {
        result.new_badges.forEach((badge: string) => {
          toast.success(`🏆 Achievement Unlocked: ${badge}!`);
        });
      }

      await fetchUserData();
      toast.success('Workout completed! Keep up the great work! 💪');
    } catch (error) {
      console.error('Error completing workout:', error);
      toast.error('Failed to save workout progress');
    } finally {
      workoutLockRef.current = false;
    }
  };

  return {
    profile,
    healthData,
    streak,
    badges,
    progressHistory,
    loading,
    saveHealthData,
    completeWorkout,
    refetch: fetchUserData,
  };
}
