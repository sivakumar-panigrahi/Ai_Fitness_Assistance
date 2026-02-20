import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Phone, Twitter, Instagram, MessageCircle } from 'lucide-react';
import DemoModal from '@/components/DemoModal';

const programs = [
{
  title: 'Jumping challenge',
  difficulty: 'BEGINNER',
  image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop'
},
{
  title: 'Core stability flow',
  difficulty: 'INTERMEDIATE',
  image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop'
},
{
  title: 'Trail sprint challenge',
  difficulty: 'ADVANCED',
  image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=500&fit=crop'
},
{
  title: 'Full-body bootcamp',
  difficulty: 'ALL LEVELS',
  image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop'
},
{
  title: 'Mobility & Recovery',
  difficulty: 'RECOVERY',
  image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=500&fit=crop'
}];


const avatars = [
'https://i.pravatar.cc/150?img=1',
'https://i.pravatar.cc/150?img=2',
'https://i.pravatar.cc/150?img=3',
'https://i.pravatar.cc/150?img=4'];


const difficultyStyles: Record<string, string> = {
  BEGINNER: 'bg-emerald-500/90 text-white',
  INTERMEDIATE: 'bg-amber-500/90 text-white',
  ADVANCED: 'bg-red-500/90 text-white',
  'ALL LEVELS': 'bg-blue-500/90 text-white',
  RECOVERY: 'bg-purple-500/90 text-white'
};

export default function Landing() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8eaf6] via-[#f0f2ff] to-white overflow-hidden scroll-smooth">
      {/* Navigation */}
      <nav className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* Logo */}
          <span className="font-display font-bold text-xl text-gray-900 tracking-tight">FitCoach AI</span>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#programs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <button onClick={() => setShowDemo(true)} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Programs</button>
            
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-16 pb-24 md:pt-20 md:pb-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-display font-bold text-gray-900 leading-[1.05] tracking-tight mb-6">
            Train smarter.
            <br />
            Anywhere. Anytime.
          </h1>

          <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-10">
            Guided fitness sessions tailored to your goals — whether it's strength, 
            endurance, or flexibility. Streamlined, motivating, and accessible 24/7.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-5">
            <Link to="/auth">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">
                Start training
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <button
              onClick={() => setShowDemo(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white/60 transition-colors">

              Browse programs
            </button>
          </div>

          

          {/* Social proof avatars */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {avatars.map((src, i) =>
              <img
                key={i}
                src={src}
                alt={`User ${i + 1}`}
                className="w-10 h-10 rounded-full border-2 border-white object-cover" />

              )}
            </div>
            <p className="text-sm text-gray-500">
              Join over <span className="font-semibold text-gray-700">10,000+</span> people
            </p>
          </div>
        </div>
      </header>

      {/* Programs Carousel — auto-scrolling infinite strip */}
      <section id="programs" className="relative pb-20 overflow-hidden">
        <div className="flex gap-6 animate-scroll-left">
          {/* Double the items for seamless infinite scroll */}
          {[...programs, ...programs].map((program, i) =>
          <div
            key={i}
            className="relative flex-shrink-0 w-[280px] h-[380px] rounded-2xl overflow-hidden group cursor-pointer">

              <img
              src={program.image}
              alt={program.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${difficultyStyles[program.difficulty]}`}>
                  {program.difficulty}
                </span>
              </div>

              {/* Title */}
              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="text-lg font-display font-bold text-white">{program.title}</h3>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              A complete fitness ecosystem that adapts to your unique health profile
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
            { emoji: '💪', title: 'Smart Workouts', description: 'AI-generated exercise plans adapted to your BMI, age, and health conditions with visual demos' },
            { emoji: '🧘', title: 'Yoga & Meditation', description: 'Curated yoga sessions with video demonstrations targeted to your specific health needs' },
            { emoji: '🥗', title: 'Personalized Diet', description: 'Nutrition plans for vegan, vegetarian, and non-vegetarian preferences with calorie tracking' },
            { emoji: '🌙', title: 'Age-Based Sleep', description: 'Medically-backed sleep recommendations specific to your age group with actionable tips' },
            { emoji: '🎯', title: 'AI Pose Detection', description: 'Real-time exercise tracking using your camera with rep counting and form correction' }].
            map((feature, i) =>
            <div
              key={i}
              className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

                <div className="text-3xl mb-4">{feature.emoji}</div>
                <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Start in 3 Simple Steps
            </h2>
            <p className="text-gray-500 text-lg">Get your personalized AI fitness coach in minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
            { step: '01', title: 'Create Profile', description: 'Sign up with your name and email. Your profile is saved securely.', numColor: 'text-orange-300' },
            { step: '02', title: 'Enter Health Data', description: 'Share age, weight, height, and any health conditions.', numColor: 'text-indigo-300' },
            { step: '03', title: 'Get AI Plan', description: 'Receive unique fitness plans that evolve with your progress.', numColor: 'text-emerald-300' }].
            map((item, i) =>
            <div key={i} className="relative text-center">
                <div className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300">
                  <div className={`text-7xl font-display font-bold ${item.numColor} mb-4`}>{item.step}</div>
                  <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                {i < 2 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-indigo-200" />}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-12">
            Why Choose FitCoach AI?
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
            {[
            'Personalized recommendations based on YOUR health profile',
            'Track streaks and earn badges for motivation',
            'Adapts to your progress and health changes',
            'Real-time pose detection for exercise tracking',
            'Diet plans for Vegan, Vegetarian & Non-Vegetarian',
            'Safe exercise modifications for health conditions'].
            map((benefit, i) =>
            <div key={i} className="flex items-center gap-3 text-left p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-emerald-600 text-xs">✓</span>
                </div>
                <p className="text-gray-600 text-sm">{benefit}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-gray-900 rounded-3xl p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white">
                Ready to Transform?
              </h2>
              <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg">
                Start your personalized fitness journey with AI-powered coaching
              </p>
              <Link to="/auth">
                <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                  Start Free Today
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-6">
          <p className="text-sm text-gray-600 font-medium">© FitCoach AI. B.Tech Final Year Project.</p>

          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium">+91 98765 43210</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#1DA1F2] hover:opacity-80 transition-opacity">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-[#5865F2] hover:opacity-80 transition-opacity">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#E4405F] hover:opacity-80 transition-opacity">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>

      <DemoModal open={showDemo} onOpenChange={setShowDemo} />

      {/* Inline style for infinite scroll animation */}
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>);

}