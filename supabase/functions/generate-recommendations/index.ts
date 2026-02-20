import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface UserHealthData {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  healthConditions: string[];
  diseaseStages: Record<string, string>;
  dietPreference: 'vegan' | 'vegetarian' | 'non_vegetarian';
  progressHistory?: Array<{
    weight: number;
    bmi: number;
    recorded_at: string;
  }>;
}

// Curated exercise images
const exerciseImages: Record<string, string> = {
  'walking': 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=300&fit=crop',
  'brisk walking': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
  'running': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop',
  'jogging': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop',
  'cycling': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop',
  'stretching': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
  'full body stretch': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
  'yoga': 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400&h=300&fit=crop',
  'chair yoga': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
  'swimming': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop',
  'light swimming': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop',
  'push-ups': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop',
  'squats': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop',
  'lunges': 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=300&fit=crop',
  'planks': 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop',
  'plank': 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop',
  'hiit': 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400&h=300&fit=crop',
  'hiit workout': 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400&h=300&fit=crop',
  'dance': 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=300&fit=crop',
  'dance workout': 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=300&fit=crop',
  'jump rope': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&h=300&fit=crop',
  'chair exercises': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
  'seated exercises': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
  'default': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
};

const verifiedYogaVideos = [
  { id: 'fmh58tykgpo', title: 'Yoga For Diabetes - 30 Min Practice', duration: '30 min', difficulty: 'beginner', conditions: ['diabetes', 'general'] },
  { id: 'Jf5qUhz-FVk', title: 'Isha Upa Yoga - Complete Practice', duration: '45 min', difficulty: 'beginner', conditions: ['general', 'stress'] },
  { id: 'NDp_jRfVA5k', title: 'Yoga for High Blood Pressure', duration: '20 min', difficulty: 'beginner', conditions: ['hypertension', 'heart'] },
  { id: 'EVb7mE9VtW8', title: 'Morning Yoga For Beginners - 10 Min', duration: '10 min', difficulty: 'beginner', conditions: ['general', 'morning'] },
  { id: 'nNiRy3Gk27o', title: 'Gentle Yoga for Seniors', duration: '25 min', difficulty: 'beginner', conditions: ['senior', 'gentle'] },
  { id: 'Ci1cT8OmNjY', title: 'Yoga for Weight Loss - Full Body', duration: '35 min', difficulty: 'intermediate', conditions: ['obesity', 'weight_loss'] },
  { id: 'ubqaJKoErTc', title: 'Breathing Exercises for Respiratory Health', duration: '15 min', difficulty: 'beginner', conditions: ['asthma', 'breathing'] },
  { id: 'IKv-VqXyB9w', title: 'Thyroid Yoga - Healing Routine', duration: '20 min', difficulty: 'beginner', conditions: ['thyroid', 'hormonal'] },
  { id: 'g_tea8ZNk5A', title: 'Stress Relief Yoga - Relaxation', duration: '20 min', difficulty: 'beginner', conditions: ['stress', 'anxiety', 'general'] },
  { id: 'v7AYKMP6rOE', title: 'Full Body Yoga Workout', duration: '30 min', difficulty: 'intermediate', conditions: ['general', 'full_body'] },
];

function getExerciseImage(exerciseName: string): string {
  const lowerName = exerciseName.toLowerCase();
  for (const [key, url] of Object.entries(exerciseImages)) {
    if (lowerName.includes(key)) return url;
  }
  return exerciseImages['default'];
}

