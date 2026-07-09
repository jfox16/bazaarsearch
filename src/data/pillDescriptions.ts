import { formatTagLabel } from 'functions/getEntryDisplayTags';

/** Brief mechanic and category descriptions for detail-view pills. */
const TAG_DESCRIPTIONS: Record<string, string> = {
  Ammo: 'Uses ammo charges; stops charging at 0 and refills after each fight.',
  Aquatic: 'Aquatic-themed item, often synergizes with other Aquatic cards.',
  Apparel: 'Wearable board item, often with passive or triggered effects.',
  Burn: 'Deals damage twice per tick; the stack decreases by 1 each time.',
  Charge: 'Immediately advances an item’s cooldown.',
  Core: 'Core item — often central to a build or hero kit.',
  Crit: 'Chance to double Damage, Heal, Shield, Regen, Burn, and Poison effects.',
  Damage: 'Deals direct damage to the opponent.',
  Dinosaur: 'Dinosaur-themed item.',
  Dragon: 'Dragon-themed item.',
  Drone: 'Drone item; often charges or buffs adjacent Drones.',
  Experience: 'Grants or interacts with experience.',
  Flying: 'While Flying, Slow and Freeze durations on the item are halved.',
  Food: 'Food item, often sold or consumed for effects.',
  Freeze: 'Frozen items do not charge and cannot activate.',
  Friend: "it's your buddy!",
  Gold: 'Interacts with gold or economy.',
  Haste: 'Hasted items charge twice as fast.',
  Heal: 'Restores Health up to max. Cleanses 10% of Burn and Poison.',
  Health: 'Interacts with max or current Health.',
  Income: 'Grants or scales with income.',
  Joy: 'Joy-themed item (Stelle).',
  Level: 'Interacts with item or skill level.',
  Loot: 'Loot item, often from encounters or rewards.',
  Poison: 'Deals damage every tick equal to your Poison stack. Bypasses Shield.',
  Potion: 'Consumable with limited uses (ammo).',
  Property: 'Large property item with strong passive effects.',
  Quest: 'Complete in-run objectives to unlock extra effects.',
  Ray: 'Ray item; often synergizes with other Rays.',
  Reagent: 'Reagent item, often used in crafting or transforms.',
  Regen: 'Restores Health every tick equal to your Regen.',
  Relic: 'Relic item with powerful or build-defining effects.',
  Shield: 'Blocks damage. Poison ignores Shield; Burn is reduced by 50%.',
  Slow: 'Slowed items charge half as fast.',
  Tech: 'Tech-themed item.',
  Ticket: 'Ticket item, often for events or shops.',
  Tool: 'Utility board item with support or economy effects.',
  Toy: 'Board item, often with trick or scaling effects.',
  Vehicle: 'Vehicle item.',
  Weapon: 'Combat item that deals damage or applies effects on use.',
  AbsorbDestroy: 'Absorbs Destroy effects.',
  AbsorbFreeze: 'Absorbs Freeze effects.',
  AbsorbSlow: 'Absorbs Slow effects.',
  Cooldown: 'Has a cooldown between uses.',
  Economy: 'Economy-related effect.',
};

const KIND_DESCRIPTIONS: Record<string, string> = {
  item: 'Equip on your board during a run.',
  skill: 'Passive ability that applies for the whole run.',
};

const SIZE_DESCRIPTIONS: Record<string, string> = {
  Small: 'Takes 1 board slot.',
  Medium: 'Takes 2 board slots.',
  Large: 'Takes 3 board slots.',
};

const TIER_DESCRIPTIONS: Record<string, string> = {
  Bronze: 'Bronze starting tier — upgrades improve effects and sell value.',
  Silver: 'Silver starting tier — upgrades improve effects and sell value.',
  Gold: 'Gold starting tier — upgrades improve effects and sell value.',
  Diamond: 'Diamond starting tier — upgrades improve effects and sell value.',
  Legendary:
    'Only obtainable from expeditions, boss drops, and events. Not in normal pool.',
};

const HERO_DESCRIPTIONS: Record<string, string> = {
  Common: 'Available to all heroes.',
};

export type PillKind = 'hero' | 'kind' | 'size' | 'tier' | 'type' | 'tag';

export interface PillInfo {
  description: string | null;
  filterLabel: string;
}

const normalizeTagKey = (tag: string): string =>
  tag.endsWith('Reference') ? tag.slice(0, -'Reference'.length) : tag;

export const getTagDescription = (tag: string): string | null => {
  const key = normalizeTagKey(tag);
  return TAG_DESCRIPTIONS[key] ?? null;
};

export const getPillInfo = (
  pillKind: PillKind,
  value: string,
  displayLabel?: string,
): PillInfo => {
  const label = displayLabel ?? value;

  switch (pillKind) {
    case 'hero':
      return {
        description:
          HERO_DESCRIPTIONS[value] ?? `Cards in the ${label} hero pool.`,
        filterLabel: `Filter for ${label}`,
      };
    case 'kind':
      return {
        description: KIND_DESCRIPTIONS[value] ?? null,
        filterLabel: value === 'item' ? 'Show items only' : 'Show skills only',
      };
    case 'size':
      return {
        description: SIZE_DESCRIPTIONS[value] ?? null,
        filterLabel: `Filter for ${label} items`,
      };
    case 'tier':
      return {
        description: TIER_DESCRIPTIONS[value] ?? null,
        filterLabel: `Filter for ${label} cards`,
      };
    case 'type':
      return {
        description: getTagDescription(value),
        filterLabel: `Filter for ${label}`,
      };
    case 'tag': {
      const tagLabel = formatTagLabel(value);
      return {
        description: getTagDescription(value),
        filterLabel: `Filter for ${tagLabel}`,
      };
    }
  }
};
