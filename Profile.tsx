import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { getSession, setSession } from '@/lib/session';
import { login, register, SessionUser } from '@/lib/api';
import { LogOut, Crown, Lock, MessageCircle, Heart, Loader2 } from 'lucide-react';

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  private: 'Private Confessions',
  matchmaking: 'Matchmaking',
};

export default function Profile() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setCurrentUser(getSession()); }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = isLogin ? await login({ email, password }) : await register({ email, password });
      if (user) { setSession(user); setCurrentUser(user); }
      else setError(isLogin ? 'Invalid email or password' : 'Registration failed');
    } catch { setError('An error occurred. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { setSession(null); setCurrentUser(null); };

  if (currentUser) {
    const planLabel = PLAN_LABELS[currentUser.plan] ?? 'Free';

    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-primary text-accent px-4 py-6 border-b border-accent/20">
          <div className="max-w-xl mx-auto flex items-center gap-4">
            <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center shrink-0 shadow-md">
              <span className="text-primary text-xl font-serif font-bold">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-script text-3xl leading-tight">{currentUser.sisterName}</h1>
              <p className="text-xs font-medium mt-0.5 text-accent/80">{planLabel}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0" data-testid="button-logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="max-w-xl mx-auto p-4 space-y-3 mt-2">
          <div className="bg-card border border-accent/40 rounded-2xl p-4 flex items-center gap-3">
            <Crown className="w-5 h-5 text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary">Your Plan</p>
              <p className="text-xs text-primary/50 truncate">{planLabel}</p>
            </div>
            {currentUser.plan === 'free' && (
              <button onClick={() => setLocation('/premium')} className="text-xs bg-primary text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shrink-0">
                Upgrade
              </button>
            )}
          </div>

          <button onClick={() => setLocation('/private')} className="w-full bg-card border border-accent/40 rounded-2xl p-4 flex items-center gap-3 hover:border-accent transition-colors text-left" data-testid="button-go-private">
            <MessageCircle className="w-5 h-5 text-primary/60 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary">Private Confessional</p>
              <p className="text-xs text-primary/50">{currentUser.plan === 'free' ? 'Requires subscription' : 'Open chat'}</p>
            </div>
            <span className="text-primary/30 text-sm">→</span>
          </button>

          {currentUser.plan === 'matchmaking' && (
            <button onClick={() => setLocation('/matchmaking')} className="w-full bg-card border border-accent/40 rounded-2xl p-4 flex items-center gap-3 hover:border-accent transition-colors text-left">
              <Heart className="w-5 h-5 text-accent shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary">Matchmaking</p>
                <p className="text-xs text-primary/50">Submit & track your matchmaking request</p>
              </div>
              <span className="text-primary/30 text-sm">→</span>
            </button>
          )}

          {currentUser.plan === 'free' && (
            <button onClick={() => setLocation('/premium')} className="w-full bg-accent/10 border border-accent rounded-2xl p-4 flex items-center gap-3 hover:bg-accent/20 transition-colors text-left" data-testid="button-go-premium">
              <Lock className="w-5 h-5 text-accent shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary">Deeper Healing</p>
                <p className="text-xs text-primary/50">Priority review, private chat & matchmaking</p>
              </div>
              <span className="text-accent font-medium text-xs">View Plans →</span>
            </button>
          )}

          <p className="text-center text-[11px] text-primary/30 pt-2">Your identity is always anonymous. Your secrets are safe here.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-accent max-w-sm w-full rounded-3xl p-7 shadow-xl">
        <div className="text-center mb-7">
          <h1 className="font-serif text-2xl text-primary font-bold tracking-tight leading-tight">FORGIVE ME,</h1>
          <span className="font-script text-4xl text-accent block -mt-1">Sister.</span>
          <div className="w-8 h-px bg-accent/50 mx-auto my-3" />
          <p className="text-xs text-primary/50 tracking-wide">{isLogin ? 'Welcome back, Sister.' : 'Join the sisterhood.'}</p>
        </div>

        {error && <p className="text-xs text-red-500 text-center mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <form onSubmit={handleAuth} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-primary/70 mb-1 uppercase tracking-wide">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-background border border-accent/50 focus:border-accent rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors" data-testid="input-email" />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary/70 mb-1 uppercase tracking-wide">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-background border border-accent/50 focus:border-accent rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors" data-testid="input-password" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-accent font-serif text-base py-3 rounded-xl hover:bg-primary/90 transition-colors mt-1 border border-transparent hover:border-accent/40 flex items-center justify-center gap-2" data-testid="button-auth-submit">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLogin ? 'Enter' : 'Join the Sisterhood'}
          </button>
        </form>

        <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-xs text-primary/50 hover:text-primary mt-5 transition-colors">
          {isLogin ? 'New here? Create an account' : 'Already a Sister? Sign in'}
        </button>
      </div>
    </div>
  );
}
