import { isDefaultKinds } from 'functions/filterDefaults';
import type { BazaarFilter, Kind, Size, SortDirection, SortField, SortOptions, Tier } from 'types/bazaar';

const DEFAULT_SORT: SortOptions = { field: 'rarity', direction: 'asc' };

const KINDS = new Set<Kind>(['item', 'skill']);
const SIZES = new Set<Size>(['Small', 'Medium', 'Large']);
const TIERS = new Set<Tier>(['Bronze', 'Silver', 'Gold', 'Diamond', 'Legendary']);
const SORT_FIELDS = new Set<SortField>(['rarity', 'name', 'size', 'kind', 'hero']);
const SORT_DIRECTIONS = new Set<SortDirection>(['asc', 'desc']);

/** Chip + text filter fields restored from / written to the URL. */
export interface UrlFilterState {
  text: string;
  kinds: Kind[];
  heroes: string[];
  sizes: Size[];
  tiers: Tier[];
  types: string[];
  tags: string[];
  showNeutral: boolean;
}

const parseCsv = (value: string | null): string[] =>
  value
    ? value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    : [];

const parseKinds = (value: string | null): Kind[] =>
  parseCsv(value).filter((part): part is Kind => KINDS.has(part as Kind));

const parseSizes = (value: string | null): Size[] =>
  parseCsv(value).filter((part): part is Size => SIZES.has(part as Size));

const parseTiers = (value: string | null): Tier[] =>
  parseCsv(value).filter((part): part is Tier => TIERS.has(part as Tier));

export const parseUrlSearchParams = (
  search: string,
): { filter: UrlFilterState; sort: SortOptions } => {
  const params = new URLSearchParams(search);

  const kindValues = parseKinds(params.get('kind'));
  const sortField = params.get('sort');
  const sortDir = params.get('dir');

  return {
    filter: {
      text: params.get('q') ?? '',
      kinds: kindValues,
      heroes: parseCsv(params.get('hero')),
      sizes: parseSizes(params.get('size')),
      tiers: parseTiers(params.get('tier')),
      types: parseCsv(params.get('type')),
      tags: parseCsv(params.get('tag')),
      showNeutral: params.get('neutral') !== '0',
    },
    sort: {
      field: sortField && SORT_FIELDS.has(sortField as SortField) ? (sortField as SortField) : DEFAULT_SORT.field,
      direction:
        sortDir && SORT_DIRECTIONS.has(sortDir as SortDirection)
          ? (sortDir as SortDirection)
          : DEFAULT_SORT.direction,
    },
  };
};

const appendCsv = (params: URLSearchParams, key: string, values: Iterable<string>) => {
  const list = [...values];
  if (list.length > 0) params.set(key, list.join(','));
};

export const serializeFilterToSearch = (filter: BazaarFilter, sort: SortOptions): string => {
  const params = new URLSearchParams();

  const text = filter.text.trim();
  if (text) params.set('q', text);

  if (!isDefaultKinds(filter.kinds)) appendCsv(params, 'kind', filter.kinds);
  appendCsv(params, 'hero', filter.heroes);
  appendCsv(params, 'size', filter.sizes);
  appendCsv(params, 'tier', filter.tiers);
  appendCsv(params, 'type', filter.types);
  appendCsv(params, 'tag', filter.tags);

  if (!filter.showNeutral) params.set('neutral', '0');

  if (sort.field !== DEFAULT_SORT.field) params.set('sort', sort.field);
  if (sort.direction !== DEFAULT_SORT.direction) params.set('dir', sort.direction);

  return params.toString();
};

export const applyUrlFilterState = (base: BazaarFilter, fromUrl: UrlFilterState): BazaarFilter => ({
  ...base,
  text: fromUrl.text,
  kinds: fromUrl.kinds.length > 0 ? new Set(fromUrl.kinds) : base.kinds,
  heroes: new Set(fromUrl.heroes),
  sizes: new Set(fromUrl.sizes),
  tiers: new Set(fromUrl.tiers),
  types: new Set(fromUrl.types),
  tags: new Set(fromUrl.tags),
  showNeutral: fromUrl.showNeutral,
});
