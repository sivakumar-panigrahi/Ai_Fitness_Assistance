import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { useRecommendations } from '@/hooks/useRecommendations';
import { HealthDataForm } from '@/components/HealthDataForm';
import { DashboardNew } from '@/components/DashboardNew';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, healthData, streak, badges, progressHistory, loading: dataLoading, saveHealthData, completeWorkout, refetch } = useUserData();
  const { recommendations, loading: recLoading, generateRecommendations } = useRecommendations();
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  useEffect(() => {
    if (profile && healthData && !recommendations && !recLoading) {
      generateRecommendations({ name: profile.name, healthData, progressHistory });
    }
  }, [profile, healthData, recommendations, recLoading, progressHistory, generateRecommendations]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e8eaf6] via-[#f0f2ff] to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-foreground" />
          <p className="text-muted-foreground">Loading your fitness profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  if (!healthData || showUpdateForm) {
    return (
      <HealthDataForm
        existingData={healthData}
        isUpdate={showUpdateForm && !!healthData}
        onSubmit={async (data) => {
          const result = await saveHealthData(data);
          if (!result.error) {
            setShowUpdateForm(false);
            if (profile) {
              await refetch();
              generateRecommendations({
                name: profile.name,
                healthData: { ...healthData!, ...data, id: healthData?.id || '', user_id: user.id, diet_preference: data.diet_preference || healthData?.diet_preference || 'non_vegetarian' },
                progressHistory,
              });
            }
          }
        }}
      />
    );
  }

  if (profile && healthData) {
    return (
      <DashboardNew
        profile={profile}
        healthData={healthData}
        recommendations={recommendations || {
          exercises: [], yogaVideos: [],
          dietPlan: { meals: [], guidelines: [], restrictions: [] },
          sleepRecommendation: { minHours: 7, maxHours: 9, tips: [] },
          warnings: [],
        }}
        streak={streak}
        badges={badges}
        progressHistory={progressHistory}
        onCompleteWorkout={completeWorkout}
        onUpdateData={() => setShowUpdateForm(true)}
        onLogout={signOut}
        isGenerating={recLoading}
      />
    );
  }

  return null;
};

export default Index;
