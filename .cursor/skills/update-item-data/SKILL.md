---
name: update-item-data
description: >-
  Refresh bazaarsearch item and skill datasets from howbazaar.gg, validate output,
  and update manual supplements (sell prices, card blurbs). Use when updating game
  data, running update-data, refreshing bazaarData.json, or after a Bazaar patch.
---

# Update item data (bazaarsearch)

## Quick start

From repo root:

```bash
yarn update-data
node scripts/checkDataUpdate.mjs
yarn build
```

`yarn update-data` is the only command that fetches from the network.

## What the update does

`scripts/updateData.mjs` fetches:

| Source | URL |
|--------|-----|
| Items | `https://www.howbazaar.gg/api/items` |
| Skills | `https://www.howbazaar.gg/api/skills` |

It writes:

| Output | Purpose |
|--------|---------|
| `data/raw/items.json` | Pretty-printed API cache (diff-friendly, not bundled) |
| `data/raw/skills.json` | Pretty-printed API cache |
| `src/data/bazaarData.json` | Main search dataset (eager-loaded chunk) |
| `src/data/enchantments.json` | Lazy-loaded, keyed by item id |
| `src/data/quests.json` | Lazy-loaded, keyed by item id |

Each bundled entry is trimmed via `toEntry()` in `updateData.mjs`: id, name, kind, size, startingTier, heroes, tags, hiddenTags, customTags, tiers (tooltips only), unifiedTooltips, imageUrl.

**howbazaar does not expose numeric sell prices.** Tier objects only have `tooltips`.

## Manual files (not overwritten by update-data)

Review these after every data refresh:

| File | When to edit |
|------|----------------|
| `src/data/sellPriceOverrides.ts` | Item tooltip is `"Sells for Gold"` but generic formula is wrong. Lookup per-tier values on [BazaarDB](https://bazaardb.gg/) (Cost/Value). Key by howbazaar item **id**. |
| `src/data/cardDescriptions.ts` | Statless items need a short tile blurb. Key by exact **name**. |

`checkDataUpdate.mjs` fails if any `"Sells for Gold"` item is missing from `sellPriceOverrides.ts`.

### Sell price overrides

1. Find items after update:

```bash
node -e "
const d=require('./src/data/bazaarData.json');
const re=/sells for gold/i;
for (const e of d.entries.filter(x=>x.kind==='item'&&Object.values(x.tiers||{}).some(t=>t.some(tip=>re.test(tip)))))
  console.log(e.name, e.id);
"
```

2. Look up Bronze→Diamond sell values on BazaarDB.
3. Add entry to `SELL_PRICE_OVERRIDES` in `src/data/sellPriceOverrides.ts`.
4. Re-run `node scripts/checkDataUpdate.mjs`.

Generic formula lives in `src/functions/getSellPrice.ts`; overrides win when present.

## Workflow checklist

```
- [ ] yarn update-data
- [ ] node scripts/checkDataUpdate.mjs
- [ ] Fix any missing sellPriceOverrides (see above)
- [ ] Scan new/changed items for cardDescriptions gaps (optional)
- [ ] yarn build
- [ ] Spot-check: open detail for a changed item + Bag of Jewels sell prices
- [ ] Commit data/raw/* and src/data/*.json together with any manual file edits
```

## Changing the pipeline

Edit `scripts/updateData.mjs` when:

- howbazaar adds new fields worth bundling → extend `toEntry()` and `BazaarEntry` in `src/types/bazaar.ts`
- New lazy sidecar files → follow enchantments/quests pattern in `updateData.mjs` + `src/data/loadDataset.ts`

Do **not** fetch BazaarDB in the datagen script (Cloudflare blocks server-side requests; different card ids).

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Fetch timeout / HTTP error | Retry; howbazaar may be down. Script retries 3× with backoff. |
| Bundle > 2 MB warning | Logged only; consider runtime fetch if it grows further. |
| New tag/type missing in filters | Facets are rebuilt automatically from entries. |
| Wrong sell price in UI | Check override first, then `getSellPrice.ts` formula. |

## Related code

- Types: `src/types/bazaar.ts`
- Loaders: `src/data/loadDataset.ts`
- npm script: `"update-data"` in `package.json`
