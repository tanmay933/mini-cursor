import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mini Cursor IDE',
  description: 'Local AI coding IDE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col overflow-hidden">{children}</body>
    </html>
  );
}
