import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TherapistReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export function TherapistReplyModal({ isOpen, onClose, onSubmit }: TherapistReplyModalProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) { onSubmit(text); setText(''); onClose(); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-accent">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary text-center">Add Therapist Reply</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a compassionate response..." className="w-full bg-background border border-accent rounded-xl p-4 min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <button onClick={handleSubmit} disabled={!text.trim()} className="w-full bg-primary text-accent hover:bg-primary/90 font-serif text-lg py-3 rounded-xl transition-all disabled:opacity-50">
            Add Response
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
