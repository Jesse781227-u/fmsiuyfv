import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Send, Loader2 } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getPrivateMessages, sendPrivateMessage, SessionUser } from '@/lib/api';
import { PrivateMessage } from '@/lib/storage';
import { PaymentModal } from '@/components/PaymentModal';
import { timeAgo } from '@/lib/utils';

export default function Private() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!currentUser) return;
    try {
      const data = await getPrivateMessages(currentUser.email);
      setMessages(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getSession();
    if (!user) { setLocation('/profile'); return; }
    setCurrentUser(user);
  }, [setLocation]);

  useEffect(() => {
    if (!currentUser) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const overLimit = wordCount > 500;

  const handleSend = async () => {
    if (!input.trim() || overLimit || !currentUser) return;
    setIsSending(true);
    try {
      const msg = await sendPrivateMessage({ userEmail: currentUser.email, text: input.trim() });
      if (msg) { setMessages(prev => [...prev, msg]); setInput(''); }
    } catch (err: any) {
      if (err.message === 'upgrade_required') setIsPaymentOpen(true);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpgradeDone = () => {
    const user = getSession();
    if (user) setCurrentUser(user);
  };

  if (!currentUser) return null;

  const needsUpgrade = currentUser.plan === 'free';

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      <header className="bg-primary text-accent px-4 py-4 sticky top-0 z-10 border-b border-accent/20">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-semibold leading-tight">Private Confessional</h1>
            <p className="font-script text-xl text-accent/80 leading-tight">your therapist is listening</p>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-accent/50 text-right">{currentUser.sisterName}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 max-w-xl mx-auto w-full space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary/40" /></div>
        ) : messages.length === 0 && !needsUpgrade ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="text-4xl opacity-30">🕊️</span>
            <p className="font-serif text-primary/50 text-sm">This space is sacred. Whatever you share stays between you and your therapist.</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-primary text-accent rounded-br-sm' : 'bg-card border border-accent/60 text-primary rounded-bl-sm shadow-sm'}`}>
                {msg.sender === 'therapist' && <p className="text-[9px] uppercase tracking-widest font-semibold mb-1 opacity-60">Therapist</p>}
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 opacity-50 ${msg.sender === 'user' ? 'text-right' : ''}`}>{timeAgo(msg.timestamp)}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </main>

      <div className="bg-background border-t border-accent/20 px-4 py-3 max-w-xl mx-auto w-full sticky bottom-16">
        {needsUpgrade ? (
          <div className="bg-primary/5 border border-accent/40 rounded-2xl p-4 text-center space-y-3">
            <p className="font-serif text-primary text-sm">Private Confessions requires a subscription.</p>
            <p className="text-xs text-primary/60">₦15,000/month — unlimited messages, weekly check-ins</p>
            <button onClick={() => setIsPaymentOpen(true)} className="bg-primary text-accent px-6 py-2.5 rounded-xl font-serif font-semibold text-sm border border-accent/40 hover:border-accent transition-colors w-full" data-testid="button-unlock-private">
              Unlock Private Confessions
            </button>
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Write what you need to say..." className="w-full bg-card border border-accent/50 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none min-h-[46px] max-h-28" rows={1} />
              <span className={`absolute bottom-2 right-3 text-[10px] ${overLimit ? 'text-red-400' : 'text-primary/30'}`}>{wordCount}/500</span>
            </div>
            <button onClick={handleSend} disabled={!input.trim() || overLimit || isSending} className="bg-primary text-accent p-3 rounded-xl disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0" data-testid="button-send-private">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} amount={15000} featureName="Private Confessions — ₦15,000/month" onSuccess={handleUpgradeDone} />
    </div>
  );
}
