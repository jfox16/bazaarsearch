import type { BazaarDataset, EnchantmentsData } from 'types/bazaar';

// Dynamic imports so Vite code-splits the data into separate chunks that load
// on demand rather than bloating the initial JS bundle. Each lazy load is timed
// and logged so the fetch of these chunks is easy to observe.

export const loadDataset = async (): Promise<BazaarDataset> => {
  const start = performance.now();
  console.info('[bazaar] dataset: loading lazy chunk...');
  const mod = await import('./bazaarData.json');
  const data = (mod.default ?? mod) as unknown as BazaarDataset;
  const ms = Math.round(performance.now() - start);
  console.info(`[bazaar] dataset: ${data.entries.length} entries in ${ms} ms`);
  return data;
};

let enchantmentsPromise: Promise<EnchantmentsData> | null = null;

/** Loaded only when an item's detail view needs enchantments. Cached after first call. */
export const loadEnchantments = (): Promise<EnchantmentsData> => {
  if (!enchantmentsPromise) {
    const start = performance.now();
    console.info('[bazaar] enchantments: loading lazy chunk...');
    enchantmentsPromise = import('./enchantments.json').then((mod) => {
      const data = (mod.default ?? mod) as unknown as EnchantmentsData;
      const ms = Math.round(performance.now() - start);
      console.info(`[bazaar] enchantments: ${data.meta.count} items in ${ms} ms`);
      return data;
    });
  }
  return enchantmentsPromise;
};
