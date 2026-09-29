'use client';

import { useState, useEffect } from 'react';
import { Tags, MapPin, Scale, User, Plus, Settings, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function MasterDataPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const [activeTab, setActiveTab] = useState<'categories' | 'locations' | 'units' | 'pics'>('categories');

  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [pics, setPics] = useState<any[]>([]);

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [resCat, resLoc, resUnit, resPic] = await Promise.all([
        fetch('/api/master/categories'),
        fetch('/api/master/locations'),
        fetch('/api/master/units'),
        fetch('/api/master/pics'),
      ]);

      const dataCat = await resCat.json();
      const dataLoc = await resLoc.json();
      const dataUnit = await resUnit.json();
      const dataPic = await resPic.json();

      if (dataCat.success) setCategories(dataCat.data);
      if (dataLoc.success) setLocations(dataLoc.data);
      if (dataUnit.success) setUnits(dataUnit.data);
      if (dataPic.success) setPics(dataPic.data);
    } catch (err) {
      console.error('Error fetching master data:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    setLoading(true);
    try {
      let endpoint = '/api/master/categories';
      let body: any = { name: newName, description: newDesc };

      if (activeTab === 'locations') {
        endpoint = '/api/master/locations';
      } else if (activeTab === 'units') {
        endpoint = '/api/master/units';
      } else if (activeTab === 'pics') {
        endpoint = '/api/master/pics';
        body = { name: newName, division: newDesc };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        setNewName('');
        setNewDesc('');
        fetchMasterData();
      } else {
        alert(json.error || 'Gagal membuat master data');
      }
    } catch (err) {
      console.error('Error creating master data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3">
        <Settings className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Akses Terbatas</h2>
        <p className="text-xs text-slate-500">Hanya akun bertipe Admin yang dapat mengelola master data inventaris.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kelola Master Data Inventaris</h1>
        <p className="text-xs text-slate-500 mt-1">Tambah Kategori, Lokasi, Satuan, dan Penanggung Jawab barang</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === 'categories'
              ? 'border-brand-700 text-brand-900 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tags className="w-4 h-4" />
          <span>Kategori ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === 'locations'
              ? 'border-brand-700 text-brand-900 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Lokasi ({locations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('units')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === 'units'
              ? 'border-brand-700 text-brand-900 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Satuan ({units.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pics')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === 'pics'
              ? 'border-brand-700 text-brand-900 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Penanggung Jawab ({pics.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Add New Master item */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-brand-900 dark:text-brand-400 uppercase tracking-wider">
            Tambah {activeTab} Baru
          </h2>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Nama</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh nama..."
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>

            {activeTab !== 'units' && (
              <div>
                <label className="block font-semibold mb-1">
                  {activeTab === 'pics' ? 'Divisi / Jabatan' : 'Deskripsi'}
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Keterangan..."
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Master</span>
            </button>
          </form>
        </div>

        {/* Master Item List */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-brand-900 dark:text-brand-400 uppercase tracking-wider">
            Daftar Data Terdaftar
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeTab === 'categories' &&
              categories.map((c) => (
                <div key={c.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                    <p className="text-[11px] text-slate-400">{c.description || 'Tanpa deskripsi'}</p>
                  </div>
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                    {c._count?.items || 0} barang
                  </span>
                </div>
              ))}

            {activeTab === 'locations' &&
              locations.map((l) => (
                <div key={l.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{l.name}</span>
                    <p className="text-[11px] text-slate-400">{l.description || 'Tanpa deskripsi'}</p>
                  </div>
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                    {l._count?.items || 0} barang
                  </span>
                </div>
              ))}

            {activeTab === 'units' &&
              units.map((u) => (
                <div key={u.id} className="py-3 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                </div>
              ))}

            {activeTab === 'pics' &&
              pics.map((p) => (
                <div key={p.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                    <p className="text-[11px] text-slate-400">{p.division || 'Tanpa divisi'}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
