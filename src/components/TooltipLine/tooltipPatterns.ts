import type { StatKey } from 'components/StatIcon/StatIcon';

export const TIER_VALUE_RE = /^\(([^)]+\/[^)]+)\)$/;
export const TIER_SLASH_RE = /^(\+?[\d.]+(?:\/\+?[\d.]+)+)$/;
export const TIER_GROUP_RE = /\(([^)]+\/[^)]+)\)/g;
export const SCALING_VALUE =
  '(?:\\([^)]+\/[^)]+\\)|\\+?[\\d.]+(?:\\/\\+?[\\d.]+)+|[\\d.]+%?)';

export const COOLDOWN_LINE_RE = /^Cooldown\s+((?:\([^)]+\/[^)]+\)|[\d.]+))\s+seconds?\.?$/i;
export const AMMO_LINE_RE = /^Ammo\s+((?:\([^)]+\/[^)]+\)|[\d.]+))\.?$/i;
export const MULTICAST_LINE_RE = /^Multicast\s+((?:\([^)]+\/[^)]+\)|[\d.]+))\.?$/i;

export interface StatMatch {
  start: number;
  end: number;
  stat: StatKey;
  value: string;
  prefix?: string;
  label?: string;
  middle?: string;
  suffix?: string;
  trailing?: string;
  layout: 'valueIconSuffix' | 'labelValueIcon' | 'labelMiddleValueIcon';
  /** Shield stat references (e.g. "gains +10 Shield") omit the icon; shielding actions show it. */
  showIcon?: boolean;
}

interface StatPattern {
  stat: StatKey;
  regex: RegExp;
  getMatch: (exec: RegExpExecArray) => Omit<StatMatch, 'start' | 'end'>;
}

// Longer phrases first so "Crit Chance" wins over "Crit".
export const TEXT_HIGHLIGHT_PATTERNS: { regex: RegExp; colorVar: string }[] = [
  { regex: /\bCrit Chance\b/gi, colorVar: 'var(--stat-damage)' },
  { regex: /\bCrit\b/gi, colorVar: 'var(--stat-damage)' },
  { regex: /\bRestorative\b/gi, colorVar: 'var(--enchant-restorative)' },
  { regex: /\bShielded\b/gi, colorVar: 'var(--enchant-shielded)' },
  { regex: /\bObsidian\b/gi, colorVar: 'var(--enchant-obsidian)' },
  { regex: /\bGolden\b/gi, colorVar: 'var(--enchant-golden)' },
  { regex: /\bDeadly\b/gi, colorVar: 'var(--enchant-deadly)' },
  { regex: /\bFiery\b/gi, colorVar: 'var(--enchant-fiery)' },
  { regex: /\bHeavy\b/gi, colorVar: 'var(--enchant-heavy)' },
  { regex: /\bToxic\b/gi, colorVar: 'var(--enchant-toxic)' },
  { regex: /\bTurbo\b/gi, colorVar: 'var(--enchant-turbo)' },
  { regex: /\bIcy\b/gi, colorVar: 'var(--enchant-icy)' },
];

