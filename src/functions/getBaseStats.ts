import type { StatKey } from 'components/StatIcon/StatIcon';
import type { BazaarEntry } from 'types/bazaar';

export interface BaseStat {
  stat: StatKey;
  value: number;
}

// Each stat is pulled from the starting-tier tooltip text. Order here is the
// display order (offense first, then defense/sustain, then tempo).
const PATTERNS: { stat: StatKey; regexes: RegExp[] }[] = [
  { stat: 'damage', regexes: [/Deal\s+(\d+)\s+Damage/i] },
  { stat: 'burn', regexes: [/\bBurn\s+(\d+)/i] },
  { stat: 'poison', regexes: [/\bPoison\s+(\d+)/i] },
  { stat: 'shield', regexes: [/\bShield\s+(\d+)/i, /\bGain\s+(\d+)\s+Shield/i] },
  { stat: 'heal', regexes: [/\bHeal\s+(\d+)/i] },
  { stat: 'regen', regexes: [/(\d+)\s+Regen/i] },
  {
    stat: 'haste',
    regexes: [
      /\bHaste\b(?!\s*(?:,|or))[^.]*?(\d+)\s*seconds?\b/i,
      /\bis Hasted\s+for\s+(\d+)\s*seconds?\b/i,
    ],
  },
  { stat: 'slow', regexes: [/\bSlow\b(?!\s*(?:,|or))[^.]*?(\d+)\s*seconds?\b/i] },
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
  for (const { stat, regexes } of PATTERNS) {
    let matched = false;
    for (const tip of tooltips) {
      for (const regex of regexes) {
        const match = tip.match(regex);
        if (match) {
          stats.push({ stat, value: Number(match[1]) });
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
  }
  return stats;
};
