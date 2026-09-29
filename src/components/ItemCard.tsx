'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, MapPin, Tag, QrCode, ArrowRight } from 'lucide-react';
import { CONDITION_LABELS, STATUS_LABELS } from '@/lib/utils';

interface ItemCardProps {
  item: {
    id: string;
    code: string;
    name: string;
    brandModel?: string | null;
    quantity: number;
    category: { name: string };
    location: { name: string };
    unit: { name: string };
    condition: string;
    status: string;
    photos?: { url: string }[];
  };
}

export function ItemCard({ item }: ItemCardProps) {
  const primaryPhoto = item.photos && item.photos.length > 0 ? item.photos[0].url : null;
  const conditionInfo = CONDITION_LABELS[item.condition] || { label: item.condition, badge: 'bg-slate-100 text-slate-800' };
  const statusInfo = STATUS_LABELS[item.status] || { label: item.status, badge: 'bg-slate-500 text-white' };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Image & Badges Banner */}
        <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {primaryPhoto ? (
            <img
              src={primaryPhoto}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <Package className="w-12 h-12 stroke-[1.5]" />
              <span className="text-xs mt-1">Tanpa Foto</span>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="font-mono font-bold text-xs bg-brand-900/90 text-white backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-white/20">
              {item.code}
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm ${statusInfo.badge}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center space-x-2 text-xs text-brand-700 dark:text-brand-400 font-semibold mb-1">
              <Tag className="w-3.5 h-3.5" />
              <span>{item.category.name}</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2">
              {item.name}
            </h3>
            {item.brandModel && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{item.brandModel}</p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-[140px]">{item.location.name}</span>
            </div>

            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${conditionInfo.badge}`}>
              {conditionInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer Action */}
      <div className="px-4 pb-4 pt-1">
        <Link
          href={`/items/${encodeURIComponent(item.code)}`}
          className="w-full bg-slate-50 hover:bg-brand-50 dark:bg-slate-800/60 dark:hover:bg-brand-950/50 text-slate-700 dark:text-slate-200 hover:text-brand-800 dark:hover:text-brand-300 font-semibold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center space-x-2 text-xs transition-all"
        >
          <span>Detail & QR Code</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
