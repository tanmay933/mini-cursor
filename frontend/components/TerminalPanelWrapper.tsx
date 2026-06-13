'use client';

import dynamic from 'next/dynamic';

const TerminalPanel = dynamic(
  () => import('./TerminalPanel'),
  {
    ssr: false,
  }
);

export default TerminalPanel;