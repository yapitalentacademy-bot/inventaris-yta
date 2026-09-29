'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getNextItemCodePreview } from '@/lib/code-generator';
import { Save, Printer, Plus, Camera, ArrowLeft, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function NewItemPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const [predictedCode, setPredictedCode] = useState('001-BRG-YTA');
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [pics, setPics] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [specification, setSpecification] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitId, setUnitId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [picId, setPicId] = useState('');
  const [condition, setCondition] = useState('BAIK');
  const [status, setStatus] = useState('TERSEDIA');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [acquisitionSource, setAcquisitionSource] = useState('PEMBELIAN');
  const [acquisitionPrice, setAcquisitionPrice] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resCat, resLoc, resUnit, resPic, resPreview] = await Promise.all([
        fetch('/api/master/categories'),
        fetch('/api/master/locations'),
        fetch('/api/master/units'),
        fetch('/api/master/pics'),
        fetch('/api/items/code-preview').catch(() => null),
      ]);

      const dataCat = await resCat.json();
      const dataLoc = await resLoc.json();
      const dataUnit = await resUnit.json();
      const dataPic = await resPic.json();

      if (dataCat.success && dataCat.data.length > 0) {
        setCategories(dataCat.data);
        setCategoryId(dataCat.data[0].id);
      }
      if (dataLoc.success && dataLoc.data.length > 0) {
        setLocations(dataLoc.data);
        setLocationId(dataLoc.data[0].id);
      }
      if (dataUnit.success && dataUnit.data.length > 0) {
        setUnits(dataUnit.data);
        setUnitId(dataUnit.data[0].id);
      }
      if (dataPic.success) setPics(dataPic.data);
    } catch (err) {
      console.error('Error fetching form master data:', err);
    }
  };

  const handleSave = async (andPrint = false, addMore = false) => {
    if (!name || !categoryId || !locationId || !unitId) {
      setError('Nama Barang, Kategori, Lokasi, dan Satuan wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        categoryId,
        brandModel,
        serialNumber,
        specification,
        quantity,
        unitId,
        locationId,
        picId,
        condition,
        status,
        acquisitionDate,
        acquisitionSource,
        acquisitionPrice,
        warrantyExpiry,
        notes,
        photos: photoUrl ? [photoUrl] : [],
      };

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Gagal menyimpan barang');
        setLoading(false);
        return;
      }

      const createdCode = json.data.code;

      if (andPrint) {
        // Redirect to print page with code query
        router.push(`/labels?printCode=${encodeURIComponent(createdCode)}`);
      } else if (addMore) {
        // Reset form for next item
        setName('');
        setBrandModel('');
        setSerialNumber('');
        setSpecification('');
        setPhotoUrl('');
        setNotes('');
        setLoading(false);
        alert(`Barang ${createdCode} berhasil disimpan!`);
      } else {
        router.push(`/items/${encodeURIComponent(createdCode)}`);
      }
    } catch (err: any) {
      setError('Terjadi kesalahan koneksi server');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <Link
          href="/items"
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tambah Barang Inventaris Baru</h1>
          <p className="text-xs text-slate-500">Kode unik barang akan otomatis digenerate dari sequence database</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
        {/* Section 1: Identitas Utama */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-brand-900 dark:text-brand-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            1. Identitas Barang
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Barang (Otomatis)
              </label>
              <input
                type="text"
                disabled
                value="[ Otomatis Diberikan ]"
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 font-mono font-bold text-brand-800 dark:text-brand-300 text-xs cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Barang <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Laptop Lenovo ThinkPad E14"
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Merek / Model
              </label>
              <input
                type="text"
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                placeholder="Contoh: Epson EB-E500"
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Seri
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Contoh: LNV-8392104"
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Penempatan & Kondisi */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-brand-900 dark:text-brand-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            2. Penempatan & Fisik
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi Penyimpanan <span className="text-rose-500">*</span>
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah & Satuan <span className="text-rose-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-20 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="flex-grow py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Penanggung Jawab (PIC)
              </label>
              <select
                value={picId}
                onChange={(e) => setPicId(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              >
                <option value="">-- Pilih PIC --</option>
                {pics.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.division ? `(${p.division})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kondisi Fisik
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              >
                <option value="BAIK">Baik</option>
                <option value="RUSAK_RINGAN">Rusak Ringan</option>
                <option value="RUSAK_BERAT">Rusak Berat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Operasional
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              >
                <option value="TERSEDIA">Tersedia</option>
                <option value="DIPINJAM">Dipinjam</option>
                <option value="DALAM_PERBAIKAN">Dalam Perbaikan</option>
                <option value="HILANG">Hilang</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Perolehan & Keuangan */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-brand-900 dark:text-brand-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            3. Perolehan & Garansi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sumber Perolehan
              </label>
              <select
                value={acquisitionSource}
                onChange={(e) => setAcquisitionSource(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              >
                <option value="PEMBELIAN">Pembelian</option>
                <option value="HIBAH">Hibah / Bantuan</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Perolehan
              </label>
              <input
                type="date"
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>

            {userRole === 'ADMIN' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Harga Perolehan (Rp) <span className="text-[10px] text-slate-400 font-normal">(Admin Only)</span>
                </label>
                <input
                  type="number"
                  value={acquisitionPrice}
                  onChange={(e) => setAcquisitionPrice(e.target.value)}
                  placeholder="Contoh: 12500000"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Masa Garansi Sampai
              </label>
              <input
                type="date"
                value={warrantyExpiry}
                onChange={(e) => setWarrantyExpiry(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Foto & Catatan */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-brand-900 dark:text-brand-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            4. Foto & Catatan Tambahan
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL Foto Barang (Kamera HP / Disk)
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-grow py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Keterangan / Catatan Bebas
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan mengenai kelengkapan atau riwayat khusus..."
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(false, true)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-bold flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Simpan & Tambah Lagi</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(true, false)}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-2 shadow"
          >
            <Printer className="w-4 h-4" />
            <span>Simpan & Cetak Label</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(false, false)}
            className="px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold flex items-center space-x-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Menyimpan...' : 'Simpan Barang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
