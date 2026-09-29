import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { generateQRCodeDataURL } from '@/lib/qr';
import { CONDITION_LABELS, STATUS_LABELS } from '@/lib/utils';
import { Package, MapPin, Tag, ShieldCheck, LogIn, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function PublicItemPage({ params }: { params: { code: string } }) {
  const code = params.code;

  const item = await prisma.item.findUnique({
    where: { code, isDeleted: false },
    include: {
      category: true,
      location: true,
      unit: true,
      photos: true,
    },
  });

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950">
        <div className="max-w-sm w-full bg-white dark:bg-slate-900 rounded-3xl p-6 text-center shadow-xl border border-slate-200 dark:border-slate-800">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Barang Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mt-1">Kode label QR <strong>{code}</strong> tidak terdaftar dalam sistem inventaris PT YAPI Talent Academy.</p>
          <Link
            href="/login"
            className="mt-6 inline-block w-full py-2.5 bg-brand-900 text-white rounded-xl text-xs font-bold"
          >
            Masuk ke Aplikasi
          </Link>
        </div>
      </div>
    );
  }

  const qrUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/b/${item.code}`;
  const qrDataUrl = await generateQRCodeDataURL(qrUrl);

  const conditionInfo = CONDITION_LABELS[item.condition] || { label: item.condition, badge: 'bg-slate-100' };
  const statusInfo = STATUS_LABELS[item.status] || { label: item.status, badge: 'bg-slate-500 text-white' };

  const primaryPhoto = item.photos && item.photos.length > 0 ? item.photos[0].url : null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-6 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header YTA Branding */}
        <div className="bg-brand-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white text-brand-900 flex items-center justify-center font-bold text-sm shadow">
              YTA
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight">Inventaris YAPI Talent Academy</h1>
              <p className="text-[10px] text-brand-200">Informasi Label QR Resmi</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold bg-brand-800 border border-brand-700 text-brand-100 px-2.5 py-1 rounded-lg">
            {item.code}
          </span>
        </div>

        {/* Item Image */}
        {primaryPhoto ? (
          <div className="relative h-48 w-full bg-slate-200 dark:bg-slate-800">
            <img src={primaryPhoto} alt={item.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-32 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center text-slate-400">
            <Package className="w-10 h-10 stroke-[1.5]" />
          </div>
        )}

        {/* Main Public Content */}
        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5" />
                <span>{item.category.name}</span>
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusInfo.badge}`}>
                {statusInfo.label}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {item.name}
            </h2>
            {item.brandModel && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.brandModel}</p>
            )}
          </div>

          {/* Details Table */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 space-y-3 text-xs border border-slate-200/60 dark:border-slate-800">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Lokasi Penyimpanan:</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{item.location.name}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Kondisi Barang:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${conditionInfo.badge}`}>
                {conditionInfo.label}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Jumlah Stok:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.quantity} {item.unit.name}
              </span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="text-center pt-2">
            <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 mx-auto rounded-xl shadow-md border border-slate-200 p-1" />
            <p className="text-[10px] text-slate-400 mt-1 font-mono">URL: {qrUrl}</p>
          </div>

          {/* Login Action Button */}
          <div className="pt-2">
            <Link
              href={`/login?callbackUrl=/items/${encodeURIComponent(item.code)}`}
              className="w-full py-3 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center space-x-2 text-sm transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk untuk Kelola Barang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
