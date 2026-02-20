import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FitnessRecommendation } from '@/types/fitness';
import { toast } from 'sonner';
import { HealthData, ProgressRecord } from './useUserData';

const CACHE_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

function loadCachedRecommendations(): FitnessRecommendation | null {
  try {
    const cached = localStorage.getItem('cachedRecommendations');
    if (cached) {
      const { recommendations, timestamp } = JSON.parse(cached);
      if (timestamp && Date.now() - timestamp < CACHE_MAX_AGE_MS) {
        return recommendations;
      }
    }
  } catch {}
  return null;
}

interface GenerateParams {
  name: string;
  healthData: HealthData;
  progressHistory: ProgressRecord[];
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<FitnessRecommendation | null>(() => loadCachedRecommendations());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecommendations = useCallback(async ({ name, healthData, progressHistory }: GenerateParams) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-recommendations', {
        body: {
          userData: {
            name,
            age: healthData.age,
            gender: healthData.gender,
            height: healthData.height,
            weight: healthData.weight,
            healthConditions: healthData.health_conditions,
            diseaseStages: healthData.disease_stages,
            dietPreference: healthData.diet_preference || 'non_vegetarian',
            progressHistory: progressHistory.map(p => ({
              weight: p.weight,
              bmi: p.bmi,
              recorded_at: p.recorded_at,
            })),
          },
        },
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        // Cache in localStorage as fallback
        localStorage.setItem('cachedRecommendations', JSON.stringify({
          recommendations: data.recommendations,
          timestamp: Date.now(),
          healthDataHash: JSON.stringify(healthData),
        }));
      }
    } catch (err) {
      console.error('Failed to generate recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
      
      // Try to use cached recommendations as fallback
      const cached = localStorage.getItem('cachedRecommendations');
      if (cached) {
        const { recommendations: cachedRecs } = JSON.parse(cached);
        setRecommendations(cachedRecs);
        toast.warning('Using cached recommendations. AI service temporarily unavailable.');
      } else {
        toast.error('Failed to generate recommendations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recommendations,
    loading,
    error,
    generateRecommendations,
  };
}
