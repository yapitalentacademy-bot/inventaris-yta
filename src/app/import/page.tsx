'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle, RefreshCw, ArrowRight, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const router = RouterHook();
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileInfo({ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` });
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet);

        setParsedRows(jsonRows);

        // Call backend API preview
        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: jsonRows, action: 'preview' }),
        });

        const json = await res.json();
        if (json.success) {
          setPreviewData(json);
        } else {
          setErrorMsg(json.error || 'Gagal memproses pratinjau file Excel');
        }
      } catch (err: any) {
        console.error('Error reading Excel file:', err);
        setErrorMsg('Format file Excel atau CSV tidak dapat dibaca.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCommitImport = async () => {
    if (!parsedRows || parsedRows.length === 0) return;

    setImporting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsedRows, action: 'save' }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message);
        setTimeout(() => {
          router.push('/items');
        }, 2000);
      } else {
        setErrorMsg(json.error || 'Gagal mengimpor data barang ke database');
      }
    } catch (err) {
      console.error('Error committing import:', err);
      setErrorMsg('Terjadi kesalahan koneksi saat mengimpor');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Impor Data Awal dari Excel / CSV</h1>
        <p className="text-xs text-slate-500 mt-1">
          Impor hasil ekspor Google Sheets. Kode barang lama akan dipertahankan persis dan sequence otomatis berlanjut.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4">
        <FileSpreadsheet className="w-16 h-16 text-brand-700 mx-auto" />
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Pilih File Excel (.xlsx, .xls) atau CSV</h3>
          <p className="text-xs text-slate-500 mt-1">
            Kolom didukung: Kode Barang, Nama Barang, Kategori, Stok Awal, Satuan, Lokasi, Kondisi, Keterangan
          </p>
        </div>

        <label className="inline-flex items-center space-x-2 bg-brand-900 hover:bg-brand-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer transition-transform active:scale-95">
          <Upload className="w-4 h-4" />
          <span>Upload File Excel</span>
          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
        </label>

        {fileInfo && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Terpilih: {fileInfo.name} ({fileInfo.size})
          </p>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Preview Section */}
      {previewData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Pratinjau Impor ({previewData.summary.validRowsCount} Baris Valid)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nomor sequence database akan otomatis diatur berlanjut dari sequence <strong>#{previewData.summary.maxSequenceFound}</strong>
              </p>
            </div>

            <button
              onClick={handleCommitImport}
              disabled={importing}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{importing ? 'Mengimpor Data...' : 'Simpan Semua Data Ke Database'}</span>
            </button>
          </div>

          {/* Validation Warnings */}
          {previewData.errors && previewData.errors.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs space-y-1">
              <p className="font-bold">Laporan Catatan Baris File:</p>
              {previewData.errors.map((err: string, i: number) => (
                <p key={i}>• {err}</p>
              ))}
            </div>
          )}

          {/* Preview Table Sample */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Baris</th>
                  <th className="p-3">Kode Hasil</th>
                  <th className="p-3">Nama Barang</th>
                  <th className="p-3">Jumlah</th>
                  <th className="p-3">Kondisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {previewData.previewData.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-3 font-mono text-slate-400">{row.rowNum}</td>
                    <td className="p-3 font-mono font-bold text-brand-800 dark:text-brand-300">{row.code || '(Auto Code)'}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{row.name}</td>
                    <td className="p-3">{row.quantity}</td>
                    <td className="p-3">{row.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function RouterHook() {
  return useRouter();
}
