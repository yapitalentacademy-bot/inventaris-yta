'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Printer, Plus, Camera, ArrowLeft, AlertCircle, Upload, Link as LinkIcon, X, CheckCircle2, FolderPlus, MapPinPlus } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function NewItemPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [predictedCode, setPredictedCode] = useState<string>('Memuat...');
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [pics, setPics] = useState<any[]>([]);

  // Form State
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
  
  // Photo State
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoInputMode, setPhotoInputMode] = useState<'upload' | 'url'>('upload');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Quick Add Modal States
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState('Ruang');
  const [newLocDesc, setNewLocDesc] = useState('');
  const [addingLoc, setAddingLoc] = useState(false);

  // Status & Validation State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

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

      if (dataCat.success && dataCat.data) {
        setCategories(dataCat.data);
        if (dataCat.data.length > 0 && !categoryId) {
          setCategoryId(dataCat.data[0].id);
        }
      }
      if (dataLoc.success && dataLoc.data) {
        setLocations(dataLoc.data);
        if (dataLoc.data.length > 0 && !locationId) {
          setLocationId(dataLoc.data[0].id);
        }
      }
      if (dataUnit.success && dataUnit.data) {
        setUnits(dataUnit.data);
        if (dataUnit.data.length > 0 && !unitId) {
          const defaultUnit = dataUnit.data.find((u: any) => u.name.toLowerCase() === 'unit' || u.name.toLowerCase() === 'pcs') || dataUnit.data[0];
          setUnitId(defaultUnit.id);
        }
      }
      if (dataPic.success && dataPic.data) {
        setPics(dataPic.data);
      }

      if (resPreview) {
        const previewJson = await resPreview.json();
        if (previewJson.success && previewJson.data?.code) {
          setPredictedCode(previewJson.data.code);
        } else {
          setPredictedCode('[ Otomatis Diberikan ]');
        }
      }
    } catch (err) {
      console.error('Error fetching form master data:', err);
      setPredictedCode('[ Otomatis Diberikan ]');
    }
  };

  const handleQuickAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const res = await fetch('/api/master/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim(), description: newCatDesc.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        const updatedCatRes = await fetch('/api/master/categories');
        const updatedCatJson = await updatedCatRes.json();
        if (updatedCatJson.success) setCategories(updatedCatJson.data);
        setCategoryId(json.data.id);
        setNewCatName('');
        setNewCatDesc('');
        setShowAddCategoryModal(false);
      } else {
        alert(json.error || 'Gagal menambah kategori');
      }
    } catch (err) {
      alert('Gagal menambah kategori baru');
    } finally {
      setAddingCat(false);
    }
  };

  const handleQuickAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    setAddingLoc(true);
    try {
      const res = await fetch('/api/master/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLocName.trim(), type: newLocType, description: newLocDesc.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        const updatedLocRes = await fetch('/api/master/locations');
        const updatedLocJson = await updatedLocRes.json();
        if (updatedLocJson.success) setLocations(updatedLocJson.data);
        setLocationId(json.data.id);
        setNewLocName('');
        setNewLocDesc('');
        setShowAddLocationModal(false);
      } else {
        alert(json.error || 'Gagal menambah lokasi');
      }
    } catch (err) {
      alert('Gagal menambah lokasi baru');
    } finally {
      setAddingLoc(false);
    }
  };

  // Compress & convert file to Base64 data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoUrl(dataUrl);
        setPhotoPreview(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatRupiah = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    if (!name.trim()) errors.name = true;
    if (!categoryId) errors.categoryId = true;
    if (!locationId) errors.locationId = true;
    if (!unitId) errors.unitId = true;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (andPrint = false, addMore = false) => {
    if (!validateForm()) {
      setError('Harap lengkapi semua kolom wajib yang ditandai bintang (*)');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const createdCode = json.data.code;

      if (andPrint) {
        router.push(`/labels?printCode=${encodeURIComponent(createdCode)}`);
      } else if (addMore) {
        // Reset form for next item
        setName('');
        setBrandModel('');
        setSerialNumber('');
        setSpecification('');
        setPhotoUrl('');
        setPhotoPreview(null);
        setNotes('');
        setAcquisitionPrice('');
        setWarrantyExpiry('');
        setFieldErrors({});
        setLoading(false);
        fetchInitialData();
        alert(`Barang ${createdCode} berhasil disimpan! Anda dapat memasukkan barang berikutnya.`);
      } else {
        router.push(`/items/${encodeURIComponent(createdCode)}`);
      }
    } catch (err: any) {
      setError('Terjadi kesalahan koneksi server');
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/items"
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tambah Barang Inventaris Baru</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Isi data rincian barang inventaris YTA di bawah ini secara lengkap
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2 shadow-sm animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-8">
        
        {/* SECTION 1: IDENTITAS BARANG */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-bold text-brand-900 dark:text-brand-400 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-900 dark:text-brand-300 flex items-center justify-center text-xs">1</span>
              <span>Identitas Utama Barang</span>
            </h2>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">* Wajib diisi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kode Barang (Read-only Preview) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Barang (Otomatis)
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={predictedCode}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 font-mono font-bold text-brand-800 dark:text-brand-300 text-xs cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-[10px] bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 font-semibold px-2 py-0.5 rounded-md">
                  Preview
                </span>
              </div>
            </div>

            {/* Nama Barang */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Barang <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setFieldErrors((prev) => ({ ...prev, name: false }));
                }}
                placeholder="Contoh: Laptop Lenovo ThinkPad E14 / Proyektor Epson"
                className={`w-full py-2.5 px-3 rounded-xl border ${
                  fieldErrors.name
                    ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900'
                    : 'border-slate-200 dark:border-slate-700'
                } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all`}
              />
            </div>

            {/* Kategori dengan Quick Add */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(true)}
                  className="text-[11px] font-bold text-brand-700 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300 flex items-center space-x-1"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>+ Tambah Baru</span>
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (e.target.value) setFieldErrors((prev) => ({ ...prev, categoryId: false }));
                }}
                className={`w-full py-2.5 px-3 rounded-xl border ${
                  fieldErrors.categoryId
                    ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900'
                    : 'border-slate-200 dark:border-slate-700'
                } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all`}
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Merek / Model */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Merek / Model
              </label>
              <input
                type="text"
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                placeholder="Contoh: Epson EB-E500 / Asus Vivobook"
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all"
              />
            </div>

            {/* Nomor Seri */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Seri / Serial Number
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Contoh: LNV-8392104 / SN-998231"
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all"
              />
            </div>

            {/* Spesifikasi / Detail Teknis */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Spesifikasi / Detail Teknis
              </label>
              <textarea
                rows={2}
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                placeholder="Contoh: Processor Core i5 Gen 11, RAM 16GB, SSD 512GB, Warna Hitam Matte"
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PENEMPATAN & FISIK */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-bold text-brand-900 dark:text-brand-400 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-900 dark:text-brand-300 flex items-center justify-center text-xs">2</span>
              <span>Penempatan, Jumlah & Status</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lokasi Penyimpanan dengan Quick Add */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Lokasi Penyimpanan <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(true)}
                  className="text-[11px] font-bold text-brand-700 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300 flex items-center space-x-1"
                >
                  <MapPinPlus className="w-3 h-3" />
                  <span>+ Tambah Baru</span>
                </button>
              </div>
              <select
                value={locationId}
                onChange={(e) => {
                  setLocationId(e.target.value);
                  if (e.target.value) setFieldErrors((prev) => ({ ...prev, locationId: false }));
                }}
                className={`w-full py-2.5 px-3 rounded-xl border ${
                  fieldErrors.locationId
                    ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900'
                    : 'border-slate-200 dark:border-slate-700'
                } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all`}
              >
                <option value="">-- Pilih Lokasi Penyimpanan --</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Jumlah & Satuan */}
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
                  className="w-24 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 text-center font-bold"
                />
                <select
                  value={unitId}
                  onChange={(e) => {
                    setUnitId(e.target.value);
                    if (e.target.value) setFieldErrors((prev) => ({ ...prev, unitId: false }));
                  }}
                  className={`flex-grow py-2.5 px-3 rounded-xl border ${
                    fieldErrors.unitId
                      ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900'
                      : 'border-slate-200 dark:border-slate-700'
                  } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all`}
                >
                  <option value="">-- Pilih Satuan --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Penanggung Jawab (PIC) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Penanggung Jawab (PIC)
              </label>
              <select
                value={picId}
                onChange={(e) => setPicId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all"
              >
                <option value="">-- Pilih PIC (Opsional) --</option>
                {pics.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.division ? `(${p.division})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Kondisi Fisik */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kondisi Fisik
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all"
              >
                <option value="BAIK">Baik ( Normal )</option>
                <option value="RUSAK_RINGAN">Rusak Ringan (Perlu Servis)</option>
                <option value="RUSAK_BERAT">Rusak Berat (Tidak Berfungsi)</option>
              </select>
            </div>

            {/* Status Operasional */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Operasional
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all"
              >
                <option value="TERSEDIA">Tersedia (Ready)</option>
                <option value="DIPINJAM">Dipinjam (Sedang Digunakan)</option>
                <option value="DALAM_PERBAIKAN">Dalam Perbaikan (Maintenance)</option>
                <option value="HILANG">Hilang</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: PEROLEHAN & GARANSI */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-bold text-brand-900 dark:text-brand-400 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-900 dark:text-brand-300 flex items-center justify-center text-xs">3</span>
              <span>Riwayat Perolehan & Garansi</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sumber Perolehan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sumber Perolehan
              </label>
              <select
                value={acquisitionSource}
                onChange={(e) => setAcquisitionSource(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all"
              >
                <option value="PEMBELIAN">Pembelian Pengadaan</option>
                <option value="HIBAH">Hibah / Bantuan Donasi</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            {/* Tanggal Perolehan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Perolehan
              </label>
              <input
                type="date"
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all"
              />
            </div>

            {/* Masa Garansi Sampai */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Masa Garansi Sampai
              </label>
              <input
                type="date"
                value={warrantyExpiry}
                onChange={(e) => setWarrantyExpiry(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all"
              />
            </div>

            {/* Harga Perolehan (Admin Only) */}
            {userRole === 'ADMIN' && (
              <div className="md:col-span-3">
                <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-900 dark:text-amber-300">
                      Harga Perolehan Barang (Rp) <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold px-1.5 py-0.5 rounded">Admin Only</span>
                    </label>
                    {acquisitionPrice && (
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                        {formatRupiah(acquisitionPrice)}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={acquisitionPrice}
                    onChange={(e) => setAcquisitionPrice(e.target.value)}
                    placeholder="Contoh: 12500000"
                    className="w-full py-2 px-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: FOTO & CATATAN TAMBAHAN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-bold text-brand-900 dark:text-brand-400 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-900 dark:text-brand-300 flex items-center justify-center text-xs">4</span>
              <span>Foto & Catatan Tambahan</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Foto Upload Component */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Foto Barang Inventaris
                </label>
                <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPhotoInputMode('upload')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center space-x-1 transition-all ${
                      photoInputMode === 'upload'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload / Kamera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoInputMode('url')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center space-x-1 transition-all ${
                      photoInputMode === 'url'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>URL Web</span>
                  </button>
                </div>
              </div>

              {photoPreview ? (
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-900 group aspect-video max-h-48 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Preview Foto Barang" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-transform hover:scale-105"
                    title="Hapus foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-white flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Foto Siap Disimpan</span>
                  </div>
                </div>
              ) : photoInputMode === 'upload' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-700 dark:hover:border-brand-500 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800 cursor-pointer transition-all space-y-2 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Klik untuk Ambil Foto / Pilih File
                    </p>
                    <p className="text-[11px] text-slate-400">Dapat menggunakan Kamera HP atau Galeri HP / Komputer</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => {
                      setPhotoUrl(e.target.value);
                      setPhotoPreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
                  />
                  <p className="text-[10px] text-slate-400">Masukkan link URL gambar publik (Unsplash, Imgur, Cloudinary)</p>
                </div>
              )}
            </div>

            {/* Catatan / Keterangan */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Keterangan / Catatan Bebas
              </label>
              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan mengenai riwayat, kelengkapan aksesoris (misal: charger, kabel HDMI, tas), atau catatan khusus lainnya..."
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 justify-between items-center">
          <Link
            href="/items"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
          >
            Batal
          </Link>

          <div className="flex flex-wrap gap-3 justify-end items-center">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(false, true)}
              className="px-4 py-2.5 rounded-xl border border-brand-300 dark:border-brand-800 text-brand-900 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950 text-xs font-bold flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan & Tambah Lagi</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(true, false)}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-2 shadow-md transition-all disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Simpan & Cetak Label</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(false, false)}
              className="px-6 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 dark:bg-brand-800 dark:hover:bg-brand-700 text-white text-xs font-bold flex items-center space-x-2 shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Barang'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* QUICK ADD CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FolderPlus className="w-4 h-4 text-brand-700" />
                <span>Tambah Kategori Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Contoh: Perangkat Jaringan / Olahraga"
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Penjelasan ringkas kategori..."
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-700"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addingCat}
                  className="px-5 py-2 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold shadow"
                >
                  {addingCat ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD LOCATION MODAL */}
      {showAddLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <MapPinPlus className="w-4 h-4 text-brand-700" />
                <span>Tambah Lokasi Penyimpanan Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddLocationModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lokasi / Ruangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  placeholder="Contoh: Ruang Rapat Utama / Lab Komputer B"
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipe Tempat
                </label>
                <select
                  value={newLocType}
                  onChange={(e) => setNewLocType(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-700"
                >
                  <option value="Ruang">Ruangan</option>
                  <option value="Gudang">Gudang / Storage</option>
                  <option value="Lemari">Lemari / Rak</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan Lokasi (Opsional)
                </label>
                <input
                  type="text"
                  value={newLocDesc}
                  onChange={(e) => setNewLocDesc(e.target.value)}
                  placeholder="Contoh: Gedung B Lantai 2"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-700"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addingLoc}
                  className="px-5 py-2 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold shadow"
                >
                  {addingLoc ? 'Menyimpan...' : 'Simpan Lokasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
