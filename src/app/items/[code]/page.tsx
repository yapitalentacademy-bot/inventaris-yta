import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateQRCodeDataURL } from '@/lib/qr';
import { CONDITION_LABELS, STATUS_LABELS, formatDate, formatDateTime, formatRupiah } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Edit, Printer, Trash2, MapPin, Tag, User, ShieldCheck, History, Package, Clock, QrCode } from 'lucide-react';

export default async function ItemDetailPage({ params }: { params: { code: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const code = params.code;

  const item = await prisma.item.findUnique({
    where: { code },
    include: {
      category: true,
      location: true,
      unit: true,
      pic: true,
      photos: true,
      createdBy: { select: { name: true, email: true } },
      updatedBy: { select: { name: true, email: true } },
      history: {
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!item || item.isDeleted) {
    notFound();
  }

  const userRole = (session.user as any)?.role;

  const qrUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/b/${item.code}`;
  const qrDataUrl = await generateQRCodeDataURL(qrUrl);

  const conditionInfo = CONDITION_LABELS[item.condition] || { label: item.condition, badge: '' };
  const statusInfo = STATUS_LABELS[item.status] || { label: item.status, badge: '' };

  const primaryPhoto = item.photos && item.photos.length > 0 ? item.photos[0].url : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/items"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm bg-brand-900 text-white px-2.5 py-0.5 rounded-md">
                {item.code}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusInfo.badge}`}>
                {statusInfo.label}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{item.name}</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Link
            href={`/labels?printCode=${encodeURIComponent(item.code)}`}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Label</span>
          </Link>

          {userRole !== 'PIMPINAN' && (
            <Link
              href={`/items/${encodeURIComponent(item.code)}/edit`}
              className="px-3.5 py-2 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Photos & QR */}
        <div className="space-y-6">
          {/* Photo Showcase */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {primaryPhoto ? (
              <img src={primaryPhoto} alt={item.name} className="w-full h-56 object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-48 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                <Package className="w-12 h-12 stroke-[1.5]" />
                <span className="text-xs mt-1">Belum ada foto</span>
              </div>
            )}
          </div>

          {/* QR Code Label Preview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Label QR Code Scanner</h3>
            <img src={qrDataUrl} alt="QR Code" className="w-36 h-36 mx-auto rounded-xl p-1 border border-slate-200" />
            <p className="text-[11px] text-slate-400 font-mono break-all">{qrUrl}</p>
          </div>
        </div>

        {/* Right Column: Complete Attribute Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-brand-900 dark:text-brand-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            Spesifikasi & Detail Barang
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="text-slate-500 block">Kategori</span>
              <span className="font-semibold text-slate-900 dark:text-white">{item.category.name}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="text-slate-500 block">Lokasi Penyimpanan</span>
              <span className="font-semibold text-slate-900 dark:text-white">{item.location.name}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="text-slate-500 block">Jumlah & Satuan</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.quantity} {item.unit.name}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="text-slate-500 block">Kondisi Fisik</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${conditionInfo.badge}`}>
                {conditionInfo.label}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="text-slate-500 block">Merek / Model</span>
              <span className="font-semibold text-slate-900 dark:text-white">{item.brandModel || '-'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="text-slate-500 block">Nomor Seri</span>
              <span className="font-semibold font-mono text-slate-900 dark:text-white">{item.serialNumber || '-'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="text-slate-500 block">Penanggung Jawab (PIC)</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.pic ? `${item.pic.name} (${item.pic.division || ''})` : '-'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="text-slate-500 block">Masa Garansi Sampai</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatDate(item.warrantyExpiry)}</span>
            </div>

            {/* Confidential Price Row for Admin */}
            {userRole === 'ADMIN' && (
              <div className="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900 space-y-1">
                <span className="text-brand-800 dark:text-brand-300 font-semibold block">Harga Perolehan (Khusus Admin)</span>
                <span className="font-bold text-sm text-brand-900 dark:text-brand-200">
                  {formatRupiah(item.acquisitionPrice as any)}
                </span>
              </div>
            )}
          </div>

          {/* Specifications Text */}
          {item.specification && (
            <div className="space-y-1 pt-2">
              <span className="text-xs font-semibold text-slate-500 block">Spesifikasi Lengkap</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                {item.specification}
              </p>
            </div>
          )}

          {/* History Timeline */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-brand-700" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Riwayat & Log Perubahan
              </h3>
            </div>

            <div className="space-y-2.5">
              {item.history.map((h) => (
                <div key={h.id} className="text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-start justify-between">
                  <div>
                    <span className="font-bold text-brand-800 dark:text-brand-300 mr-2">[{h.action}]</span>
                    <span className="text-slate-700 dark:text-slate-300">{h.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-3 font-mono">{formatDateTime(h.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
