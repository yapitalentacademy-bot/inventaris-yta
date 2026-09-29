'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Package,
  QrCode,
  Printer,
  FileSpreadsheet,
  Settings,
  LogOut,
  User,
  Users,
  ShieldCheck,
  ShoppingBag,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname.startsWith('/b/')) {
    return null;
  }

  const user = session?.user as any;
  const userName = session?.user?.name || 'User Inventaris';
  const userEmail = session?.user?.email || 'user@yta.ac.id';
  const userRole = user?.role || 'PETUGAS';

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/items', label: 'Inventory', icon: Package },
    { href: '/scan', label: 'Scan QR / Barcode', icon: QrCode },
    { href: '/labels', label: 'Label PDF', icon: Printer },
  ];

  if (userRole === 'ADMIN') {
    navLinks.push(
      { href: '/import', label: 'Import Excel', icon: FileSpreadsheet },
      { href: '/master', label: 'Settings', icon: Settings }
    );
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#174355] text-white min-h-screen shrink-0 shadow-2xl relative select-none">
      {/* Profile Section at top */}
      <div className="p-6 text-center space-y-3 border-b border-[#25566a]">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-[#25566a] p-1 border-2 border-emerald-400 mx-auto overflow-hidden shadow-lg">
            <img
              src={
                user?.image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=22c55e&color=fff&bold=true`
              }
              alt={userName}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        <div>
          <h2 className="font-bold text-base text-white tracking-wide">{userName}</h2>
          <p className="text-xs text-slate-300 font-mono mt-0.5 truncate max-w-[200px] mx-auto">{userEmail}</p>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {userRole}
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative group flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-[#dcebf4] text-[#174355] shadow-lg font-bold translate-x-1'
                  : 'text-slate-200 hover:bg-[#205267] hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#174355]' : 'text-slate-300 group-hover:text-white'}`} />
              <span className="tracking-wide">{link.label}</span>

              {/* Active right tab indicator highlight */}
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-emerald-400 rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Logout Action */}
      <div className="p-4 border-t border-[#25566a]">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center space-x-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-rose-200 hover:text-white hover:bg-rose-600/30 border border-rose-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
