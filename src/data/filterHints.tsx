import { HERO_ALIASES, SIZE_ALIASES } from 'functions/searchAliases';

const aliasesForHero = (hero: string) => {
  const aliases = Object.entries(HERO_ALIASES)
    .filter(([, canonical]) => canonical === hero)
    .map(([alias]) => alias);
  return aliases.length ? aliases.join(', ') : null;
};

const aliasesForSize = (size: string) => {
  const aliases = Object.entries(SIZE_ALIASES)
    .filter(([, canonical]) => canonical === size)
    .map(([alias]) => alias);
  return aliases.length ? aliases.join(', ') : null;
};

export const SEARCH_HINT = (
  <>
    <p>
      <strong>BazaarDB-style search</strong> — use <code>filter:value</code> tokens (see{' '}
      <a href="https://bazaardb.gg/docs" target="_blank" rel="noreferrer">
        bazaardb.gg/docs
      </a>
      ).
    </p>
    <ul>
      <li>
        <code>n:hammer</code> — name contains
      </li>
      <li>
        <code>t:burn</code> — tag, hero, or type (<code>t:item</code>, <code>t:vanessa</code>)
      </li>
      <li>
        <code>s:m</code> — size (s / m / l)
      </li>
      <li>
        <code>r:g</code> — tier (b / s / g / d / l; <code>r&lt;=s</code> for silver or lower)
      </li>
      <li>
        <code>o:regen</code> — tooltip text
      </li>
    </ul>
    <p>
      Combine filters with spaces (AND). Use <code>|</code> for OR and <code>&amp;</code> for AND within
      a value — e.g. <code>t:burn|poison</code>, <code>t:burn&amp;weapon</code>.
    </p>
    <p>
      Plain words are auto-detected as heroes, tags, sizes, and tiers — e.g.{' '}
      <code>jules weapon</code>, <code>pyg large</code>. Use <code>filter:value</code> prefixes when
      you need a specific field (<code>n:</code> name, <code>o:</code> tooltip, etc.).
    </p>
  </>
);

export const KIND_HINT = (
  <p>
    Switch between items and skills. In search, use <code>t:item</code> or <code>t:skill</code>.
  </p>
);

export const HERO_HINT = (
  <p>
    Show cards for specific heroes. In search, use <code>t:vanessa</code>, <code>t:pyg</code>, etc.
  </p>
);

export const SIZE_HINT = (
  <p>
    Items only — skills have no size. In search, use <code>s:s</code>, <code>s:m</code>, or{' '}
    <code>s:l</code>.
  </p>
);

export const TIER_HINT = (
  <p>
    Filter by starting tier. In search, use <code>r:g</code>, <code>r:gold</code>, or{' '}
    <code>r&lt;=s</code> for silver and below.
  </p>
);

export const ITEM_TYPE_HINT = (
  <p>
    Filter by item category — Weapon, Toy, Tool, etc. In search, use <code>t:weapon</code>,{' '}
    <code>t:toy</code>, or plain words like <code>weapon</code>.
  </p>
);

export const TAG_HINT = (
  <p>
    Filter by mechanics and categories — Burn, Shield, Weapon, etc. In search, use{' '}
    <code>t:burn</code>, <code>t:shield</code>, etc.
  </p>
);

export const kindChipHint = (kind: 'item' | 'skill') =>
  kind === 'item' ? (
    <p>
      Show items only. Search with <code>t:item</code>.
    </p>
  ) : (
    <p>
      Show skills only. Search with <code>t:skill</code>.
    </p>
  );

export const heroChipHint = (hero: string) => {
  const aliases = aliasesForHero(hero);
  return aliases ? (
    <p>
      Show {hero} cards. Search with <code>t:{hero.toLowerCase()}</code> or{' '}
      <code>t:{aliases.split(', ')[0]}</code>.
    </p>
  ) : (
    <p>
      Show {hero} cards. Search with <code>t:{hero.toLowerCase()}</code>.
    </p>
  );
};

export const sizeChipHint = (size: string) => {
  const aliases = aliasesForSize(size);
  const short = size === 'Small' ? 's' : size === 'Medium' ? 'm' : 'l';
  return (
    <p>
      Show {size} items. Search with <code>s:{short}</code>
      {aliases ? (
        <>
          {' '}
          or <code>s:{aliases.split(', ')[0]}</code>
        </>
      ) : null}
      .
    </p>
  );
};

export const tierChipHint = (tier: string) => {
  const short =
    tier === 'Bronze'
      ? 'b'
      : tier === 'Silver'
        ? 's'
        : tier === 'Gold'
          ? 'g'
          : tier === 'Diamond'
            ? 'd'
            : 'l';
  return (
    <p>
      Show cards with {tier} starting tier. Search with <code>r:{short}</code> or{' '}
      <code>r:{tier.toLowerCase()}</code>.
    </p>
  );
};

export const typeChipHint = (type: string) => (
  <p>
    Filter by the <strong>{type}</strong> type. Search with <code>t:{type.toLowerCase()}</code>.
  </p>
);

export const tagChipHint = (tag: string) => (
  <p>
    Filter by the <strong>{tag}</strong> tag. Search with <code>t:{tag.toLowerCase()}</code>.
  </p>
);
