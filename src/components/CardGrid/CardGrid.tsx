import { useEffect, useRef, useState } from 'react';

import { CardTile } from 'components/CardTile/CardTile';
import { useBazaarStore, useFilteredEntries } from 'store/useBazaarStore';

import './CardGrid.scss';

const PAGE_SIZE = 120;

export const CardGrid = () => {
  const status = useBazaarStore((s) => s.status);
  const select = useBazaarStore((s) => s.select);
  const entries = useFilteredEntries();

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset paging whenever the filtered results change.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [entries]);

  // Grow the visible window as the sentinel scrolls into view.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (observed) => {
        if (observed[0]?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, entries.length));
        }
      },
      { rootMargin: '600px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [entries.length]);

  if (status === 'loading' || status === 'idle') {
    return <div className="CardGrid-message">Loading the Bazaar...</div>;
  }

  if (status === 'error') {
    return <div className="CardGrid-message">Failed to load data. Try refreshing.</div>;
  }

  if (entries.length === 0) {
    return <div className="CardGrid-message">No items or skills match your filters.</div>;
  }

  const visible = entries.slice(0, visibleCount);

  return (
    <>
      <div className="CardGrid">
        {visible.map((entry) => (
          <CardTile key={entry.id} entry={entry} onClick={(e) => select(e.id)} />
        ))}
      </div>
      {visibleCount < entries.length && <div ref={sentinelRef} className="CardGrid-sentinel" />}
    </>
  );
};