function getRelevantYogaVideos(conditions: string[], ageGroup: string): typeof verifiedYogaVideos {
  const relevantVideos: typeof verifiedYogaVideos = [];
  const addedIds = new Set<string>();
  
  for (const condition of conditions) {
    for (const video of verifiedYogaVideos) {
      if (!addedIds.has(video.id) && video.conditions.some(c => 
        condition.toLowerCase().includes(c) || c.includes(condition.toLowerCase())
      )) {
        relevantVideos.push(video);
        addedIds.add(video.id);
      }
    }
  }
  
  if (ageGroup === 'senior') {
    const seniorVideo = verifiedYogaVideos.find(v => v.conditions.includes('senior'));
    if (seniorVideo && !addedIds.has(seniorVideo.id)) {
      relevantVideos.push(seniorVideo);
      addedIds.add(seniorVideo.id);
    }
  }
  
  if (relevantVideos.length < 4) {
    for (const video of verifiedYogaVideos) {
      if (!addedIds.has(video.id) && video.conditions.includes('general')) {
        relevantVideos.push(video);
        addedIds.add(video.id);
        if (relevantVideos.length >= 4) break;
      }
    }
  }
  
  return relevantVideos.slice(0, 4);
}

// Age-based sleep guidelines for the AI prompt
function getSleepGuidelines(age: number): string {
  if (age <= 13) return 'Children (10-13): 9-11 hours. Tips: consistent bedtime, limit screen time, no caffeine.';
  if (age <= 17) return 'Teens (14-17): 8-10 hours. Tips: avoid late-night studying, reduce blue light, regular schedule.';
  if (age <= 25) return 'Young Adults (18-25): 7-9 hours. Tips: limit alcohol, consistent wake time, exercise earlier in day.';
  if (age <= 45) return 'Adults (26-45): 7-9 hours. Tips: stress management, avoid screens 1hr before bed, cool bedroom (18-20°C).';
  if (age <= 64) return 'Middle-aged (46-64): 7-8 hours. Tips: watch for sleep apnea, limit evening fluids, relaxation techniques.';
  return 'Seniors (65+): 7-8 hours. Tips: short naps OK (20-30 min), earlier bedtime, light evening walk, morning sunlight exposure.';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- JWT Authentication ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;
    // --- End JWT Authentication ---

    const { userData } = await req.json() as { userData: UserHealthData };
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const bmi = userData.weight / (userData.height * userData.height);
    const bmiCategory = bmi < 18.5 ? 'underweight' : bmi < 25 ? 'normal' : bmi < 30 ? 'overweight' : 'obese';
    const ageGroup = userData.age < 18 ? 'teen' : userData.age < 45 ? 'adult' : 'senior';

    let progressContext = '';
    if (userData.progressHistory && userData.progressHistory.length > 0) {
      const latestWeight = userData.progressHistory[0]?.weight;
      const oldestWeight = userData.progressHistory[userData.progressHistory.length - 1]?.weight;
      if (latestWeight && oldestWeight) {
        const weightChange = latestWeight - oldestWeight;
        progressContext = `User's weight trend: ${weightChange > 0 ? 'gained' : 'lost'} ${Math.abs(weightChange).toFixed(1)} kg over ${userData.progressHistory.length} records.`;
      }
    }

    const yogaVideos = getRelevantYogaVideos(userData.healthConditions, ageGroup);
    const sleepGuideline = getSleepGuidelines(userData.age);

    const dietLabels = {
      'vegan': 'Vegan (plant-based only, no animal products)',
      'vegetarian': 'Vegetarian (includes dairy and eggs, no meat/fish)',
      'non_vegetarian': 'Non-Vegetarian (balanced diet including meat and fish)'
    };

    const systemPrompt = `You are an expert personal fitness coach AI. Generate highly personalized fitness recommendations based on the user's specific health profile. Your recommendations must be:
1. Tailored specifically to their age, BMI, health conditions, and disease stages
2. Safe and appropriate for their health conditions
3. Progressive based on their current fitness level
4. STRICTLY based on their diet preference

CRITICAL DIET RULES:
- Vegan: ONLY plant-based foods. NO dairy, eggs, honey, or any animal products
- Vegetarian: NO meat, fish, poultry. Dairy and eggs are OK
- Non-Vegetarian: Balanced diet with meat, fish, vegetables

CRITICAL SLEEP RULES (use these medically-backed guidelines):
${sleepGuideline}
The sleep tips you generate MUST be specific to this person's age group. Do NOT give generic sleep advice.

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or extra text.

The JSON structure must be:
{
  "exercises": [
    {"name": "string", "duration": "string", "intensity": "low|medium|high", "description": "string", "icon": "emoji"}
  ],
  "dietPlan": {
    "meals": [
      {"time": "string", "name": "string", "items": ["string"], "calories": number}
    ],
    "guidelines": ["string"],
    "restrictions": ["string"]
  },
  "sleepRecommendation": {
    "minHours": number,
    "maxHours": number,
    "tips": ["string"]
  },
  "warnings": ["string"],
  "personalizedMessage": "string"
}`;

    const userPrompt = `Generate personalized fitness recommendations for:

**User Profile:**
- Name: ${userData.name}
- Age: ${userData.age} years (${ageGroup})
- Gender: ${userData.gender}
- Height: ${userData.height}m
- Weight: ${userData.weight}kg
- BMI: ${bmi.toFixed(1)} (${bmiCategory})
- Diet Preference: ${dietLabels[userData.dietPreference]}

**Health Conditions:**
${userData.healthConditions.length > 0 
  ? userData.healthConditions.map(c => `- ${c}: Stage ${userData.diseaseStages[c] || 'normal'}`).join('\n')
  : '- No specific health conditions'}

${progressContext ? `**Progress History:**\n${progressContext}` : ''}

Based on this SPECIFIC profile, create a completely personalized plan that:
1. Considers their ${bmiCategory} BMI category when suggesting exercises
2. Accounts for their ${ageGroup} age group for intensity levels
3. Addresses their specific health conditions with appropriate modifications
4. Provides a diet plan STRICTLY following their ${userData.dietPreference.replace('_', '-')} preference
5. Gives sleep recommendations specifically for a ${userData.age}-year-old (use the medical guidelines provided)

CRITICAL FOR DIET:
${userData.dietPreference === 'vegan' ? '- All meals must be 100% plant-based. Suggest tofu, tempeh, legumes, nuts, seeds, plant milks instead of dairy/eggs' : ''}
${userData.dietPreference === 'vegetarian' ? '- No meat or fish. Include paneer, milk, eggs, cheese as protein sources' : ''}
${userData.dietPreference === 'non_vegetarian' ? '- Include lean meats, fish, eggs along with vegetables for balanced nutrition' : ''}

Make the recommendations UNIQUE to this user - not generic advice. Include specific warnings if they have severe health conditions.`;

    console.log('Generating recommendations for user:', userId, { 
      age: userData.age, 
      dietPreference: userData.dietPreference,
      conditions: userData.healthConditions 
    });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Strip markdown fences and any surrounding text to extract pure JSON
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    
    // If the model wrapped JSON in extra text, extract the first JSON object
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    let recommendations;
    try {
      recommendations = JSON.parse(content);
    } catch (parseError) {
      // Try to fix common JSON issues: trailing commas
      try {
        const fixed = content.replace(/,\s*([\]}])/g, '$1');
        recommendations = JSON.parse(fixed);
      } catch {
        console.error('Failed to parse AI response:', content.substring(0, 500));
        throw new Error('Invalid JSON in AI response');
      }
    }

    if (recommendations.exercises) {
      recommendations.exercises = recommendations.exercises.map((exercise: any) => ({
        ...exercise,
        imageUrl: getExerciseImage(exercise.name)
      }));
    }

    recommendations.yogaVideos = yogaVideos.map(video => ({
      title: video.title,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      duration: video.duration,
      difficulty: video.difficulty,
      targetCondition: video.conditions[0],
      thumbnail: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
    }));

    console.log('Successfully generated recommendations for user:', userId);

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-recommendations:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
