import { useState, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).transform(sanitizeText),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must include an uppercase letter').regex(/[^a-zA-Z0-9]/, 'Must include a special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000;

export default function Auth() {
  const { user, loading: authLoading, signUp, signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpForm, setSignUpForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const loginAttemptsRef = useRef<number>(0);
  const lockoutUntilRef = useRef<number>(0);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signUpSchema.safeParse(signUpForm);
    if (!result.success) { toast.error(result.error.errors[0].message); return; }
    setLoading(true);
    const { error } = await signUp(result.data.email, result.data.password, result.data.name);
    setLoading(false);
    if (error) {
      toast.error(error.message.includes('already registered') ? 'This email is already registered. Please log in instead.' : error.message);
    } else {
      toast.success('Account created successfully! Welcome to FitCoach AI.');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now < lockoutUntilRef.current) {
      toast.error(`Too many attempts. Try again in ${Math.ceil((lockoutUntilRef.current - now) / 1000)}s.`);
      return;
    }
    const result = signInSchema.safeParse(signInForm);
    if (!result.success) { toast.error(result.error.errors[0].message); return; }
    setLoading(true);
    const { error } = await signIn(signInForm.email, signInForm.password);
    setLoading(false);
    if (error) {
      loginAttemptsRef.current += 1;
      if (loginAttemptsRef.current >= MAX_LOGIN_ATTEMPTS) {
        lockoutUntilRef.current = Date.now() + LOCKOUT_DURATION_MS;
        loginAttemptsRef.current = 0;
        toast.error('Too many failed attempts. Please wait 1 minute.');
        return;
      }
      toast.error(error.message.includes('Invalid login') ? `Invalid email or password. ${MAX_LOGIN_ATTEMPTS - loginAttemptsRef.current} attempts remaining.` : error.message);
    } else {
      loginAttemptsRef.current = 0;
      toast.success('Welcome back!');
    }
  };

  const inputClass = "h-12 bg-gray-50 border-gray-200 text-foreground placeholder:text-muted-foreground focus:border-gray-400 focus:ring-gray-400 rounded-xl";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8eaf6] via-[#f0f2ff] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/landing" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          {/* Logo */}
          <div className="text-center mb-8">
            <span className="font-display font-bold text-2xl text-foreground">FitCoach AI</span>
            <p className="text-sm text-muted-foreground mt-1">Your AI-powered fitness coach</p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-display font-semibold text-foreground">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp ? 'Start your fitness journey today' : 'Continue your fitness journey'}
            </p>
          </div>

          {isSignUp ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <Input type="text" placeholder="Your name" value={signUpForm.name}
                onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                className={inputClass} required maxLength={100} />
              <Input type="email" placeholder="Email address" value={signUpForm.email}
                onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                className={inputClass} required maxLength={255} />
              <div>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="Password" value={signUpForm.password}
                    onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    className={`${inputClass} pr-11`} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 px-1">Min 8 chars, uppercase letter, special character.</p>
              </div>
              <div className="relative">
                <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" value={signUpForm.confirmPassword}
                  onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                  className={`${inputClass} pr-11`} required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 mt-2 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Account
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <Input type="email" placeholder="Email address" value={signInForm.email}
                onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                className={inputClass} required />
              <div>
                <div className="relative">
                  <Input type={showSignInPassword ? "text" : "password"} placeholder="Password" value={signInForm.password}
                    onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                    className={`${inputClass} pr-11`} required />
                  <button type="button" onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 mt-2 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button type="button" onClick={() => setIsSignUp(!isSignUp)}
                className="text-foreground hover:underline font-medium">
                {isSignUp ? 'Sign in' : "Sign up, it's free!"}
              </button>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secured with encryption & session management</span>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm">
            Join <span className="font-semibold text-foreground">thousands</span> of users achieving their fitness goals
          </p>
          <div className="flex justify-center mt-4 -space-x-2">
            {[1, 2, 3, 4].map((id) => (
              <img key={id} src={`https://i.pravatar.cc/150?img=${id}`} alt="user"
                className="w-10 h-10 rounded-full border-2 border-white object-cover" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
