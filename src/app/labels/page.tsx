'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Printer, CheckSquare, Square, FileText, Download } from 'lucide-react';

function LabelsContent() {
  const searchParams = useSearchParams();
  const printCode = searchParams.get('printCode');

  const [items, setItems] = useState<any[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [format, setFormat] = useState<'a4_3x8' | 'a4_4x10' | 'thermal_50x30'>('a4_3x8');
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (printCode && items.length > 0) {
      if (!selectedCodes.includes(printCode)) {
        setSelectedCodes([printCode]);
      }
    }
  }, [printCode, items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/items?limit=100');
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        if (!printCode && json.data.length > 0) {
          setSelectedCodes(json.data.slice(0, 6).map((i: any) => i.code));
        }
      }
    } catch (err) {
      console.error('Error loading items for label printing:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCodes.length === items.length) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(items.map((i) => i.code));
    }
  };

  const toggleSelectCode = (code: string) => {
    if (selectedCodes.includes(code)) {
      setSelectedCodes(selectedCodes.filter((c) => c !== code));
    } else {
      setSelectedCodes([...selectedCodes, code]);
    }
  };

  const handleGeneratePDF = async () => {
    if (selectedCodes.length === 0) {
      alert('Pilih minimal 1 barang untuk dicetak.');
      return;
    }

    setGeneratingPdf(true);
    try {
      const res = await fetch('/api/labels/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemCodes: selectedCodes, format }),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        alert(errorJson.error || 'Gagal membuat PDF label');
        setGeneratingPdf(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
    } catch (err) {
      console.error('Error generating label PDF:', err);
      alert('Gagal menghasilkan PDF label');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#174355] dark:text-white tracking-tight">Cetak Label QR Code PDF</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Pilih format kertas dan barang yang ingin dicetak labelnya
          </p>
        </div>

        <button
          onClick={handleGeneratePDF}
          disabled={generatingPdf || selectedCodes.length === 0}
          className="bg-[#174355] hover:bg-[#1f5469] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center space-x-2 shadow-lg disabled:opacity-50"
        >
          <Printer className="w-4 h-4" />
          <span>{generatingPdf ? 'Membuat PDF...' : `Generate PDF (${selectedCodes.length} Barang)`}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Format Selector & Item Picker */}
        <div className="space-y-6">
          {/* Format Selector Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-[#174355] dark:text-brand-400 uppercase tracking-wider">
              1. Pilih Format Kertas Output
            </h2>

            <div className="space-y-3">
              <label
                onClick={() => setFormat('a4_3x8')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  format === 'a4_3x8'
                    ? 'border-[#174355] bg-[#eef5fa] dark:bg-brand-950/60 font-bold text-[#174355] dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p className="text-xs">Lembar A4 (Grid 3 × 8)</p>
                  <p className="text-[10px] text-slate-400 font-normal">24 label per halaman A4</p>
                </div>
                <Square className={`w-4 h-4 ${format === 'a4_3x8' ? 'fill-[#174355] text-[#174355]' : ''}`} />
              </label>

              <label
                onClick={() => setFormat('a4_4x10')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  format === 'a4_4x10'
                    ? 'border-[#174355] bg-[#eef5fa] dark:bg-brand-950/60 font-bold text-[#174355] dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p className="text-xs">Lembar A4 (Grid 4 × 10)</p>
                  <p className="text-[10px] text-slate-400 font-normal">40 label kecil per halaman A4</p>
                </div>
                <Square className={`w-4 h-4 ${format === 'a4_4x10' ? 'fill-[#174355] text-[#174355]' : ''}`} />
              </label>

              <label
                onClick={() => setFormat('thermal_50x30')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  format === 'thermal_50x30'
                    ? 'border-[#174355] bg-[#eef5fa] dark:bg-brand-950/60 font-bold text-[#174355] dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p className="text-xs">Printer Thermal (50 × 30 mm)</p>
                  <p className="text-[10px] text-slate-400 font-normal">1 label per halaman Roll Thermal</p>
                </div>
                <Square className={`w-4 h-4 ${format === 'thermal_50x30' ? 'fill-[#174355] text-[#174355]' : ''}`} />
              </label>
            </div>
          </div>

          {/* Item Selector Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#174355] dark:text-brand-400 uppercase tracking-wider">
                2. Pilih Barang ({selectedCodes.length}/{items.length})
              </h2>
              <button onClick={toggleSelectAll} className="text-xs text-[#174355] font-semibold hover:underline">
                {selectedCodes.length === items.length ? 'Batal Semua' : 'Pilih Semua'}
              </button>
            </div>

            {loading ? (
              <p className="text-xs text-slate-400">Memuat data barang...</p>
            ) : (
              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => {
                  const isChecked = selectedCodes.includes(item.code);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelectCode(item.code)}
                      className="pt-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-xs text-slate-900 dark:text-white leading-tight">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {item.code} • {item.location.name}
                        </p>
                      </div>
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#174355] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: PDF Preview Viewport */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-xs font-bold text-[#174355] dark:text-brand-400 uppercase tracking-wider">
                Pratinjau PDF Cetak Label
              </h2>

              {pdfBlobUrl && (
                <a
                  href={pdfBlobUrl}
                  download="label-inventaris-yta.pdf"
                  className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 font-bold hover:underline"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh PDF</span>
                </a>
              )}
            </div>

            {pdfBlobUrl ? (
              <iframe src={pdfBlobUrl} className="w-full h-[550px] rounded-2xl border border-slate-200 shadow-inner" />
            ) : (
              <div className="h-[450px] rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <FileText className="w-16 h-16 text-slate-300" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Pratinjau PDF Belum Dibuat</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Pilih format kertas dan barang di panel sebelah kiri, lalu tekan tombol <strong>Generate PDF</strong> untuk melihat pratinjau sebelum dicetak.
                </p>
                <button
                  onClick={handleGeneratePDF}
                  disabled={selectedCodes.length === 0}
                  className="mt-2 px-5 py-2.5 bg-[#174355] text-white rounded-full text-xs font-bold shadow"
                >
                  Generate Pratinjau PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LabelsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-500">Memuat modul cetak label...</div>}>
      <LabelsContent />
    </Suspense>
  );
}
