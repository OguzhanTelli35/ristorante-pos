import React from 'react';
import type { OrderItem } from '@ristorante/shared';
import { getIngredientModifications } from '@ristorante/shared';

interface ModificationChipsProps {
  item: OrderItem;
}

export default function ModificationChips({ item }: ModificationChipsProps) {
  const { added, removed } = getIngredientModifications(item);

  if (added.length === 0 && removed.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-0.5">
      {removed.map((r) => (
        <span
          key={`rm-${r}`}
          className="text-[9px] px-1 py-px rounded bg-red-500/10 text-red-400 border border-red-500/15 font-medium"
        >
          − {r}
        </span>
      ))}
      {added.map((a) => (
        <span
          key={`add-${a}`}
          className="text-[9px] px-1 py-px rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-medium"
        >
          + {a}
        </span>
      ))}
    </div>
  );
}
