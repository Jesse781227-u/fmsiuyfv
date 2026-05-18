import React, { useState } from 'react';
import { Reply as ReplyIcon } from 'lucide-react';
import { Spill, Reply, User } from '@/lib/storage';
import { timeAgo } from '@/lib/utils';
import { AudioPlayer } from './AudioPlayer';
import { cn } from '@/lib/utils';

interface SpillCardProps {
  spill: Spill;
  currentUser: User | null;
  onReact: (spillId: string, type: 'heart' | 'pray' | 'relate' | 'hug') => void;
  onReply: (spillId: string, text: string) => void;
}

const REACTIONS = [
  { key: 'heart',  emoji: '❤️',  label: 'Heart'  },
  { key: 'pray',   emoji: '🙏',  label: 'Pray'   },
  { key: 'relate', emoji: '😭',  label: 'Relate' },
  { key: 'hug',    emoji: '🤗',  label: 'Hug'    },
] as const;

export function SpillCard({ spill, currentUser, onReact, onReply }: SpillCardProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const submitReply = () => {
    if (!replyText.trim()) return;
    onReply(spill.id, replyText.trim());
    setReplyText('');
    setShowReply(false);
  };

  return (
    <div className="bg-card border border-accent/40 rounded-2xl p-4 shadow-sm mb-3 hover:border-accent/70 transition-colors" data-testid={`spill-card-${spill.id}`}>
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-baseline gap-2">
          <span className="font-script text-[22px] text-primary leading-none">{spill.sisterName}</span>
          <span className="text-[10px] text-primary/35">{timeAgo(spill.timestamp)}</span>
        </div>
        <span className="text-[10px] font-medium px-2.5 py-1 bg-secondary/60 rounded-full text-primary/70 ml-2 shrink-0">{spill.category}</span>
      </div>
      {spill.voiceBlob ? <AudioPlayer src={spill.voiceBlob} /> : <p className="text-[14px] text-foreground leading-relaxed">{spill.text}</p>}
      {spill.therapistResponse && (
        <div className="mt-3 bg-accent/8 border border-accent/40 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
              <span className="text-primary text-[9px] font-black">T</span>
            </div>
            <span className="text-[11px] font-semibold text-primary tracking-wide">Therapist's Note</span>
          </div>
          <p className="text-[13px] text-foreground/80 italic leading-relaxed">"{spill.therapistResponse.text}"</p>
        </div>
      )}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-accent/15">
        <div className="flex gap-1.5">
          {REACTIONS.map(r => {
            const active = (spill.userReactions as any)[r.key];
            return (
              <button key={r.key} onClick={() => onReact(spill.id, r.key)} className={cn('flex items-center gap-1 text-[11px] px-2 py-1 rounded-full transition-all', active ? 'bg-accent/20 border border-accent/60 text-primary' : 'bg-secondary/40 text-primary/60 hover:bg-accent/10 border border-transparent')} data-testid={`button-react-${r.key}-${spill.id}`}>
                <span className="text-[13px] leading-none">{r.emoji}</span>
                <span>{spill.reactions[r.key]}</span>
              </button>
            );
          })}
        </div>
        <button onClick={() => setShowReply(!showReply)} className="flex items-center gap-1 text-[11px] text-primary/50 hover:text-primary transition-colors font-medium" data-testid={`button-reply-${spill.id}`}>
          <ReplyIcon className="w-3.5 h-3.5" />
          Reply
          {spill.replies.length > 0 && <span className="ml-0.5 opacity-60">({spill.replies.length})</span>}
        </button>
      </div>
      {showReply && (
        <div className="mt-3 space-y-2">
          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Share some warmth, Sister..." className="w-full bg-background border border-accent/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none h-16" data-testid={`input-reply-${spill.id}`} />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowReply(false)} className="text-xs text-primary/50 px-3 py-1.5 hover:text-primary transition-colors">Cancel</button>
            <button onClick={submitReply} disabled={!replyText.trim()} className="bg-primary text-accent text-xs px-4 py-1.5 rounded-full font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors">Send</button>
          </div>
        </div>
      )}
      {spill.replies.length > 0 && (
        <div className="mt-3 space-y-2.5 pl-3 border-l-2 border-accent/20">
          {spill.replies.map(reply => <ReplyThread key={reply.id} reply={reply} />)}
        </div>
      )}
    </div>
  );
}

function ReplyThread({ reply, depth = 0 }: { reply: Reply; depth?: number }) {
  const [showNested, setShowNested] = useState(false);
  const [nestedText, setNestedText] = useState('');

  return (
    <div className={cn('space-y-1', depth > 0 && 'pl-3 border-l border-accent/15 mt-2')}>
      <div className="flex items-baseline gap-2">
        <span className="font-script text-[18px] text-primary leading-none">{reply.sisterName}</span>
        <span className="text-[10px] text-primary/30">{timeAgo(reply.timestamp)}</span>
      </div>
      {reply.voiceBlob ? <AudioPlayer src={reply.voiceBlob} /> : <p className="text-[13px] text-foreground/80 leading-relaxed">{reply.text}</p>}
      <button onClick={() => setShowNested(!showNested)} className="text-[10px] text-primary/40 hover:text-primary transition-colors">↳ Reply</button>
      {showNested && (
        <div className="pl-3 space-y-1.5">
          <textarea value={nestedText} onChange={e => setNestedText(e.target.value)} placeholder="Reply..." className="w-full bg-background border border-accent/30 rounded-lg px-3 py-2 text-xs focus:outline-none resize-none h-14" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNested(false)} className="text-[10px] text-primary/40 px-2 py-1">Cancel</button>
            <button disabled={!nestedText.trim()} className="bg-primary text-accent text-[10px] px-3 py-1 rounded-full disabled:opacity-40">Send</button>
          </div>
        </div>
      )}
      {reply.replies?.map(nested => <ReplyThread key={nested.id} reply={nested} depth={depth + 1} />)}
    </div>
  );
}
