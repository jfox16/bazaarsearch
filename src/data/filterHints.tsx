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
      <code>jules weapon</code>, <code>pyg large</code>. Wrap text in quotes to search
      literally without alias detection — e.g. <code>jules &quot;burn&quot;</code>. Use{' '}
      <code>filter:value</code> prefixes when you need a specific field (<code>n:</code> name,{' '}
      <code>o:</code> tooltip, etc.).
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
    Show cards for specific heroes. Neutral (All) items are included by default when filtering a
    hero — toggle &quot;Show Neutral&quot; to hide them. In search, use <code>t:vanessa</code>,{' '}
    <code>t:pyg</code>, etc.
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
