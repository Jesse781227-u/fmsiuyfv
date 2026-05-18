import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Star, Clock, Loader2 } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getPriorityConfessions, createPriorityConfession, SessionUser } from '@/lib/api';
import { PriorityConfession } from '@/lib/storage';
import { PaymentModal } from '@/components/PaymentModal';
import { CATEGORIES } from '@/components/CategoryBubbles';
import { timeAgo } from '@/lib/utils';

export default function Priority() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [confessions, setConfessions] = useState<PriorityConfession[]>([]);
  const [text, setText] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const overLimit = wordCount > 1000;

  const fetchConfessions = async () => {
    if (!currentUser) return;
    try {
      const data = await getPriorityConfessions(currentUser.email);
      setConfessions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getSession();
    if (!user) { setLocation('/profile'); return; }
    setCurrentUser(user);
  }, [setLocation]);

  useEffect(() => { if (currentUser) fetchConfessions(); }, [currentUser]);

  const handlePaymentSuccess = async () => {
    if (!currentUser) return;
    const newItem = await createPriorityConfession({ userEmail: currentUser.email, sisterName: currentUser.sisterName, text, category });
    if (newItem) { setConfessions(prev => [newItem, ...prev]); setText(''); }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary/5 border-b border-accent/20 px-4 py-5">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-accent fill-accent" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-primary font-bold">Priority Confession</h1>
            <p className="text-xs text-primary/50">Guaranteed therapist response within 24 hours</p>
          </div>
          <span className="ml-auto text-sm font-bold text-primary">₦5,000</span>
        </div>
      </header>

      <main className="p-4 max-w-xl mx-auto space-y-6 mt-2">
        <div className="bg-card border border-accent/40 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-medium text-primary/60 uppercase tracking-wide block mb-1.5">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-background border border-accent/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-primary/60 uppercase tracking-wide block mb-1.5">Your Confession</label>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write your full truth here. Take your time — this goes directly to the therapist." className="w-full bg-background border border-accent/40 rounded-xl p-3 min-h-[160px] resize-none focus:outline-none focus:ring-1 focus:ring-primary text-sm leading-relaxed" />
            <p className={`text-[11px] text-right mt-1 ${overLimit ? 'text-red-400' : 'text-primary/30'}`}>{wordCount}/1000 words</p>
          </div>
          <button onClick={() => setIsPaymentOpen(true)} disabled={!text.trim() || overLimit} className="w-full bg-primary text-accent py-3 rounded-xl font-serif font-semibold border border-transparent hover:border-accent/60 transition-colors disabled:opacity-40" data-testid="button-pay-priority">
            Pay ₦5,000 & Submit
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-base text-primary flex items-center gap-2"><Clock className="w-4 h-4 opacity-60" />Your Submissions</h3>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary/40" /></div>
          ) : confessions.length === 0 ? (
            <p className="text-sm text-primary/40 text-center py-4">No submissions yet.</p>
          ) : (
            confessions.map(c => (
              <div key={c.id} className="bg-card border border-accent/30 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-accent/20 border-l border-b border-accent/30 text-primary text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                  {c.therapistResponse ? 'Responded' : 'Pending'}
                </div>
                <p className="text-[10px] text-primary/40 mb-2">{timeAgo(c.timestamp)}</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{c.text}</p>
                {c.therapistResponse && (
                  <div className="mt-3 pt-3 border-t border-accent/20">
                    <p className="text-[10px] font-semibold text-accent uppercase tracking-widest mb-1">Therapist's Response</p>
                    <p className="text-sm text-foreground/80 italic">"{c.therapistResponse.text}"</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} amount={5000} featureName="Priority Confession Review" onSuccess={handlePaymentSuccess} />
    </div>
  );
}
