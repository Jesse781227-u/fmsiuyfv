import { useState, useEffect } from 'react';
import { PenLine, Loader2 } from 'lucide-react';
import { CategoryBubbles } from '@/components/CategoryBubbles';
import { SpillCard } from '@/components/SpillCard';
import { SpillModal } from '@/components/SpillModal';
import { TherapistReplyModal } from '@/components/TherapistReplyModal';
import { Spill } from '@/lib/storage';
import { getSession, getAnonKey } from '@/lib/session';
import { getSpills, createSpill, reactToSpill, replyToSpill, addTherapistResponse, SessionUser } from '@/lib/api';
import { motion } from 'framer-motion';

export default function Home() {
  const [spills, setSpills] = useState<Spill[]>([]);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'latest' | 'reacted'>('latest');
  const [isSpillModalOpen, setIsSpillModalOpen] = useState(false);
  const [therapistModalOpen, setTherapistModalOpen] = useState(false);
  const [selectedSpillId, setSelectedSpillId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const userKey = currentUser?.email || getAnonKey();

  const fetchSpillsData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getSpills({ category: selectedCategory || '', sort: activeTab, userKey });
      setSpills(data);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUser(getSession());
    fetchSpillsData(true);
  }, []);

  useEffect(() => { fetchSpillsData(true); }, [selectedCategory, activeTab, userKey]);

  useEffect(() => {
    const interval = setInterval(() => fetchSpillsData(), 15000);
    return () => clearInterval(interval);
  }, [selectedCategory, activeTab, userKey]);

  const handleCreateSpill = async (data: { text: string; category: string; voiceBlob?: string }) => {
    const newSpill = await createSpill({
      text: data.text,
      voiceData: data.voiceBlob,
      category: data.category,
      sisterName: currentUser?.sisterName || 'Anonymous Sister',
    });
    if (newSpill) setSpills(prev => [newSpill, ...prev]);
  };

  const handleReact = async (spillId: string, type: 'heart' | 'pray' | 'relate' | 'hug') => {
    setSpills(prev => prev.map(s => {
      if (s.id !== spillId) return s;
      const isCurrentlyReacted = (s.userReactions as any)[type];
      return { ...s, reactions: { ...s.reactions, [type]: s.reactions[type] + (isCurrentlyReacted ? -1 : 1) }, userReactions: { ...s.userReactions, [type]: !isCurrentlyReacted } };
    }));
    const updated = await reactToSpill(spillId, userKey, type);
    if (updated) setSpills(prev => prev.map(s => s.id === spillId ? updated : s));
  };

  const handleReply = async (spillId: string, text: string) => {
    const updated = await replyToSpill(spillId, { sisterName: currentUser?.sisterName || 'Anonymous Sister', text });
    if (updated) setSpills(prev => prev.map(s => s.id === spillId ? updated : s));
  };

  const handleAddTherapistReply = async (text: string) => {
    if (!selectedSpillId) return;
    const updated = await addTherapistResponse(selectedSpillId, text);
    if (updated) setSpills(prev => prev.map(s => s.id === selectedSpillId ? updated : s));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-accent/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-xl font-bold text-primary tracking-tight leading-none">FORGIVE ME,</span>
          <span className="font-script text-3xl text-accent leading-none ml-1">Sister.</span>
        </div>
        <span className="text-[11px] tracking-widest text-primary/40 uppercase font-medium hidden sm:block">Confess · Heal · Be Free</span>
      </header>

      <CategoryBubbles selected={selectedCategory} onSelect={setSelectedCategory} />

      <div className="px-4 flex gap-5 border-b border-accent/15">
        {(['latest', 'reacted'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[13px] font-medium pb-2 border-b-2 transition-colors capitalize ${activeTab === tab ? 'text-primary border-primary' : 'text-primary/40 border-transparent'}`}>
            {tab === 'latest' ? 'Latest' : 'Most Reacted'}
          </button>
        ))}
      </div>

      <main className="px-4 pt-3 max-w-xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary/40" /></div>
        ) : spills.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <span className="text-4xl opacity-30">🕊️</span>
            <p className="text-sm text-primary/40 font-medium">{selectedCategory ? `No spills in this category yet.` : 'Be the first to spill your truth.'}</p>
          </div>
        ) : (
          spills.map((spill, idx) => (
            <motion.div key={spill.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.06, 0.3) }} className="relative group">
              <SpillCard spill={spill} currentUser={currentUser as any} onReact={handleReact} onReply={handleReply} />
              {!spill.therapistResponse && (
                <button onClick={() => { setSelectedSpillId(spill.id); setTherapistModalOpen(true); }} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[10px] bg-primary/80 text-accent px-2 py-0.5 rounded transition-opacity">
                  + Therapist (demo)
                </button>
              )}
            </motion.div>
          ))
        )}
      </main>

      <button onClick={() => setIsSpillModalOpen(true)} className="fixed bottom-20 right-4 bg-primary text-accent pl-4 pr-5 py-3 rounded-full shadow-lg border border-accent/40 flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform z-40" data-testid="fab-spill">
        <PenLine className="w-4 h-4" />
        <span className="font-serif text-base">Spill</span>
      </button>

      <SpillModal isOpen={isSpillModalOpen} onClose={() => setIsSpillModalOpen(false)} onSubmit={handleCreateSpill} />
      <TherapistReplyModal isOpen={therapistModalOpen} onClose={() => { setTherapistModalOpen(false); setSelectedSpillId(null); }} onSubmit={handleAddTherapistReply} />
    </div>
  );
}
