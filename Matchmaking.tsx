import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Heart, Loader2, Clock } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getMatchmakingRequests, createMatchmakingRequest, SessionUser } from '@/lib/api';
import { MatchmakingRequest } from '@/lib/storage';
import { timeAgo } from '@/lib/utils';
import { PaymentModal } from '@/components/PaymentModal';

const AGE_RANGES = ['18–24', '25–30', '31–36', '37–42', '43–50', '50+'];

const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-800 border-yellow-300',
  matched:  'bg-green-100 text-green-800 border-green-300',
  closed:   'bg-gray-100 text-gray-600 border-gray-300',
};

export default function Matchmaking() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [requests, setRequests] = useState<MatchmakingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const [form, setForm] = useState({
    ageRange: AGE_RANGES[0],
    location: '',
    interests: '',
    dealbreakers: '',
    bio: '',
  });

  useEffect(() => {
    const user = getSession();
    if (!user) { setLocation('/profile'); return; }
    if (user.plan !== 'matchmaking') { setLocation('/premium'); return; }
    setCurrentUser(user);
  }, [setLocation]);

  useEffect(() => {
    if (!currentUser) return;
    fetchRequests();
  }, [currentUser]);

  const fetchRequests = async () => {
    if (!currentUser) return;
    setLoading(true);
    const data = await getMatchmakingRequests(currentUser.email);
    setRequests(data);
    setLoading(false);
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = form.location.trim() && form.interests.trim() && form.bio.trim();

  const handleSubmit = async () => {
    if (!currentUser || !isFormValid) return;
    setIsSubmitting(true);
    const req = await createMatchmakingRequest({
      userEmail: currentUser.email,
      sisterName: currentUser.sisterName,
      ageRange: form.ageRange,
      location: form.location.trim(),
      interests: form.interests.trim(),
      dealbreakers: form.dealbreakers.trim(),
      bio: form.bio.trim(),
    });
    setIsSubmitting(false);
    if (req) {
      setRequests(prev => [req, ...prev]);
      setShowForm(false);
      setForm({ ageRange: AGE_RANGES[0], location: '', interests: '', dealbreakers: '', bio: '' });
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-accent px-4 py-5 border-b border-accent/20">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-primary fill-primary" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold leading-tight">Matchmaking</h1>
            <p className="text-xs text-accent/70">Curated sister connections</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-xl mx-auto space-y-5 mt-2">

        {/* Intro card */}
        <div className="bg-accent/10 border border-accent/40 rounded-2xl p-4 text-sm text-primary/80 leading-relaxed">
          <p>Our team personally reviews each request and connects you with compatible sisters — based on your values, interests, and heart. All connections are private and verified.</p>
        </div>

        {/* New request button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-primary text-accent py-3 rounded-xl font-serif font-semibold border border-transparent hover:border-accent/60 transition-colors flex items-center justify-center gap-2"
            data-testid="button-new-matchmaking"
          >
            <Heart className="w-4 h-4" />
            Submit Matchmaking Request
          </button>
        )}

        {/* Request Form */}
        {showForm && (
          <div className="bg-card border border-accent/40 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="font-serif text-lg text-primary">Your Profile for Matching</h2>

            <div>
              <label className="text-xs font-medium text-primary/60 uppercase tracking-wide block mb-1.5">Age Range</label>
              <select value={form.ageRange} onChange={e => handleChange('ageRange', e.target.value)} className="w-full bg-background border border-accent/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                {AGE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-primary/60 uppercase tracking-wide block mb-1.5">Location (State / City)</label>
              <input value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="e.g. Lagos, Nigeria" className="w-full bg-background border border-accent/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" data-testid="input-location" />
            </div>

            <div>
              <label className="text-xs font-medium text-primary/60 uppercase tracking-wide block mb-1.5">Interests & Values</label>
              <textarea value={form.interests} onChange={e => handleChange('interests', e.target.value)} placeholder="What do you love? What matters most to you?" className="w-full bg-background border border-accent/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none h-24" data-testid="input-interests" />
            </div>

            <div>
              <label className="text-xs font-medium text-primary/60 uppercase tracking-wide block mb-1.5">Dealbreakers (optional)</label>
              <textarea value={form.dealbreakers} onChange={e => handleChange('dealbreakers', e.target.value)} placeholder="Anything that would make a connection incompatible?" className="w-full bg-background border border-accent/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none h-16" />
            </div>

            <div>
              <label className="text-xs font-medium text-primary/60 uppercase tracking-wide block mb-1.5">About You (Bio)</label>
              <textarea value={form.bio} onChange={e => handleChange('bio', e.target.value)} placeholder="Tell us who you are — the real you..." className="w-full bg-background border border-accent/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none h-28" data-testid="input-bio" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-primary/30 text-primary/60 text-sm hover:border-primary transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={!isFormValid || isSubmitting} className="flex-1 bg-primary text-accent py-2.5 rounded-xl font-medium text-sm border border-transparent hover:border-accent/60 disabled:opacity-40 transition-colors flex items-center justify-center gap-2" data-testid="button-submit-matchmaking">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
              </button>
            </div>
          </div>
        )}

        {/* Existing Requests */}
        <div className="space-y-3">
          <h3 className="font-serif text-base text-primary flex items-center gap-2">
            <Clock className="w-4 h-4 opacity-60" />
            Your Requests
          </h3>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary/40" /></div>
          ) : requests.length === 0 ? (
            <p className="text-sm text-primary/40 text-center py-4">No requests yet. Submit your first matchmaking request above.</p>
          ) : (
            requests.map(req => (
              <div key={req.id} className="bg-card border border-accent/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${STATUS_COLORS[req.status]}`}>
                    {req.status}
                  </span>
                  <span className="text-[10px] text-primary/40">{timeAgo(req.createdAt)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-primary/70">
                  <div><span className="font-semibold">Age:</span> {req.ageRange}</div>
                  <div><span className="font-semibold">Location:</span> {req.location}</div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{req.bio}</p>

                {req.adminNotes && (
                  <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 mt-2">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Message from Team</p>
                    <p className="text-sm text-foreground/80">{req.adminNotes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={50000}
        featureName="Matchmaking — ₦50,000/month"
        onSuccess={() => {}}
      />
    </div>
  );
}
