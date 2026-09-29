import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Sidebar } from '@/components/Sidebar';
import { HeaderTopBar } from '@/components/HeaderTopBar';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Inventaris Barang PT YAPI Talent Academy',
  description: 'Aplikasi Inventaris Barang & Cetak Label QR Code PT YAPI Talent Academy (YTA)',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#174355',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full flex bg-[#dcebf4] dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        <Providers>
          <div className="flex w-full min-h-screen">
            {/* Desktop Left Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 pb-mobile-nav md:pb-0">
              <HeaderTopBar />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
            </div>
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
