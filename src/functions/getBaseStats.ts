import type { StatKey } from 'components/StatIcon/StatIcon';
import type { BazaarEntry } from 'types/bazaar';

export interface BaseStat {
  stat: StatKey;
  value: number;
}

// Each stat is pulled from the starting-tier tooltip text. Order here is the
// display order (offense first, then defense/sustain).
const PATTERNS: { stat: StatKey; regex: RegExp }[] = [
  { stat: 'damage', regex: /Deal\s+(\d+)\s+Damage/i },
  { stat: 'burn', regex: /\bBurn\s+(\d+)/i },
  { stat: 'poison', regex: /\bPoison\s+(\d+)/i },
  { stat: 'shield', regex: /\bShield\s+(\d+)/i },
  { stat: 'heal', regex: /\bHeal\s+(\d+)/i },
  { stat: 'regen', regex: /(\d+)\s+Regen/i },
];

/**
 * Extracts the base (starting-tier) combat stats from an entry's tooltips,
 * e.g. Angle Grinder Drone -> [{ damage: 10 }]. Returns them in display order;
 * stats not present are omitted.
 */
export const getBaseStats = (entry: BazaarEntry): BaseStat[] => {
  const tier = entry.startingTier;
  const tooltips = (tier && entry.tiers[tier]) || [];
  if (tooltips.length === 0) return [];

  const stats: BaseStat[] = [];
  for (const { stat, regex } of PATTERNS) {
    for (const tip of tooltips) {
      const match = tip.match(regex);
      if (match) {
        stats.push({ stat, value: Number(match[1]) });
        break;
      }
    }
  }
  return stats;
};
