#!/usr/bin/env node
// Adds empty sell-price override stubs for new "Sells for Gold" items so
// automated updates can commit without manual BazaarDB lookups first.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OVERRIDES_PATH = resolve(ROOT, 'src/data/sellPriceOverrides.ts');
const SELL_FOR_GOLD = /sells for gold/i;

const dataset = JSON.parse(readFileSync(resolve(ROOT, 'src/data/bazaarData.json'), 'utf8'));
let src = readFileSync(OVERRIDES_PATH, 'utf8');

const goldItems = dataset.entries.filter(
  (e) =>
    e.kind === 'item' &&
    Object.values(e.tiers ?? {}).some((tips) => tips.some((t) => SELL_FOR_GOLD.test(t))),
);

const missing = goldItems.filter((e) => !src.includes(e.id));

if (missing.length === 0) {
  console.log('No missing sell price overrides.');
  process.exit(0);
}

const stubs = missing
  .map((e) => `  // ${e.name} (auto-added — fill from BazaarDB)\n  '${e.id}': {},`)
  .join('\n');

const closeIdx = src.lastIndexOf('};');
if (closeIdx === -1) throw new Error('Could not find SELL_PRICE_OVERRIDES closing brace');

src = `${src.slice(0, closeIdx)}${stubs}\n${src.slice(closeIdx)}`;
writeFileSync(OVERRIDES_PATH, src);

console.log(`Added ${missing.length} empty override stub(s): ${missing.map((e) => e.name).join(', ')}`);
