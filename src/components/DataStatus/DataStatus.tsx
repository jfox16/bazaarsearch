import { useBazaarStore } from 'store/useBazaarStore';

import './DataStatus.scss';

/** Succinct indicator of the lazy data-chunk load (mirrors the console logs). */
export const DataStatus = () => {
  const status = useBazaarStore((s) => s.status);
  const dataLoadMs = useBazaarStore((s) => s.dataLoadMs);
  const count = useBazaarStore((s) => s.entries.length);

  let text: string;
  let tone: 'loading' | 'ready' | 'error';

  if (status === 'error') {
    text = 'Data failed to load';
    tone = 'error';
  } else if (status === 'ready') {
    text = `${count.toLocaleString()} entries loaded in ${dataLoadMs ?? '?'} ms`;
    tone = 'ready';
  } else {
    text = 'Loading data...';
    tone = 'loading';
  }

  return (
    <div className="DataStatus" data-tone={tone}>
      <span className="DataStatus-dot" aria-hidden />
      {text}
    </div>
  );
};
