import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '-';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(d);
}

export const CONDITION_LABELS: Record<string, { label: string; badge: string }> = {
  BAIK: { label: 'Baik', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
  RUSAK_RINGAN: { label: 'Rusak Ringan', badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
  RUSAK_BERAT: { label: 'Rusak Berat', badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800' },
};

export const STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  TERSEDIA: { label: 'Tersedia', badge: 'bg-emerald-500 text-white' },
  DIPINJAM: { label: 'Dipinjam', badge: 'bg-sky-500 text-white' },
  DALAM_PERBAIKAN: { label: 'Dalam Perbaikan', badge: 'bg-amber-500 text-white' },
  HILANG: { label: 'Hilang', badge: 'bg-rose-500 text-white' },
  DIHAPUSKAN: { label: 'Dihapuskan', badge: 'bg-slate-500 text-white' },
};
