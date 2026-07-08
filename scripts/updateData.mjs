// Fetches item + skill data from howbazaar.gg once, caches the raw responses,
// and writes a trimmed, bundle-ready dataset to src/data/bazaarData.json.
//
// Safe & smart: descriptive User-Agent, per-request timeout, limited retries
// with exponential backoff, and sequential (polite) requests.
// For now it always fetches fresh; caching/conditional requests come later.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SOURCES = [
  { kind: 'item', url: 'https://www.howbazaar.gg/api/items', cdnDir: 'items' },
  { kind: 'skill', url: 'https://www.howbazaar.gg/api/skills', cdnDir: 'skills' },
];

const CDN_BASE = 'https://howbazaar-images.b-cdn.net/images';
const USER_AGENT = 'bazaarsearch-datagen (+https://github.com/jfox16/bazaarsearch)';
const TIMEOUT_MS = 20_000;
const MAX_RETRIES = 3;
const BUNDLE_WARN_BYTES = 2 * 1024 * 1024;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const bytesOf = (obj) => Buffer.byteLength(JSON.stringify(obj));
const fmt = (n) => (n / 1024).toFixed(1) + ' KB';

async function fetchJson(url) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      const wait = 500 * 2 ** (attempt - 1);
      const more = attempt < MAX_RETRIES ? ` - retrying in ${wait}ms` : '';
      console.warn(`  attempt ${attempt}/${MAX_RETRIES} failed for ${url}: ${err.message}${more}`);
      if (attempt < MAX_RETRIES) await sleep(wait);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`Failed to fetch ${url} after ${MAX_RETRIES} attempts: ${lastErr?.message}`);
}

function toEntry(raw, kind, cdnDir) {
  const tiers = Object.fromEntries(
    Object.entries(raw.tiers ?? {}).map(([tier, val]) => [tier, val?.tooltips ?? []]),
  );
  // Enchantments are intentionally NOT attached here; they are large and
  // detail-only, so they live in a separate lazy-loaded file (see main()).
  return {
    id: raw.id,
    name: raw.name,
    kind,
    size: raw.size ?? null,
    startingTier: raw.startingTier ?? null,
    heroes: raw.heroes ?? [],
    tags: raw.tags ?? [],
    hiddenTags: raw.hiddenTags ?? [],
    customTags: raw.customTags ?? [],
    tiers,
    unifiedTooltips: raw.unifiedTooltips ?? [],
    imageUrl: `${CDN_BASE}/${cdnDir}/${raw.id}.avif`,
  };
}

function uniqSorted(values, order) {
  const set = new Set(values.filter(Boolean));
  if (order) {
    const known = order.filter((v) => set.has(v));
    const rest = [...set].filter((v) => !order.includes(v)).sort();
    return [...known, ...rest];
  }
  return [...set].sort();
}

async function main() {
  const rawByKind = {};
  const entries = [];
  const enchantmentsById = {}; // item id -> [{ type, tooltips }]

  for (const { kind, url, cdnDir } of SOURCES) {
    console.log(`Fetching ${kind}s from ${url} ...`);
    const raw = await fetchJson(url);
    const list = Array.isArray(raw?.data) ? raw.data : [];
    rawByKind[kind] = raw;
    console.log(`  got ${list.length} ${kind}s (version ${raw?.version ?? 'n/a'}, ${fmt(bytesOf(raw))})`);
    for (const r of list) {
      entries.push(toEntry(r, kind, cdnDir));
      if (kind === 'item' && Array.isArray(r.enchantments) && r.enchantments.length) {
        enchantmentsById[r.id] = r.enchantments;
      }
    }
    await sleep(300); // be polite between endpoints
  }

  const items = entries.filter((e) => e.kind === 'item');
  const skills = entries.filter((e) => e.kind === 'skill');

  const facets = {
    heroes: uniqSorted(entries.flatMap((e) => e.heroes)),
    sizes: uniqSorted(entries.map((e) => e.size), ['Small', 'Medium', 'Large']),
    tiers: uniqSorted(
      entries.map((e) => e.startingTier),
      ['Bronze', 'Silver', 'Gold', 'Diamond', 'Legendary'],
    ),
    // Combined visible + hidden + custom tags (matches howbazaar's advanced filter).
    tags: uniqSorted(entries.flatMap((e) => [...e.tags, ...e.hiddenTags, ...e.customTags])),
    enchantments: uniqSorted(
      Object.values(enchantmentsById)
        .flat()
        .map((x) => x.type),
    ),
  };

  const dataset = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: 'https://www.howbazaar.gg',
      versions: {
        items: rawByKind.item?.version ?? null,
        skills: rawByKind.skill?.version ?? null,
      },
      itemCount: items.length,
      skillCount: skills.length,
    },
    facets,
    entries,
  };

  // Raw cache: pretty-printed for easy diffing. Not bundled into the app.
  const rawDir = resolve(ROOT, 'data/raw');
  await mkdir(rawDir, { recursive: true });
  await writeFile(resolve(rawDir, 'items.json'), JSON.stringify(rawByKind.item, null, 2));
  await writeFile(resolve(rawDir, 'skills.json'), JSON.stringify(rawByKind.skill, null, 2));

  // Bundled datasets: minified. bazaarData.json is imported on load;
  // enchantments.json is imported lazily (detail view only).
  const outDir = resolve(ROOT, 'src/data');
  await mkdir(outDir, { recursive: true });

  const minified = JSON.stringify(dataset);
  await writeFile(resolve(outDir, 'bazaarData.json'), minified);

  const enchantmentsData = {
    meta: { generatedAt: dataset.meta.generatedAt, count: Object.keys(enchantmentsById).length },
    byId: enchantmentsById,
  };
  const enchantmentsMin = JSON.stringify(enchantmentsData);
  await writeFile(resolve(outDir, 'enchantments.json'), enchantmentsMin);

  const size = Buffer.byteLength(minified);
  const enchantSize = Buffer.byteLength(enchantmentsMin);
  const sizeNote = size <= BUNDLE_WARN_BYTES ? '(OK, will bundle)' : '(WARNING: > 2 MB - consider runtime fetch)';
  console.log('\nWrote src/data/bazaarData.json + src/data/enchantments.json');
  console.log(`  entries: ${entries.length} (items ${items.length}, skills ${skills.length})`);
  console.log(
    `  facets: ${facets.heroes.length} heroes, ${facets.sizes.length} sizes, ` +
      `${facets.tiers.length} tiers, ${facets.tags.length} tags, ${facets.enchantments.length} enchantments`,
  );
  console.log(`  main bundle:  ${fmt(size)} ${sizeNote}`);
  console.log(`  enchantments: ${fmt(enchantSize)} (lazy, ${enchantmentsData.meta.count} items)`);
}

main().catch((err) => {
  console.error('\nData update failed:', err.message);
  process.exit(1);
});
