#!/usr/bin/env node
// Post-update sanity checks for bazaarsearch datasets.
// Run after: yarn update-data

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const readJson = (rel) => JSON.parse(readFileSync(resolve(ROOT, rel), 'utf8'));

const SELL_FOR_GOLD = /sells for gold/i;

let failed = false;
const fail = (msg) => {
  console.error(`FAIL: ${msg}`);
  failed = true;
};
const ok = (msg) => console.log(`OK: ${msg}`);

try {
  const dataset = readJson('src/data/bazaarData.json');
  const enchantments = readJson('src/data/enchantments.json');
  const quests = readJson('src/data/quests.json');

  if (!Array.isArray(dataset.entries) || dataset.entries.length === 0) {
    fail('bazaarData.json has no entries');
  } else {
    ok(`bazaarData: ${dataset.entries.length} entries (items ${dataset.meta.itemCount}, skills ${dataset.meta.skillCount})`);
    ok(`versions: items ${dataset.meta.versions.items}, skills ${dataset.meta.versions.skills}`);
    ok(`generatedAt: ${dataset.meta.generatedAt}`);
  }

  ok(`enchantments: ${enchantments.meta.count} items`);
  ok(`quests: ${quests.meta.count} items`);

  const goldSellItems = dataset.entries.filter(
    (e) =>
      e.kind === 'item' &&
      Object.values(e.tiers ?? {}).some((tips) => tips.some((t) => SELL_FOR_GOLD.test(t))),
  );

  const overrideSrc = readFileSync(resolve(ROOT, 'src/data/sellPriceOverrides.ts'), 'utf8');
  const missingOverrides = goldSellItems.filter((e) => !overrideSrc.includes(e.id));

  if (missingOverrides.length) {
    fail(
      `${missingOverrides.length} "Sells for Gold" item(s) missing from sellPriceOverrides.ts: ${missingOverrides.map((e) => e.name).join(', ')}`,
    );
  } else if (goldSellItems.length) {
    ok(`sellPriceOverrides covers all ${goldSellItems.length} "Sells for Gold" items`);
  }

  const dupNames = dataset.entries
    .map((e) => e.name)
    .filter((name, i, arr) => arr.indexOf(name) !== i);
  if (dupNames.length) fail(`duplicate entry names: ${[...new Set(dupNames)].join(', ')}`);
  else ok('entry names are unique');
} catch (err) {
  fail(err.message);
}

if (failed) process.exit(1);
console.log('\nData check passed.');
