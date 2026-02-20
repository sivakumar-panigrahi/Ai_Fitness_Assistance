import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UserProfile, ConditionType, DiseaseStage, HealthCondition } from '@/types/fitness';
import { calculateBMI, getBMICategory } from '@/lib/fitnessEngine';
import { Activity, Heart, Scale, User, ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingFormProps {
  onComplete: (profile: UserProfile) => void;
}

const healthConditionOptions: { value: ConditionType; label: string }[] = [
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hypertension', label: 'Hypertension (High BP)' },
  { value: 'obesity', label: 'Obesity' },
  { value: 'asthma', label: 'Asthma' },
  { value: 'thyroid', label: 'Thyroid Issues' },
  { value: 'none', label: 'No health conditions' },
];

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    height: '',
    weight: '',
  });
  const [selectedConditions, setSelectedConditions] = useState<Set<ConditionType>>(new Set());
  const [conditionStages, setConditionStages] = useState<Record<ConditionType, DiseaseStage>>({} as Record<ConditionType, DiseaseStage>);

  const bmi = formData.height && formData.weight 
    ? calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))
    : 0;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const handleConditionToggle = (condition: ConditionType) => {
    const newSelected = new Set(selectedConditions);
    if (condition === 'none') {
      newSelected.clear();
      newSelected.add('none');
    } else {
      newSelected.delete('none');
      if (newSelected.has(condition)) {
        newSelected.delete(condition);
      } else {
        newSelected.add(condition);
      }
    }
    setSelectedConditions(newSelected);
  };

  const handleStageChange = (condition: ConditionType, stage: DiseaseStage) => {
    setConditionStages(prev => ({ ...prev, [condition]: stage }));
  };

  const handleSubmit = () => {
    const healthConditions: HealthCondition[] = Array.from(selectedConditions)
      .filter(c => c !== 'none')
      .map(type => ({
        type,
        stage: conditionStages[type] || 'normal',
      }));

    const profile: UserProfile = {
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender as 'male' | 'female' | 'other',
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      healthConditions,
    };

    onComplete(profile);
  };

  const isStep1Valid = formData.name && formData.age && formData.gender;
  const isStep2Valid = formData.height && formData.weight;
  const isStep3Valid = selectedConditions.size > 0;

  return (
    <div className="min-h-screen gradient-calm flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  s === step
                    ? 'gradient-hero text-primary-foreground scale-110 shadow-glow'
                    : s < step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 mx-2 rounded ${s < step ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-medium border-0 overflow-hidden animate-scale-in">
          <CardHeader className="gradient-hero text-primary-foreground pb-8">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6" />
              <CardTitle className="text-2xl font-display">
                {step === 1 && 'Personal Details'}
                {step === 2 && 'Body Metrics'}
                {step === 3 && 'Health Profile'}
              </CardTitle>
            </div>
            <CardDescription className="text-primary-foreground/80">
              {step === 1 && "Let's get to know you better"}
              {step === 2 && 'Help us calculate your fitness needs'}
              {step === 3 && 'Any health conditions we should consider?'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    min={10}
                    max={100}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value as any })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Height (meters)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="e.g., 1.75"
                    step="0.01"
                    min={0.5}
                    max={2.5}
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-primary" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 70"
                    min={20}
                    max={300}
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="h-12"
                  />
                </div>

                {bmi > 0 && (
                  <div className="p-4 rounded-xl bg-muted animate-scale-in">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Your BMI</span>
                      <span className={`font-bold text-lg ${
                        bmiCategory === 'normal' ? 'text-success' :
                        bmiCategory === 'underweight' ? 'text-warning' :
                        'text-destructive'
                      }`}>
                        {bmi.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm mt-1 capitalize text-muted-foreground">
                      Category: <span className="font-medium text-foreground">{bmiCategory}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-3">
                  {healthConditionOptions.map((condition) => (
                    <div key={condition.value} className="space-y-2">
                      <div
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedConditions.has(condition.value)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleConditionToggle(condition.value)}
                      >
                        <Checkbox
                          checked={selectedConditions.has(condition.value)}
                          onCheckedChange={() => handleConditionToggle(condition.value)}
                        />
                        <Label className="flex-1 cursor-pointer flex items-center gap-2">
                          <Heart className="w-4 h-4 text-primary" />
                          {condition.label}
                        </Label>
                      </div>

                      {selectedConditions.has(condition.value) && condition.value !== 'none' && (
                        <div className="ml-8 animate-fade-in">
                          <Select
                            value={conditionStages[condition.value] || 'normal'}
                            onValueChange={(value) => handleStageChange(condition.value, value as DiseaseStage)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
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

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}

              {step < 3 ? (
                <Button
                  variant="hero"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                  className="flex-1"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="hero"
                  onClick={handleSubmit}
                  disabled={!isStep3Valid}
                  className="flex-1"
                >
                  Get My Plan
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
