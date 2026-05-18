import { useState } from 'react';
import { useLocation } from 'wouter';
import { Shield, Heart, Zap, Check } from 'lucide-react';
import { getSession, setSession } from '@/lib/session';
import { updatePlan } from '@/lib/api';
import { PaymentModal } from '@/components/PaymentModal';

export default function Premium() {
  const [, setLocation] = useLocation();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ amount: 0, name: '', id: 'free' });

  const handlePay = (amount: number, name: string, id: string) => {
    if (!getSession()) { setLocation('/profile'); return; }
    setSelectedPlan({ amount, name, id });
    setIsPaymentModalOpen(true);
  };

  const handleSuccess = async () => {
    const user = getSession();
    if (user) {
      const updated = await updatePlan(user.email, selectedPlan.id);
      if (updated) {
        setSession(updated);
        setLocation('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="pt-safe px-4 py-8 text-center bg-primary text-accent">
        <h1 className="font-serif text-3xl mb-2">Deeper Healing.</h1>
        <p className="font-script text-2xl text-accent/80">Premium Access</p>
      </header>

      <main className="p-4 max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mt-8">

        {/* Tier 1 — Priority Confession ₦5,000 */}
        <div className="bg-card border border-accent/50 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <Zap className="w-8 h-8 text-primary mb-2" />
            <h2 className="font-serif text-xl text-primary">Priority Confession</h2>
            <div className="text-2xl font-bold text-primary mt-2">₦5,000 <span className="text-sm font-normal text-muted-foreground">/one-time</span></div>
          </div>
          <ul className="space-y-3 mb-8 flex-1 text-sm text-foreground/80">
            <li className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0" />Skip the feed queue</li>
            <li className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0" />Guaranteed therapist response in 24h</li>
            <li className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0" />Extended character limit</li>
          </ul>
          <button
            onClick={() => handlePay(5000, 'Priority Confession', 'free')}
            className="w-full py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary/5 transition-colors"
            data-testid="button-pay-priority-plan"
          >
            Pay with Flutterwave
          </button>
        </div>

        {/* Tier 2 — Private Confessions ₦15,000 */}
        <div className="bg-primary border border-accent rounded-2xl p-6 shadow-lg flex flex-col relative transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-primary text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
            Recommended
          </div>
          <div className="mb-4">
            <Heart className="w-8 h-8 text-accent mb-2" />
            <h2 className="font-serif text-xl text-accent">Private Confessions</h2>
            <div className="text-2xl font-bold text-accent mt-2">₦15,000 <span className="text-sm font-normal opacity-80">/month</span></div>
          </div>
          <ul className="space-y-3 mb-8 flex-1 text-sm text-accent/90">
            <li className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0" />Unlimited private messages</li>
            <li className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0" />Weekly check-ins from therapist</li>
            <li className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0" />Voice notes in private chat</li>
          </ul>
          <button
            onClick={() => handlePay(15000, 'Private Confessions', 'private')}
            className="w-full py-3 rounded-xl bg-accent text-primary font-bold hover:bg-white transition-colors"
            data-testid="button-pay-private-plan"
          >
            Pay with Flutterwave
          </button>
        </div>

        {/* Tier 3 — Matchmaking ₦50,000 */}
        <div className="bg-card border border-accent/50 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <Shield className="w-8 h-8 text-primary mb-2" />
            <h2 className="font-serif text-xl text-primary">Matchmaking</h2>
            <div className="text-2xl font-bold text-primary mt-2">₦50,000 <span className="text-sm font-normal text-muted-foreground">/month</span></div>
          </div>
          <ul className="space-y-3 mb-8 flex-1 text-sm text-foreground/80">
            <li className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0" />All lower tier features</li>
            <li className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0" />Curated sister matching</li>
            <li className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0" />Private group circles</li>
            <li className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0" />1-on-1 matchmaker sessions</li>
          </ul>
          <button
            onClick={() => handlePay(50000, 'Matchmaking', 'matchmaking')}
            className="w-full py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary/5 transition-colors"
            data-testid="button-pay-matchmaking-plan"
          >
            Pay with Flutterwave
          </button>
        </div>

      </main>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={selectedPlan.amount}
        featureName={selectedPlan.name}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
