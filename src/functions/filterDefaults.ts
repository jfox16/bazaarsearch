import type { Kind } from 'types/bazaar';

export const DEFAULT_KIND: Kind = 'item';

export const isDefaultKinds = (kinds: Set<Kind>) =>
  kinds.size === 1 && kinds.has(DEFAULT_KIND);
