import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const CATEGORIES = [
  { id: 'breakups', label: 'Breakups 💔' },
  { id: 'toxic_family', label: 'Toxic Family 🔥' },
  { id: 'body_shame', label: 'Body Shame 🩸' },
  { id: 'betrayal', label: 'Betrayal 🗡️' },
  { id: 'dark_secrets', label: 'Dark Secrets 🌑' },
  { id: 'lost_love', label: 'Lost Love 💔' },
  { id: 'faith_guilt', label: 'Faith & Guilt ✝️' },
  { id: 'career', label: 'Career 💼' },
  { id: 'marriage', label: 'Marriage 👰' },
  { id: 'addiction', label: 'Addiction 🌿' },
];

export function CategoryBubbles({ selected, onSelect }: { selected: string | null; onSelect: (id: string | null) => void }) {
  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 hide-scrollbar">
      <div className="flex gap-3 px-4 w-max">
        {CATEGORIES.map(cat => {
          const isSelected = selected === cat.id;
          return (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={cat.id}
              onClick={() => onSelect(isSelected ? null : cat.id)}
              className={cn(
                "px-5 py-2.5 rounded-full whitespace-nowrap font-medium text-sm transition-all border",
                isSelected
                  ? "bg-primary text-accent border-accent shadow-md"
                  : "bg-background text-primary border-primary/20 hover:border-accent"
              )}
            >
              {cat.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
