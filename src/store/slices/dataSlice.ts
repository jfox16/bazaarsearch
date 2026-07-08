import type { StateCreator } from 'zustand';

import { loadDataset } from 'data/loadDataset';
import type { BazaarEntry, DatasetMeta, Facets } from 'types/bazaar';

import type { BazaarState } from '../types';

const EMPTY_FACETS: Facets = {
  heroes: [],
  sizes: [],
  tiers: [],
  types: [],
  tags: [],
  enchantments: [],
};

/** Dataset loading + the loaded data itself. */
export interface DataSlice {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  entries: BazaarEntry[];
  facets: Facets;
  meta: DatasetMeta | null;
  /** Wall-clock time (ms) it took to lazy-load the dataset chunk. */
  dataLoadMs: number | null;
  load: () => Promise<void>;
}

export const createDataSlice: StateCreator<BazaarState, [], [], DataSlice> = (set, get) => ({
  status: 'idle',
  error: null,
  entries: [],
  facets: EMPTY_FACETS,
  meta: null,
  dataLoadMs: null,

  load: async () => {
    if (get().status === 'loading' || get().status === 'ready') return;
    set({ status: 'loading', error: null });
    try {
      const start = performance.now();
      const data = await loadDataset();
      set({
        status: 'ready',
        entries: data.entries,
        facets: {
          ...data.facets,
          types:
            data.facets.types ??
            [...new Set(data.entries.flatMap((e) => e.tags))].sort((a, b) => a.localeCompare(b)),
        },
        meta: data.meta,
        dataLoadMs: Math.round(performance.now() - start),
      });
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : 'Failed to load data' });
    }
  },
});
