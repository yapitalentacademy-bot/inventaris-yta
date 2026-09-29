import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Package, CheckCircle2, AlertTriangle, XCircle, Clock, QrCode, Plus, ArrowRight, Building, Tags, ShieldAlert } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  // Fetch Dashboard Statistics
  const [
    totalItems,
    baikCount,
    rusakRinganCount,
    rusakBeratCount,
    dipinjamCount,
    categories,
    locations,
    warrantyExpiringItems,
  ] = await Promise.all([
    prisma.item.count({ where: { isDeleted: false } }),
    prisma.item.count({ where: { isDeleted: false, condition: 'BAIK' } }),
    prisma.item.count({ where: { isDeleted: false, condition: 'RUSAK_RINGAN' } }),
    prisma.item.count({ where: { isDeleted: false, condition: 'RUSAK_BERAT' } }),
    prisma.item.count({ where: { isDeleted: false, status: 'DIPINJAM' } }),
    prisma.category.findMany({
      include: { _count: { select: { items: { where: { isDeleted: false } } } } },
    }),
    prisma.location.findMany({
      include: { _count: { select: { items: { where: { isDeleted: false } } } } },
    }),
    prisma.item.findMany({
      where: {
        isDeleted: false,
        warrantyExpiry: {
          gte: new Date(),
          lte: thirtyDaysFromNow,
        },
      },
      include: { category: true, location: true },
      take: 5,
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-block bg-brand-800/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono tracking-wider border border-brand-700">
            Sistem Inventaris PT YAPI Talent Academy
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Selamat datang, {session.user?.name}
          </h1>
          <p className="text-brand-100 text-sm leading-relaxed">
            Kelola data barang, pantau status fisik, cetak label QR Code, dan lakukan audit inventaris sekolah dengan cepat.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/scan"
              className="bg-white text-brand-900 hover:bg-brand-50 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 shadow transition-transform active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Pindai QR / Barcode</span>
            </Link>
            <Link
              href="/items/new"
              className="bg-brand-700 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 border border-brand-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Barang Baru</span>
            </Link>
          </div>
        </div>

        {/* Decorative Watermark Icon */}
        <Package className="absolute right-4 bottom-[-20px] w-56 h-56 text-white/5 pointer-events-none" />
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Inventaris</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalItems}</p>
            <p className="text-[11px] text-slate-400 mt-1">Barang terdaftar</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kondisi Baik</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{baikCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Siap digunakan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rusak (Ringan / Berat)</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{rusakRinganCount + rusakBeratCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">{rusakBeratCount} rusak berat</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sedang Dipinjam</p>
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">{dipinjamCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Dalam peminjaman</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid Section: Warranty Warning & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Warranty Alert Widget */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Garansi Habis dalam 30 Hari
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{warrantyExpiringItems.length} barang</span>
          </div>

          {warrantyExpiringItems.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">Tidak ada barang dengan masa garansi habis dalam 30 hari ke depan.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {warrantyExpiringItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <Link
                      href={`/items/${encodeURIComponent(item.code)}`}
                      className="font-semibold text-xs text-slate-900 dark:text-white hover:text-brand-700"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[11px] text-slate-500">
                      Kode: <span className="font-mono">{item.code}</span> • Lokasi: {item.location.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block">
                      {formatDate(item.warrantyExpiry)}
                    </span>
                    <span className="text-[10px] text-slate-400">Batas Garansi</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Per Category Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tags className="w-5 h-5 text-brand-700 dark:text-brand-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Kategori Inventaris</h2>
            </div>
            <Link href="/items" className="text-xs text-brand-700 font-semibold hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                <span className="bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 font-mono font-bold px-2.5 py-1 rounded-lg">
                  {cat._count.items} barang
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
