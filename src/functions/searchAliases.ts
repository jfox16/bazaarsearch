import type { Kind, Tier } from 'types/bazaar';

export const KIND_ALIASES: Record<string, Kind> = {
  item: 'item',
  items: 'item',
  skill: 'skill',
  skills: 'skill',
};

/** Short/nickname aliases for heroes (full names are matched from facets). */
export const HERO_ALIASES: Record<string, string> = {
  pyg: 'Pygmalien',
  pygmalion: 'Pygmalien',
  ball: 'Dooley',
  dool: 'Dooley',
  van: 'Vanessa',
  ness: 'Vanessa',
  nessa: 'Vanessa',
  karn: 'Karnok',
  stel: 'Stelle',
};

export const SIZE_ALIASES: Record<string, string> = {
  s: 'Small',
  small: 'Small',
  sm: 'Small',
  m: 'Medium',
  medium: 'Medium',
  med: 'Medium',
  md: 'Medium',
  l: 'Large',
  large: 'Large',
  lg: 'Large',
  lrg: 'Large',
  big: 'Large',
};

export const TIER_ALIASES: Record<string, Tier> = {
  b: 'Bronze',
  bronze: 'Bronze',
  s: 'Silver',
  silver: 'Silver',
  g: 'Gold',
  gold: 'Gold',
  d: 'Diamond',
  diamond: 'Diamond',
  l: 'Legendary',
  legendary: 'Legendary',
};

/** Common synonyms that map onto a real tag name. */
export const TAG_ALIASES: Record<string, string> = {
  fire: 'Burn',
  burning: 'Burn',
  dmg: 'Damage',
  economy: 'Income',
  econ: 'Income',
};
