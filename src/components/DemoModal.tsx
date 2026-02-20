import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { 
  ChevronLeft, ChevronRight, UserPlus, ClipboardList, Sparkles, 
  Dumbbell, Heart, Salad, Moon, Trophy, X
} from 'lucide-react';

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const demoSlides = [
  { id: 1, title: "Welcome to FitCoach AI", subtitle: "Your Personal AI Fitness Journey", description: "Get ready to transform your health with personalized AI-powered recommendations.", icon: Sparkles, features: ["AI-powered personalization", "Adapts to your health profile", "Track progress & earn badges"], mockupType: "welcome" },
  { id: 2, title: "Step 1: Create Your Account", subtitle: "Quick & Easy Sign Up", description: "Start by creating your account with just your name, email, and password.", icon: UserPlus, features: ["Enter your name and email", "Create a secure password", "Select diet preference"], mockupType: "signup" },
  { id: 3, title: "Step 2: Enter Health Data", subtitle: "Personalization Begins", description: "Share your health information so our AI can create the perfect fitness plan.", icon: ClipboardList, features: ["Age, gender, height, and weight", "Any existing health conditions", "Disease stage information"], mockupType: "health" },
  { id: 4, title: "AI-Powered Workout Plans", subtitle: "Customized Exercise Routines", description: "Get exercise recommendations designed for your BMI, age, and health conditions.", icon: Dumbbell, features: ["Visual exercise demonstrations", "Safe modifications for conditions", "Progressive difficulty levels"], mockupType: "workout" },
  { id: 5, title: "Personalized Yoga Sessions", subtitle: "Mind & Body Balance", description: "Access curated yoga videos with embedded YouTube demonstrations.", icon: Heart, features: ["Video-guided yoga sessions", "Poses for your fitness level", "Breathing techniques"], mockupType: "yoga" },
  { id: 6, title: "Diet Plans For You", subtitle: "Nutrition Made Simple", description: "Receive meal plans based on your diet preference.", icon: Salad, features: ["Vegan, Vegetarian, or Non-Veg options", "Breakfast, Lunch, Dinner & Snacks", "Nutritional balance guidance"], mockupType: "diet" },
  { id: 7, title: "Sleep Recommendations", subtitle: "Rest Better, Perform Better", description: "Get age-appropriate sleep advice with tips to improve sleep quality.", icon: Moon, features: ["Optimal sleep duration", "Sleep hygiene tips", "Evening routine suggestions"], mockupType: "sleep" },
  { id: 8, title: "Track Your Progress", subtitle: "Stay Motivated & Achieve Goals", description: "Monitor your fitness journey with streaks, badges, and progress history.", icon: Trophy, features: ["Workout streak tracking", "Earn achievement badges", "Visual progress charts"], mockupType: "progress" },
];

const MockupDisplay = ({ type }: { type: string }) => {
  const mockups: Record<string, React.ReactNode> = {
    welcome: (
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-900 mx-auto mb-4 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <p className="text-lg font-display font-bold mb-2">FitCoach AI</p>
        <p className="text-xs text-muted-foreground">Your Personalized Fitness Journey Awaits</p>
      </div>
    ),
    signup: (
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-200 rounded-lg" />)}
        <div className="h-8 bg-gray-900 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-medium">Sign Up</span>
        </div>
      </div>
    ),
    health: (
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <div className="grid grid-cols-2 gap-2">
          {["Age: 25", "Gender: Male", "Height: 175cm", "Weight: 70kg"].map((label, i) => (
            <div key={i} className="bg-white rounded-lg p-2 text-xs">{label}</div>
          ))}
        </div>
      </div>
    ),
    workout: (
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
        {["Push-ups", "Squats", "Plank"].map((e, i) => (
          <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <div><p className="text-sm font-medium">{e}</p><p className="text-[10px] text-muted-foreground">3 sets × 12 reps</p></div>
          </div>
        ))}
      </div>
    ),
    yoga: (
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <div className="aspect-video bg-gray-200 rounded-xl mb-3 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center"><span className="text-white text-xl">▶</span></div>
        </div>
        <p className="text-sm font-medium">Morning Yoga Flow</p>
        <p className="text-[10px] text-muted-foreground">15 min · Beginner</p>
      </div>
    ),
    diet: (
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
        {["Breakfast", "Lunch", "Dinner"].map((m, i) => (
          <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><Salad className="w-4 h-4 text-emerald-600" /></div>
            <div><p className="text-xs font-medium">{m}</p></div>
          </div>
        ))}
      </div>
    ),
    sleep: (
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-50 mx-auto mb-4 flex items-center justify-center">
          <Moon className="w-10 h-10 text-blue-600" />
        </div>
        <p className="text-2xl font-display font-bold">7-8 hours</p>
        <p className="text-xs text-muted-foreground">Recommended sleep</p>
      </div>
    ),
    progress: (
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center"><Trophy className="w-5 h-5 text-white" /></div>
          <div><p className="text-sm font-medium">7 Day Streak!</p><p className="text-[10px] text-muted-foreground">Keep it up!</p></div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(7)].map((_, i) => <div key={i} className="h-6 rounded bg-emerald-400" />)}
        </div>
      </div>
    ),
  };
  return mockups[type] || null;
};

export default function DemoModal({ open, onOpenChange }: DemoModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = demoSlides[currentSlide];
  const Icon = slide.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white border-gray-200 p-0 overflow-hidden">
        <DialogTitle className="sr-only">App Demo</DialogTitle>
        <button onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
          <div className="h-full bg-gray-900 transition-all duration-300" style={{ width: `${((currentSlide + 1) / demoSlides.length) * 100}%` }} />
        </div>
        <div className="grid md:grid-cols-2 min-h-[500px]">
          <div className="p-8 flex flex-col justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mb-6">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">{slide.subtitle}</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">{slide.title}</h2>
            <p className="text-muted-foreground mb-6">{slide.description}</p>
            <ul className="space-y-3">
              {slide.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="text-emerald-600 text-xs">✓</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 p-8 flex items-center justify-center border-l border-gray-100">
            <div className="w-full max-w-xs"><MockupDisplay type={slide.mockupType} /></div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent">
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrentSlide((currentSlide - 1 + demoSlides.length) % demoSlides.length)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex gap-2">
              {demoSlides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-gray-900' : 'bg-gray-300 hover:bg-gray-400'}`} />
              ))}
            </div>
            {currentSlide === demoSlides.length - 1 ? (
              <button onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">
                Get Started
              </button>
            ) : (
              <button onClick={() => setCurrentSlide((currentSlide + 1) % demoSlides.length)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
