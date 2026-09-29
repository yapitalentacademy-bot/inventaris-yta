'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, QrCode, Printer, PlusCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname.startsWith('/b/') || pathname === '/login') {
    return null;
  }

  const navItems = [
    { href: '/', label: 'Beranda', icon: LayoutDashboard },
    { href: '/items', label: 'Inventaris', icon: Package },
    { href: '/scan', label: 'SCAN', icon: QrCode, isCenter: true },
    { href: '/labels', label: 'Label PDF', icon: Printer },
    { href: '/items/new', label: 'Tambah', icon: PlusCircle },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          if (item.isCenter) {
            return (
              <div key={item.href} className="flex justify-center -mt-6">
                <Link
                  href={item.href}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-800 to-brand-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-slate-900"
                >
                  <Icon className="w-7 h-7" />
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 py-1 transition-colors ${
                isActive ? 'text-brand-700 dark:text-brand-400 font-semibold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
