import type { BazaarEntry } from 'types/bazaar';

/** Visible category tags shown as item types (Weapon, Toy, Tool, …). */
export const getEntryTypes = (entry: BazaarEntry): string[] => entry.tags;

/** Mechanic tags (Burn, Shield, …) excluding types and redundant *Reference tags. */
export const getEntryMechanicTags = (entry: BazaarEntry): string[] => {
  const all = new Set([...entry.tags, ...entry.hiddenTags, ...entry.customTags]);
  return [...entry.hiddenTags, ...entry.customTags].filter((tag) => {
    if (entry.tags.includes(tag)) return false;
    if (tag.endsWith('Reference')) {
      const base = tag.slice(0, -'Reference'.length);
      if (all.has(base)) return false;
    }
    return true;
  });
};

/** Display label for a tag chip (`BurnReference` → `Burn` when shown alone). */
export const formatTagLabel = (tag: string): string =>
  tag.endsWith('Reference') ? tag.slice(0, -'Reference'.length) : tag;
