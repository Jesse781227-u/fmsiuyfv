import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { wordCount } from '@/lib/utils';
import { CATEGORIES } from './CategoryBubbles';
import { VoiceRecorder } from './VoiceRecorder';

interface SpillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { text: string; category: string; voiceBlob?: string }) => void;
}

export function SpillModal({ isOpen, onClose, onSubmit }: SpillModalProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [voiceBlob, setVoiceBlob] = useState<string | undefined>();
  const [isRecordingMode, setIsRecordingMode] = useState(false);

  const words = wordCount(text);
  const isOverLimit = words > 500;

  const handleSubmit = () => {
    if ((text.trim() || voiceBlob) && !isOverLimit) {
      onSubmit({ text, category, voiceBlob });
      setText('');
      setCategory(CATEGORIES[0].id);
      setVoiceBlob(undefined);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-accent text-foreground">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary text-center">Spill Your Truth, Sister</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-background border border-accent rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsRecordingMode(false)} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${!isRecordingMode ? 'bg-primary text-accent border-primary' : 'bg-background text-primary border-accent/50'}`}>Write it out</button>
            <button onClick={() => setIsRecordingMode(true)} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${isRecordingMode ? 'bg-primary text-accent border-primary' : 'bg-background text-primary border-accent/50'}`}>Voice Note</button>
          </div>
          {isRecordingMode ? (
            <div className="border border-accent rounded-xl p-4 bg-background">
              {voiceBlob ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="text-sm text-primary font-medium">Recording saved 💛</div>
                  <button onClick={() => setVoiceBlob(undefined)} className="text-xs text-destructive hover:underline">Delete & Re-record</button>
                </div>
              ) : <VoiceRecorder onComplete={setVoiceBlob} />}
            </div>
          ) : (
            <div className="relative">
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What's heavy on your heart today?" className="w-full bg-background border border-accent rounded-xl p-4 min-h-[200px] resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              <div className={`absolute bottom-3 right-3 text-xs ${isOverLimit ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>{words}/500</div>
            </div>
          )}
          <button onClick={handleSubmit} disabled={(!text.trim() && !voiceBlob) || isOverLimit} className="w-full bg-primary text-accent hover:bg-primary/90 font-serif text-lg py-3 rounded-xl border-2 border-transparent hover:border-accent transition-all disabled:opacity-50 disabled:pointer-events-none">
            Spill It 💛
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
