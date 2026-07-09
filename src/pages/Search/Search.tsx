import { useEffect } from 'react';

import { CardDetail } from 'components/CardDetail/CardDetail';
import { CardGrid } from 'components/CardGrid/CardGrid';
import { Header } from 'components/Header/Header';
import { MobileFilterDrawer } from 'components/MobileFilterDrawer/MobileFilterDrawer';
import { Modal } from 'components/Modal/Modal';
import { Sidebar } from 'components/Sidebar/Sidebar';
import { useFilterUrlSync } from 'hooks/useFilterUrlSync';
import { useIsMobile } from 'hooks/useIsMobile';
import { useBazaarStore, useSelectedEntry } from 'store/useBazaarStore';

import './Search.scss';

export const Search = () => {
  const isMobile = useIsMobile();
  const load = useBazaarStore((s) => s.load);
  const select = useBazaarStore((s) => s.select);
  const selected = useSelectedEntry();

  useFilterUrlSync();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="Search">
      <Header />
      {!isMobile && <Sidebar />}

      <main className="Search-content">
        <CardGrid />
      </main>

      {isMobile && <MobileFilterDrawer />}

      <Modal isOpen={!!selected} onClose={() => select(null)} bare>
        {selected && <CardDetail entry={selected} onClose={() => select(null)} />}
      </Modal>
    </div>
  );
};
