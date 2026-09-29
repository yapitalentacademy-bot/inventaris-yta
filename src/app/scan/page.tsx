'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ScanPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    startCameraScanner();
    return () => {
      stopCameraScanner();
    };
  }, []);

  const startCameraScanner = async () => {
    try {
      setErrorMsg(null);
      setScanning(true);

      const html5QrCode = new Html5Qrcode('full-camera-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 280 },
        },
        (decodedText) => {
          stopCameraScanner();

          if (decodedText.includes('/b/')) {
            const parts = decodedText.split('/b/');
            const itemCode = parts[parts.length - 1];
            router.push(`/items/${encodeURIComponent(itemCode)}`);
          } else if (decodedText.includes('-BRG-YTA')) {
            router.push(`/items/${encodeURIComponent(decodedText.trim())}`);
          } else {
            router.push(`/items?q=${encodeURIComponent(decodedText.trim())}`);
          }
        },
        () => {}
      );
    } catch (err) {
      console.error('Error opening scanner:', err);
      setErrorMsg('Gagal mengakses kamera smartphone. Izinkan akses kamera pada browser Anda.');
      setScanning(false);
    }
  };

  const stopCameraScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear();
          setScanning(false);
        })
        .catch(console.error);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          href="/"
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Pindai QR / Barcode</h1>
          <p className="text-xs text-slate-500">Arahkan kamera ke label QR barang YTA atau barcode pabrik</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xl overflow-hidden text-center">
        {errorMsg ? (
          <div className="py-12 px-4 space-y-4">
            <AlertCircle className="w-14 h-14 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{errorMsg}</p>
            <button
              onClick={startCameraScanner}
              className="inline-flex items-center space-x-2 bg-brand-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Coba Buka Kamera Lagi</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div id="full-camera-reader" className="w-full rounded-2xl overflow-hidden min-h-[320px] bg-slate-950" />
            <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs text-slate-600 dark:text-slate-300">
              💡 Kamera aktif otomatis membaca QR Code label atau barcode produk
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
