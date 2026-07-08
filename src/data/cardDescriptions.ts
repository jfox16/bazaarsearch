import type { CardDescriptions } from 'types/bazaar';

/**
 * Short, curated one-liners for cards that have no numeric combat stats
 * (damage / burn / poison / shield / heal / regen) to surface in the tile list
 * view, so those tiles aren't left blank below the name.
 *
 * Keyed by the card's exact `name` (names are unique in the dataset). This list
 * does NOT need to be complete: cards without an entry simply show nothing.
 * Descriptions are filled in over time (e.g. AI-generated in batches).
 */
export const CARD_DESCRIPTIONS: CardDescriptions = {
  '28 Hour Fitness': 'Using a Weapon buffs your Shield items, and vice versa.',
  '3D Printer': 'Becomes 3 copies of the Small item on its left for the fight.',
  Abacus: "Adjacent items gain this item's value for the fight.",
  'Abducted Cow': 'Starts Flying; on destroy, charges items and leaves Jerky.',
  "Admiral's Badge": 'Vehicle/Flying use Slows enemies; your Flying resists Freeze/Slow.',
  'Agility Boots': 'Grants adjacent items +Crit Chance.',
  'Airplane Glue': 'Stops adjacent items Flying, buffing their Damage and Shield.',
  Alembic: 'Each day, makes a Catalyst and turns the item on its left into a Potion.',
  Amber: 'Slows an enemy item, and makes your Slows last longer.',
  Anchor: "Deals damage based on the enemy's Max Health.",

  // Loot — sold for a one-time effect. Lead with "Sell for ...".
  'Bag of Jewels': 'Sell for Gold.',
  Catalyst: 'Sell to transform an item.',
  Cinders: 'Sell for +Burn.',
  'Eagle Talisman': 'Sell for +Crit.',
  'Echo Crystal': 'Sell to transform and upgrade an item.',
  Extract: 'Sell for +Poison.',
  Feather: 'Sell for -Cooldown.',
  Gunpowder: 'Sell for +Max Ammo.',
  'Insect Wing': 'Sell for -Cooldown.',
  'Learning Crystal': 'Sell to learn a Skill.',
  'Med Kit': 'Sell for +Heal.',
  'Mysterious Crystal': 'Sell for a random type.',
  'Mysterious Gift': 'Sell for an enchanted item.',
  Pelt: 'Sell for Gold.',
  'Resonance Crystal': 'Sell to upgrade an item.',
  Scrap: 'Sell for +Shield.',
  'Sharpening Stone': 'Sell for +Damage.',
  Snowflake: 'Sell for +Freeze.',
  'Translation Crystal': 'Sell for -Cooldown.',
  'Vial of Blood': 'Sell for +XP.',
};