// Order matters: longer / more specific patterns first.
export const STAT_PATTERNS: StatPattern[] = [
  {
    stat: 'haste',
    regex: new RegExp(
      `\\bHaste\\b(\\s+(?:(?:\\d+\\s+items?|an?\\s+(?:item|\\w+)|your[\\w\\s,]+?)\\s+for\\s+|this\\s+))(${SCALING_VALUE})(\\s+second(?:\\(s\\)|s)?)`,
      'gi',
    ),
    getMatch: (m) => ({
      stat: 'haste',
      label: 'Haste',
      middle: m[1],
      value: m[2],
      trailing: m[3],
      layout: 'labelMiddleValueIcon',
    }),
  },
  {
    stat: 'damage',
    regex: new RegExp(`\\bDeal\\s+(${SCALING_VALUE})\\s+Damage\\b`, 'gi'),
    getMatch: (m) => ({
      stat: 'damage',
      value: m[1],
      prefix: 'Deal ',
      suffix: ' Damage',
      layout: 'valueIconSuffix',
    }),
  },
  {
    stat: 'damage',
    regex: new RegExp(`\\b(gains?)\\s+(${SCALING_VALUE})(\\s+Damage)\\b`, 'gi'),
    getMatch: (m) => ({
      stat: 'damage',
      value: m[2],
      prefix: `${m[1]} `,
      suffix: m[3],
      layout: 'valueIconSuffix',
    }),
  },
  {
    stat: 'shield',
    regex: new RegExp(`\\b(permanently\\s+gain)\\s+(${SCALING_VALUE})(\\s+Shield)\\b`, 'gi'),
    getMatch: (m) => ({
      stat: 'shield',
      value: m[2],
      prefix: `${m[1]} `,
      suffix: m[3],
      layout: 'valueIconSuffix',
      showIcon: false,
    }),
  },
  {
    stat: 'shield',
    regex: new RegExp(`\\b(gains)\\s+(${SCALING_VALUE})(\\s+Shield)\\b`, 'gi'),
    getMatch: (m) => ({
      stat: 'shield',
      value: m[2],
      prefix: `${m[1]} `,
      suffix: m[3],
      layout: 'valueIconSuffix',
      showIcon: false,
    }),
  },
  {
    stat: 'shield',
    regex: new RegExp(`\\b(Gain)\\s+(${SCALING_VALUE})\\s+Shield\\b`, 'gi'),
    getMatch: (m) => ({
      stat: 'shield',
      value: m[2],
      prefix: `${m[1]} `,
      suffix: ' Shield',
      layout: 'valueIconSuffix',
    }),
  },
  {
    stat: 'poison',
    regex: new RegExp(`\\b(gains?)\\s+(${SCALING_VALUE})(\\s+Poison)\\b`, 'gi'),
    getMatch: (m) => ({
      stat: 'poison',
      value: m[2],
      prefix: `${m[1]} `,
      suffix: m[3],
      layout: 'valueIconSuffix',
    }),
  },
  {
    stat: 'regen',
    regex: new RegExp(`\\b(${SCALING_VALUE})\\s+Regen\\b`, 'gi'),
    getMatch: (m) => ({
      stat: 'regen',
      label: 'Regen ',
      value: m[1],
      layout: 'labelValueIcon',
    }),
  },
  {
    stat: 'burn',
    regex: new RegExp(`\\bBurn\\s+(${SCALING_VALUE})(\\.)?`, 'gi'),
    getMatch: (m) => ({
      stat: 'burn',
      label: 'Burn ',
      value: m[1],
      trailing: m[2] ?? '',
      layout: 'labelValueIcon',
    }),
  },
  {
    stat: 'poison',
    regex: new RegExp(`\\bPoison\\s+(${SCALING_VALUE})(\\.)?`, 'gi'),
    getMatch: (m) => ({
      stat: 'poison',
      label: 'Poison ',
      value: m[1],
      trailing: m[2] ?? '',
      layout: 'labelValueIcon',
    }),
  },
  {
    stat: 'shield',
    regex: new RegExp(`\\bShield\\s+(${SCALING_VALUE})(\\.)?`, 'gi'),
    getMatch: (m) => ({
      stat: 'shield',
      label: 'Shield ',
      value: m[1],
      trailing: m[2] ?? '',
      layout: 'labelValueIcon',
    }),
  },
  {
    stat: 'shield',
    regex: new RegExp(`(${SCALING_VALUE})\\s+Shield\\b`, 'gi'),
    getMatch: (m) => ({
      stat: 'shield',
      value: m[1],
      suffix: ' Shield',
      layout: 'valueIconSuffix',
      showIcon: false,
    }),
  },
  {
    stat: 'heal',
    regex: new RegExp(`\\bHeal\\s+(${SCALING_VALUE})(\\.)?`, 'gi'),
    getMatch: (m) => ({
      stat: 'heal',
      label: 'Heal ',
      value: m[1],
      trailing: m[2] ?? '',
      layout: 'labelValueIcon',
    }),
  },
];
