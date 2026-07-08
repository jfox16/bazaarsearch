export type Kind = 'item' | 'skill';
export type Size = 'Small' | 'Medium' | 'Large';
export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Legendary';

/** A single item or skill in the trimmed, bundled dataset. */
export interface BazaarEntry {
  id: string;
  name: string;
  kind: Kind;
  size: Size | null;
  startingTier: Tier | null;
  heroes: string[];
  /** Visible category tags (e.g. Weapon, Potion, Aquatic). */
  tags: string[];
  /** Mechanic/reference tags (e.g. Burn, Poison, Crit) used for filtering. */
  hiddenTags: string[];
  customTags: string[];
  /** Tooltips per tier; empty tiers are included as empty arrays. */
  tiers: Partial<Record<Tier, string[]>>;
  /** Merged "(+15/+25)" style tooltips for compact display. */
  unifiedTooltips: string[];
  imageUrl: string;
}

export interface Facets {
  heroes: string[];
  sizes: string[];
  tiers: string[];
  tags: string[];
  enchantments: string[];
}

export interface DatasetMeta {
  generatedAt: string;
  source: string;
  versions: { items: string | null; skills: string | null };
  itemCount: number;
  skillCount: number;
}

export interface BazaarDataset {
  meta: DatasetMeta;
  facets: Facets;
  entries: BazaarEntry[];
}

export interface Enchantment {
  type: string;
  tooltips: string[];
}

/**
 * Curated short descriptions for statless cards, keyed by the card's exact
 * `name`. Intentionally partial — cards without an entry show no description.
 */
export type CardDescriptions = Record<string, string>;

/** Lazily loaded, keyed by item id. */
export interface EnchantmentsData {
  meta: { generatedAt: string; count: number };
  byId: Record<string, Enchantment[]>;
}

/** Set-based filter keys that support toggling a single value on/off. */
export type ToggleFilterKey = 'kinds' | 'heroes' | 'sizes' | 'tiers' | 'tags';

export interface BazaarFilter {
  text: string;
  kinds: Set<Kind>;
  heroes: Set<string>;
  sizes: Set<string>;
  tiers: Set<string>;
  tags: Set<string>;
  /** When true, an entry must have every selected tag; otherwise any. */
  tagMatchAll: boolean;
}
