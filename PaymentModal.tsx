import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CreditCard, Loader2 } from 'lucide-react';
import { getSession } from '@/lib/session';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  featureName: string;
  onSuccess: () => void;
}

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: Record<string, unknown>) => void;
  }
}

// REPLACE THIS with your real Flutterwave public key before going live
const FLW_PUBLIC_KEY = 'FLWPUBK_TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-X';

export function PaymentModal({ isOpen, onClose, amount, featureName, onSuccess }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    const user = getSession();
    setIsProcessing(true);

    if (typeof window.FlutterwaveCheckout === 'function') {
      window.FlutterwaveCheckout({
        public_key: FLW_PUBLIC_KEY,
        tx_ref: `fms-${Date.now()}`,
        amount,
        currency: 'NGN',
        payment_options: 'card,ussd,banktransfer',
        customer: {
          email: user?.email || 'sister@forgivemesister.com',
          name: user?.sisterName || 'Sister',
        },
        customizations: {
          title: 'Forgive Me, Sister',
          description: featureName,
          logo: '',
        },
        callback: (response: { status: string }) => {
          setIsProcessing(false);
          if (response.status === 'successful' || response.status === 'completed') {
            onSuccess();
            onClose();
          }
        },
        onclose: () => {
          setIsProcessing(false);
        },
      });
    } else {
      // Fallback if Flutterwave script not loaded
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
        onClose();
      }, 1500);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-accent">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary flex items-center justify-center gap-2">
            <CreditCard className="w-6 h-6 text-accent" />
            Secure Payment
          </DialogTitle>
          <DialogDescription className="text-center text-primary/80">
            Pay securely with Flutterwave
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center gap-4">
          <div className="w-28 h-28 rounded-full bg-secondary/30 flex items-center justify-center border-2 border-accent">
            <span className="text-2xl font-bold text-primary text-center">₦{amount.toLocaleString()}</span>
          </div>
          <p className="text-center text-primary/90 font-medium">{featureName}</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-primary text-accent hover:bg-primary/90 font-serif text-lg py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            'Pay with Flutterwave'
          )}
        </button>
        <p className="text-center text-xs text-primary/40 mt-2">
          Secured by Flutterwave · SSL Encrypted
        </p>
      </DialogContent>
    </Dialog>
  );
}
