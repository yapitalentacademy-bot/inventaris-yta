'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, Key, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError('Terjadi kesalahan saat masuk');
      setLoading(false);
    }
  };

  const setDemoAccount = (role: 'admin' | 'petugas' | 'pimpinan') => {
    if (role === 'admin') {
      setEmail('admin@yta.ac.id');
      setPassword('admin123');
    } else if (role === 'petugas') {
      setEmail('petugas@yta.ac.id');
      setPassword('petugas123');
    } else {
      setEmail('pimpinan@yta.ac.id');
      setPassword('pimpinan123');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-brand-900 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto shadow-lg border-2 border-brand-700">
            YTA
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Inventaris YTA
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            PT YAPI Talent Academy — Sistem Kelola Inventaris & QR Code
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xl">
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yta.ac.id"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Proses Masuk...' : 'Masuk ke Aplikasi'}</span>
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
              Akses Cepat Pengujian (Demo)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount('admin')}
                className="px-2 py-1.5 rounded-lg border border-brand-200 dark:border-brand-900 bg-brand-50 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300 text-[11px] font-bold hover:bg-brand-100 transition-colors text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('petugas')}
                className="px-2 py-1.5 rounded-lg border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 text-[11px] font-bold hover:bg-sky-100 transition-colors text-center"
              >
                Petugas
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('pimpinan')}
                className="px-2 py-1.5 rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 text-[11px] font-bold hover:bg-purple-100 transition-colors text-center"
              >
                Pimpinan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
