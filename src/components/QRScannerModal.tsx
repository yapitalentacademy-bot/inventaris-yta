'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Camera, RefreshCw, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const router = RouterHook();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setErrorMsg(null);
      setScanning(true);

      const html5QrCode = new Html5Qrcode('qr-reader-container');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success Callback
          stopScanner();
          onClose();

          // Handle scanned URL or item code string
          if (decodedText.includes('/b/')) {
            const parts = decodedText.split('/b/');
            const itemCode = parts[parts.length - 1];
            router.push(`/items/${encodeURIComponent(itemCode)}`);
          } else if (decodedText.includes('-BRG-YTA')) {
            router.push(`/items/${encodeURIComponent(decodedText.trim())}`);
          } else {
            // Direct decoded text navigation
            router.push(`/items?q=${encodeURIComponent(decodedText.trim())}`);
          }
        },
        (errorMessage) => {
          // Ignore frequent scan frame noise errors
        }
      );
    } catch (err: any) {
      console.error('Error starting camera scanner:', err);
      setErrorMsg('Gagal mengakses kamera HP. Pastikan izin kamera telah diberikan di browser Anda.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear();
          setScanning(false);
        })
        .catch((err) => console.error('Error stopping scanner:', err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-700 relative">
        {/* Header */}
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <h3 className="font-bold text-base">Pindai QR / Barcode</h3>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-brand-800 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Camera Container */}
        <div className="p-4 flex flex-col items-center justify-center">
          {errorMsg ? (
            <div className="py-8 px-4 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{errorMsg}</p>
              <button
                onClick={startScanner}
                className="inline-flex items-center space-x-2 bg-brand-800 text-white px-4 py-2 rounded-xl text-xs font-semibold"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
            </div>
          ) : (
            <div className="w-full relative">
              <div id="qr-reader-container" className="w-full rounded-2xl overflow-hidden min-h-[280px] bg-slate-950" />
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-3">
                Arahkan kamera ke QR Code label atau barcode pabrik.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RouterHook() {
  return useRouter();
}
