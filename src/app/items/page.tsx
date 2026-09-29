'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ItemCard } from '@/components/ItemCard';
import {
  Search,
  Plus,
  Package,
  Grid,
  List,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  Filter,
} from 'lucide-react';
import { CONDITION_LABELS, STATUS_LABELS, formatRupiah } from '@/lib/utils';
import { useSession } from 'next-auth/react';

export default function ItemsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'TERSEDIA' | 'DIPINJAM' | 'DALAM_PERBAIKAN' | 'DIHAPUSKAN'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Layout view mode: default 'table' like the image, with toggle to 'grid'
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [search, activeTab, selectedCategory, selectedLocation, selectedCondition, page]);

  const fetchMasterData = async () => {
    try {
      const [resCat, resLoc] = await Promise.all([
        fetch('/api/master/categories'),
        fetch('/api/master/locations'),
      ]);
      const dataCat = await resCat.json();
      const dataLoc = await resLoc.json();
      if (dataCat.success) setCategories(dataCat.data);
      if (dataLoc.success) setLocations(dataLoc.data);
    } catch (err) {
      console.error('Error loading master filters:', err);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (activeTab !== 'ALL') params.set('status', activeTab);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedLocation) params.set('location', selectedLocation);
      if (selectedCondition) params.set('condition', selectedCondition);
      params.set('page', page.toString());
      params.set('limit', '10');

      const res = await fetch(`/api/items?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        setTotalPages(json.meta.totalPages);
        setTotalCount(json.meta.total);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setActiveTab('ALL');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedCondition('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Title & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#174355] dark:text-white tracking-tight">Order History</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Kelola dan pantau status barang inventaris PT YAPI Talent Academy secara real-time.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {userRole !== 'PIMPINAN' && (
            <Link
              href="/items/new"
              className="bg-[#174355] hover:bg-[#1f5469] text-white px-4 py-2.5 rounded-full text-xs font-bold flex items-center space-x-2 shadow transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Barang Baru</span>
            </Link>
          )}

          {/* Toggle Grid / Table */}
          <div className="bg-white dark:bg-slate-800 p-1 rounded-full border border-slate-300 dark:border-slate-700 flex items-center space-x-1 shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full text-xs transition-colors ${
                viewMode === 'table' ? 'bg-[#174355] text-white shadow' : 'text-slate-500'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-[#174355] text-white shadow' : 'text-slate-500'
              }`}
              title="Tampilan Kartu"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Order History Table Card Container (Exact Reference UI Design) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        {/* Card Header & Sub-Tabs & Date Range Picker */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Order History</h2>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            {/* Sub-Tabs matching design */}
            <div className="flex items-center space-x-6 overflow-x-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
              <button
                onClick={() => {
                  setActiveTab('ALL');
                  setPage(1);
                }}
                className={`pb-2.5 relative transition-colors ${
                  activeTab === 'ALL' ? 'text-[#e05b38] font-bold' : 'hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All Orders
                {activeTab === 'ALL' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e05b38] rounded-full" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('TERSEDIA');
                  setPage(1);
                }}
                className={`pb-2.5 relative transition-colors ${
                  activeTab === 'TERSEDIA' ? 'text-[#e05b38] font-bold' : 'hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Tersedia
                {activeTab === 'TERSEDIA' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e05b38] rounded-full" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('DIPINJAM');
                  setPage(1);
                }}
                className={`pb-2.5 relative transition-colors ${
                  activeTab === 'DIPINJAM' ? 'text-[#e05b38] font-bold' : 'hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Dipinjam
                {activeTab === 'DIPINJAM' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e05b38] rounded-full" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('DALAM_PERBAIKAN');
                  setPage(1);
                }}
                className={`pb-2.5 relative transition-colors ${
                  activeTab === 'DALAM_PERBAIKAN' ? 'text-[#e05b38] font-bold' : 'hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Dalam Perbaikan
                {activeTab === 'DALAM_PERBAIKAN' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e05b38] rounded-full" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('DIHAPUSKAN');
                  setPage(1);
                }}
                className={`pb-2.5 relative transition-colors ${
                  activeTab === 'DIHAPUSKAN' ? 'text-[#e05b38] font-bold' : 'hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Cancelled / Dihapuskan
                {activeTab === 'DIHAPUSKAN' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e05b38] rounded-full" />
                )}
              </button>
            </div>

            {/* Date Range Picker Filter Pills */}
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-[#174355]" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none text-[11px]"
                />
              </div>

              <span className="text-slate-400 font-bold">To</span>

              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-[#174355]" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar: Search & Category Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Filter order name, code, serial..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#174355]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#174355]"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setPage(1);
            }}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#174355]"
          >
            <option value="">Semua Lokasi</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content View: Table vs Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#174355] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Memuat data inventaris...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Tidak ada data ditemukan</h3>
            <p className="text-xs text-slate-500">Sesuaikan kata kunci atau filter pencarian Anda.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          /* Table View Matching Image Columns (S No, Order ID, Order Name, Stock Value, Quantity, Status) */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#eef5fa] dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200/80 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">
                    <div className="flex items-center space-x-1">
                      <span>S No</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5">
                    <div className="flex items-center space-x-1">
                      <span>Order ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5">
                    <div className="flex items-center space-x-1">
                      <span>Order Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5">
                    <div className="flex items-center space-x-1">
                      <span>Stock Value</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5">
                    <div className="flex items-center space-x-1">
                      <span>Quantity</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5">
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                {items.map((item, index) => {
                  const sNo = (page - 1) * 10 + index + 1;

                  // Format status text color matching design: Delivered (Green), Cancelled (Red)
                  let statusColor = 'text-emerald-700 dark:text-emerald-400';
                  let statusText = 'Delivered';

                  if (item.status === 'DIPINJAM') {
                    statusColor = 'text-sky-600 dark:text-sky-400';
                    statusText = 'Dipinjam';
                  } else if (item.status === 'DALAM_PERBAIKAN') {
                    statusColor = 'text-amber-600 dark:text-amber-400';
                    statusText = 'Perbaikan';
                  } else if (item.status === 'DIHAPUSKAN' || item.status === 'HILANG') {
                    statusColor = 'text-[#d94830] dark:text-rose-400';
                    statusText = 'Cancelled';
                  } else if (item.condition === 'RUSAK_BERAT') {
                    statusColor = 'text-[#d94830] dark:text-rose-400';
                    statusText = 'Rusak Berat';
                  }

                  return (
                    <tr key={item.id} className="hover:bg-[#f6fafc] dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono text-slate-500">{sNo}</td>
                      <td className="p-3.5 font-mono font-bold text-[#174355] dark:text-brand-300">
                        <Link href={`/items/${encodeURIComponent(item.code)}`} className="hover:underline">
                          {item.code}
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <Link href={`/items/${encodeURIComponent(item.code)}`} className="font-semibold text-slate-900 dark:text-white hover:text-[#174355]">
                          {item.name}
                        </Link>
                        <span className="block text-[10px] text-slate-400">{item.category.name}</span>
                      </td>
                      <td className="p-3.5 font-mono">
                        {userRole === 'ADMIN' && item.acquisitionPrice
                          ? formatRupiah(item.acquisitionPrice)
                          : item.location.name}
                      </td>
                      <td className="p-3.5 font-mono">
                        {item.quantity} {item.unit.name}
                      </td>
                      <td className={`p-3.5 font-bold ${statusColor}`}>{statusText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination at bottom right matching reference screenshot: (<) (1) 2 3 4 ... 12 (>) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-1 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
              const pNum = idx + 1;
              const isCurrent = pNum === page;
              return (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#174355] text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            {totalPages > 5 && <span className="px-1 text-slate-400">... {totalPages}</span>}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
