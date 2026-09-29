'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Package, QrCode, Printer, FileSpreadsheet, Settings, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname.startsWith('/b/')) {
    // Hide navbar on public QR view
    return null;
  }

  const user = session?.user as any;

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/items', label: 'Barang Inventaris', icon: Package },
    { href: '/scan', label: 'Scan QR / Barcode', icon: QrCode },
    { href: '/labels', label: 'Cetak Label PDF', icon: Printer },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push(
      { href: '/import', label: 'Impor Excel', icon: FileSpreadsheet },
      { href: '/master', label: 'Master Data', icon: Settings }
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-brand-900 text-white shadow-md border-b border-brand-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-white text-brand-900 flex items-center justify-center font-bold text-xl shadow-inner group-hover:scale-105 transition-transform">
              YTA
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-none">Inventaris YTA</span>
              <span className="text-[10px] text-brand-200 tracking-wider uppercase font-semibold">PT YAPI Talent Academy</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                    isActive
                      ? 'bg-brand-800 text-white shadow-sm'
                      : 'text-brand-100 hover:bg-brand-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="hidden md:flex items-center space-x-3">
            {session ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{session.user?.name}</div>
                  <div className="text-[11px] text-brand-200 font-mono uppercase bg-brand-800 px-1.5 py-0.5 rounded inline-block">
                    {user?.role}
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="p-2 rounded-lg text-brand-200 hover:text-white hover:bg-brand-800 transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-white text-brand-900 hover:bg-brand-100 px-4 py-2 rounded-lg text-sm font-semibold shadow transition-all"
              >
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-100 hover:text-white hover:bg-brand-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-950 border-b border-brand-800 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive ? 'bg-brand-800 text-white' : 'text-brand-200 hover:bg-brand-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          {session ? (
            <div className="pt-3 border-t border-brand-800 flex items-center justify-between px-3">
              <div>
                <p className="text-sm font-semibold text-white">{session.user?.name}</p>
                <p className="text-xs text-brand-300 uppercase font-mono">{user?.role}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center space-x-1 text-rose-300 text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-white text-brand-900 font-bold py-2.5 rounded-lg mt-2"
            >
              Masuk
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
