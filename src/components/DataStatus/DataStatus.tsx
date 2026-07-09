import { useBazaarStore } from 'store/useBazaarStore';

import './DataStatus.scss';

const formatUpdated = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const sourceLabel = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'howbazaar.gg';
  }
};

/** Mellow footer on the filter panel — source, freshness, load time, attribution. */
export const DataStatus = () => {
  const status = useBazaarStore((s) => s.status);
  const meta = useBazaarStore((s) => s.meta);
  const dataLoadMs = useBazaarStore((s) => s.dataLoadMs);

  if (status === 'loading' || status === 'idle') {
    return (
      <footer className="DataStatus" data-tone="loading">
        Loading data…
      </footer>
    );
  }

  if (status === 'error') {
    return (
      <footer className="DataStatus" data-tone="error">
        Data failed to load
      </footer>
    );
  }

  const sourceHref = meta?.source ?? 'https://www.howbazaar.gg';
  const updated = meta?.generatedAt ? formatUpdated(meta.generatedAt) : null;

  return (
    <footer className="DataStatus" data-tone="ready">
      <p>
        Data from{' '}
        <a href={sourceHref} target="_blank" rel="noopener noreferrer">
          {sourceLabel(sourceHref)}
        </a>
        {' · '}
        non-commercial use
      </p>
      {(updated || dataLoadMs !== null) && (
        <p>
          {updated && <>Updated {updated}</>}
          {updated && dataLoadMs !== null && ' · '}
          {dataLoadMs !== null && <>loaded in {dataLoadMs} ms</>}
        </p>
      )}
      <p>
        Made by{' '}
        <a href="https://github.com/jfox16" target="_blank" rel="noopener noreferrer">
          Jonathan Fox
        </a>
      </p>
    </footer>
  );
};
