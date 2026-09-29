'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemCode = params.code as string;
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [itemCode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resCat, resLoc, resUnit, resPic, resItem] = await Promise.all([
        fetch('/api/master/categories'),
        fetch('/api/master/locations'),
        fetch('/api/master/units'),
        fetch('/api/master/pics'),
        fetch(`/api/items/${encodeURIComponent(itemCode)}`),
      ]);

      const dataCat = await resCat.json();
      const dataLoc = await resLoc.json();
      const dataUnit = await resUnit.json();
      const dataPic = await resPic.json();
      const dataItem = await resItem.json();

      if (dataCat.success) setCategories(dataCat.data);
      if (dataLoc.success) setLocations(dataLoc.data);
      if (dataUnit.success) setUnits(dataUnit.data);
      if (dataPic.success) setPics(dataPic.data);

      if (dataItem.success) {
        const item = dataItem.data;
        setName(item.name || '');
        setCategoryId(item.categoryId || '');
        setBrandModel(item.brandModel || '');
        setSerialNumber(item.serialNumber || '');
        setSpecification(item.specification || '');
        setQuantity(item.quantity?.toString() || '1');
        setUnitId(item.unitId || '');
        setLocationId(item.locationId || '');
        setPicId(item.picId || '');
        setCondition(item.condition || 'BAIK');
        setStatus(item.status || 'TERSEDIA');
        setAcquisitionDate(item.acquisitionDate ? item.acquisitionDate.split('T')[0] : '');
        setAcquisitionSource(item.acquisitionSource || 'PEMBELIAN');
        setAcquisitionPrice(item.acquisitionPrice ? item.acquisitionPrice.toString() : '');
        setWarrantyExpiry(item.warrantyExpiry ? item.warrantyExpiry.split('T')[0] : '');
        setNotes(item.notes || '');
        if (item.photos && item.photos.length > 0) {
          setPhotoUrl(item.photos[0].url);
        }
      } else {
        setError(dataItem.error || 'Gagal memuat barang');
      }
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError('Terjadi kesalahan memuat data barang');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !locationId || !unitId) {
      setError('Nama Barang, Kategori, Lokasi, dan Satuan wajib diisi.');
      return;
    }

    setSaving(true);
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

      const res = await fetch(`/api/items/${encodeURIComponent(itemCode)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Gagal memperbarui barang');
        setSaving(false);
        return;
      }

      router.push(`/items/${encodeURIComponent(itemCode)}`);
    } catch (err: any) {
      setError('Terjadi kesalahan koneksi server');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-brand-800 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Memuat data barang untuk diedit...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <Link
          href={`/items/${encodeURIComponent(itemCode)}`}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Barang {itemCode}</h1>
          <p className="text-xs text-slate-500">Ubah rincian informasi data barang inventaris</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
        {/* Identitas */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-brand-900 dark:text-brand-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            Identitas Barang
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Barang (Read Only)
              </label>
              <input
                type="text"
                disabled
                value={itemCode}
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
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>
          </div>
        </div>

        {/* Lokasi & Kondisi */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-brand-900 dark:text-brand-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            Penempatan & Status
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
                Jumlah & Satuan
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

            {userRole === 'ADMIN' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Harga Perolehan (Rp)
                </label>
                <input
                  type="number"
                  value={acquisitionPrice}
                  onChange={(e) => setAcquisitionPrice(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
          <Link
            href={`/items/${encodeURIComponent(itemCode)}`}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold flex items-center space-x-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
