import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Scale, ArrowRight, ArrowLeft, Loader2, User, Ruler, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

type DietPreference = 'vegan' | 'vegetarian' | 'non_vegetarian';

interface HealthDataFormProps {
  existingData?: {
    age: number; gender: 'male' | 'female' | 'other'; height: number; weight: number;
    health_conditions: string[]; disease_stages: Record<string, string>; diet_preference?: DietPreference;
  } | null;
  isUpdate?: boolean;
  onSubmit: (data: {
    age: number; gender: 'male' | 'female' | 'other'; height: number; weight: number;
    health_conditions: string[]; disease_stages: Record<string, string>; diet_preference: DietPreference;
  }) => Promise<void>;
}

const healthConditionOptions = [
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hypertension', label: 'Hypertension (High BP)' },
  { value: 'obesity', label: 'Obesity' },
  { value: 'asthma', label: 'Asthma' },
  { value: 'thyroid', label: 'Thyroid Issues' },
];

const dietPreferenceOptions = [
  { value: 'vegan', label: 'Vegan', description: 'Plant-based diet only, no animal products', icon: '🌱' },
  { value: 'vegetarian', label: 'Vegetarian', description: 'Includes dairy, eggs, no meat/fish', icon: '🥗' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian', description: 'Balanced diet including meat', icon: '🍖' },
];

export function HealthDataForm({ existingData, isUpdate, onSubmit }: HealthDataFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: existingData?.age?.toString() || '',
    gender: existingData?.gender || ('' as 'male' | 'female' | 'other' | ''),
    height: existingData?.height?.toString() || '',
    weight: existingData?.weight?.toString() || '',
    diet_preference: existingData?.diet_preference || ('' as DietPreference | ''),
  });
  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(new Set(existingData?.health_conditions || []));
  const [conditionStages, setConditionStages] = useState<Record<string, string>>(existingData?.disease_stages || {});

  const bmi = formData.height && formData.weight
    ? parseFloat(formData.weight) / (parseFloat(formData.height) * parseFloat(formData.height)) : 0;
  const bmiCategory = bmi < 18.5 ? 'underweight' : bmi < 25 ? 'normal' : bmi < 30 ? 'overweight' : 'obese';

  const handleConditionToggle = (condition: string) => {
    const newSelected = new Set(selectedConditions);
    if (newSelected.has(condition)) newSelected.delete(condition);
    else newSelected.add(condition);
    setSelectedConditions(newSelected);
  };

  const handleStageChange = (condition: string, stage: string) => {
    setConditionStages(prev => ({ ...prev, [condition]: stage }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({
        age: parseInt(formData.age), gender: formData.gender as any,
        height: parseFloat(formData.height), weight: parseFloat(formData.weight),
        health_conditions: Array.from(selectedConditions), disease_stages: conditionStages,
        diet_preference: (formData.diet_preference || 'non_vegetarian') as DietPreference,
      });
    } catch { toast.error('Failed to save health data'); }
    finally { setLoading(false); }
  };

  const inputClass = "h-12 bg-gray-50 border-gray-200 text-foreground rounded-xl focus:border-gray-400 focus:ring-gray-400";

  if (isUpdate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e8eaf6] via-[#f0f2ff] to-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 mb-4 flex items-center justify-center">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold">Update Your Progress</h2>
            <p className="text-muted-foreground text-sm">Update your current weight and health conditions</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2"><Scale className="w-4 h-4" /> Current Weight (kg)</Label>
              <Input id="weight" type="number" placeholder="e.g., 70" min={20} max={300}
                value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className={inputClass} />
            </div>
            {bmi > 0 && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your BMI</span>
                  <span className={`font-display font-bold text-lg ${bmiCategory === 'normal' ? 'text-emerald-600' : bmiCategory === 'underweight' ? 'text-amber-600' : 'text-red-500'}`}>
                    {bmi.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm mt-1 capitalize text-muted-foreground">Category: <span className="font-medium text-foreground">{bmiCategory}</span></p>
              </div>
            )}
            <div className="space-y-3">
              <Label>Health Conditions (update if changed)</Label>
              {healthConditionOptions.map((condition) => (
                <div key={condition.value} className="space-y-2">
                  <div className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedConditions.has(condition.value) ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                  }`} onClick={() => handleConditionToggle(condition.value)}>
                    <Checkbox checked={selectedConditions.has(condition.value)}
                      onCheckedChange={() => handleConditionToggle(condition.value)} />
                    <Label className="flex-1 cursor-pointer flex items-center gap-2">
                      <Heart className="w-4 h-4" />{condition.label}
                    </Label>
                  </div>
                  {selectedConditions.has(condition.value) && (
                    <div className="ml-8">
                      <Select value={conditionStages[condition.value] || 'normal'}
                        onValueChange={(value) => handleStageChange(condition.value, value)}>
                        <SelectTrigger className="w-full bg-gray-50 border-gray-200 rounded-xl"><SelectValue placeholder="Select stage" /></SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="normal">Normal / Pre-stage</SelectItem>
                          <SelectItem value="stage1">Stage 1 (Mild)</SelectItem>
                          <SelectItem value="stage2">Stage 2 (Moderate-Severe)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleSubmit} disabled={!formData.weight || loading}
              className="w-full h-12 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Update & Get New Recommendations <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isStep1Valid = formData.age && formData.gender;
  const isStep2Valid = formData.height && formData.weight;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8eaf6] via-[#f0f2ff] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-semibold transition-all duration-300 ${
                s === step ? 'bg-gray-900 text-white scale-110' : s < step ? 'bg-gray-900 text-white' : 'bg-gray-200 text-muted-foreground'
              }`}>{s}</div>
              {s < 3 && <div className={`w-16 h-1 mx-2 rounded ${s < step ? 'bg-gray-900' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center">
              {step === 1 && <User className="w-6 h-6 text-white" />}
              {step === 2 && <Ruler className="w-6 h-6 text-white" />}
              {step === 3 && <Heart className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">
                {step === 1 && 'Basic Information'}{step === 2 && 'Body Metrics'}{step === 3 && 'Health Profile'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {step === 1 && "Tell us about yourself"}{step === 2 && 'Help us calculate your fitness needs'}{step === 3 && 'Any health conditions we should consider?'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="Enter your age" min={10} max={100}
                    value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value as any })}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-2"><Ruler className="w-4 h-4" /> Height (meters)</Label>
                  <Input id="height" type="number" placeholder="e.g., 1.75" step="0.01" min={0.5} max={2.5}
                    value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2"><Scale className="w-4 h-4" /> Weight (kg)</Label>
                  <Input id="weight" type="number" placeholder="e.g., 70" min={20} max={300}
                    value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className={inputClass} />
                </div>
                {bmi > 0 && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Your BMI</span>
                      <span className={`font-display font-bold text-lg ${bmiCategory === 'normal' ? 'text-emerald-600' : bmiCategory === 'underweight' ? 'text-amber-600' : 'text-red-500'}`}>
                        {bmi.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm mt-1 capitalize text-muted-foreground">Category: <span className="font-medium text-foreground">{bmiCategory}</span></p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Diet Preference <span className="text-red-500">*</span></Label>
                  <div className="grid gap-2">
                    {dietPreferenceOptions.map((option) => (
                      <div key={option.value}
                        className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.diet_preference === option.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                        }`}
                        onClick={() => setFormData({ ...formData, diet_preference: option.value as any })}>
                        <div className="text-2xl">{option.icon}</div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.diet_preference === option.value ? 'border-gray-900' : 'border-gray-300'
                        }`}>
                          {formData.diet_preference === option.value && <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />}
                        </div>
                        <div className="flex-1">
                          <Label className="font-medium cursor-pointer">{option.label}</Label>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <Label className="text-base font-medium">Health Conditions (optional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">Select any health conditions to personalize your plan</p>
                  {healthConditionOptions.map((condition) => (
                    <div key={condition.value} className="space-y-2">
                      <div className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedConditions.has(condition.value) ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                      }`} onClick={() => handleConditionToggle(condition.value)}>
                        <Checkbox checked={selectedConditions.has(condition.value)} onCheckedChange={() => handleConditionToggle(condition.value)} />
                        <Label className="flex-1 cursor-pointer flex items-center gap-2"><Heart className="w-4 h-4" />{condition.label}</Label>
                      </div>
                      {selectedConditions.has(condition.value) && (
                        <div className="ml-8">
                          <Select value={conditionStages[condition.value] || 'normal'}
                            onValueChange={(value) => handleStageChange(condition.value, value)}>
                            <SelectTrigger className="w-full bg-gray-50 border-gray-200 rounded-xl"><SelectValue placeholder="Select stage" /></SelectTrigger>
                            <SelectContent className="bg-white border-gray-200">
                              <SelectItem value="normal">Normal / Pre-stage</SelectItem>
                              <SelectItem value="stage1">Stage 1 (Mild)</SelectItem>
                              <SelectItem value="stage2">Stage 2 (Moderate-Severe)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)}
                  className="flex-1 h-12 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              {step < 3 ? (
                <button onClick={() => setStep(step + 1)}
                  disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                  className="flex-1 h-12 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={!formData.diet_preference || loading}
                  className="flex-1 h-12 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Get My AI Plan <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
