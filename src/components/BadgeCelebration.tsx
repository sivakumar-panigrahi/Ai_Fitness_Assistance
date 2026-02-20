import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Trophy, Star, Sparkles, Award, Flame, Target, Medal, Crown } from 'lucide-react';

interface BadgeCelebrationProps {
  isOpen: boolean; onClose: () => void; badgeName: string; badgeId: string;
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  'first_workout': <Trophy className="w-16 h-16" />,
  'streak_3': <Flame className="w-16 h-16" />,
  'streak_7': <Flame className="w-16 h-16" />,
  'streak_30': <Crown className="w-16 h-16" />,
  'total_10': <Target className="w-16 h-16" />,
  'total_50': <Award className="w-16 h-16" />,
  'total_100': <Medal className="w-16 h-16" />,
  'early_bird': <Star className="w-16 h-16" />,
  'night_owl': <Star className="w-16 h-16" />,
  'perfect_week': <Sparkles className="w-16 h-16" />,
};

const BADGE_COLORS: Record<string, string> = {
  'first_workout': 'from-amber-400 to-orange-500',
  'streak_3': 'from-orange-400 to-red-500',
  'streak_7': 'from-red-400 to-pink-500',
  'streak_30': 'from-purple-400 to-indigo-500',
  'total_10': 'from-blue-400 to-cyan-500',
  'total_50': 'from-emerald-400 to-green-500',
  'total_100': 'from-yellow-400 to-amber-500',
  'early_bird': 'from-sky-400 to-blue-500',
  'night_owl': 'from-indigo-400 to-purple-500',
  'perfect_week': 'from-pink-400 to-rose-500',
};

export function BadgeCelebration({ isOpen, onClose, badgeName, badgeId }: BadgeCelebrationProps) {
  const [showBadge, setShowBadge] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const t1 = setTimeout(() => setShowParticles(true), 100);
      const t2 = setTimeout(() => setShowBadge(true), 300);
      const t3 = setTimeout(() => setShowText(true), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
      setShowBadge(false); setShowParticles(false); setShowText(false);
    }
  }, [isOpen]);

  const icon = BADGE_ICONS[badgeId] || <Trophy className="w-16 h-16" />;
  const gradient = BADGE_COLORS[badgeId] || 'from-amber-400 to-orange-500';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200 overflow-hidden">
        <div className="relative flex flex-col items-center justify-center py-8">
          {showParticles && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute animate-particle"
                  style={{ left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 0.5}s`, animationDuration: `${1 + Math.random()}s` }}>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
              ))}
              {[...Array(30)].map((_, i) => (
                <div key={`c-${i}`} className="absolute animate-confetti rounded-full"
                  style={{ left: `${Math.random() * 100}%`, top: '-10%',
                    width: `${6 + Math.random() * 8}px`, height: `${6 + Math.random() * 8}px`,
                    backgroundColor: ['#fbbf24', '#f472b6', '#818cf8', '#34d399', '#fb923c'][Math.floor(Math.random() * 5)],
                    animationDelay: `${Math.random() * 0.8}s`, animationDuration: `${2 + Math.random()}s` }} />
              ))}
            </div>
          )}

          <div className={`relative transition-all duration-700 ease-out ${showBadge ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <div className={`absolute -inset-4 bg-gradient-to-r ${gradient} rounded-full blur-xl opacity-30 animate-pulse-slow`} />
            <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl animate-badge-bounce`}>
              <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                <div className={`text-transparent bg-clip-text bg-gradient-to-br ${gradient}`}>{icon}</div>
              </div>
            </div>
          </div>

          <div className={`mt-8 text-center transition-all duration-500 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-display font-bold">Badge Earned!</h2>
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <p className={`text-lg font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{badgeName}</p>
            <p className="text-sm text-muted-foreground mt-2">Congratulations on your achievement!</p>
          </div>

          <button onClick={onClose}
            className={`mt-6 px-8 py-2 rounded-full bg-gradient-to-r ${gradient} text-white font-semibold hover:opacity-90 transition-all ${showText ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '200ms' }}>
            Awesome!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
