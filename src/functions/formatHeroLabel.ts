/** Hero pool shared by all heroes (dataset value `Common`). */
export const NEUTRAL_HERO_POOL = 'Common';

/** Display label for a hero pool value from the dataset. */
export const formatHeroLabel = (hero: string): string =>
  hero === NEUTRAL_HERO_POOL ? 'All' : hero;

export const isNeutralHeroPool = (heroes: string[]): boolean =>
  heroes.length === 1 && heroes[0] === NEUTRAL_HERO_POOL;

/** Hero pills for card detail: one "Neutral" pool or each specific hero name. */
export const getEntryHeroPills = (
  heroes: string[],
): { key: string; label: string; hero: string }[] => {
  if (heroes.length === 0) return [];
  if (isNeutralHeroPool(heroes)) {
    return [{ key: 'Common', label: 'Neutral', hero: NEUTRAL_HERO_POOL }];
  }
  return heroes.map((hero) => ({ key: hero, label: hero, hero }));
};
