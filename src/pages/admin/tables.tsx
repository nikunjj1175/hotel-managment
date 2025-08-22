import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAppSelector } from '../../store';
import { RequireRole } from '../../components/RequireRole';
import Layout from '../../components/Layout';
import { HashtagIcon, LinkIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Table { _id: string; tableNumber: number; slug: string; isActive: boolean }

export default function AdminTablesPage() {
  const { token, hydrated } = useAppSelector(s => s.auth);
  const [tables, setTables] = useState<Table[]>([]);
  const [form, setForm] = useState({ tableNumber: 0, slug: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && token) {
      // Set the authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      load();
    }
  }, [hydrated, token]);

  const load = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/tables`);
      setTables(res.data);
    } catch (err: any) {
      console.error('Error loading tables:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load tables');
      }
    } finally {
      setLoading(false);
    }
  };

  const createTable = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setError(null);
      await axios.post(`/api/tables`, form);
      setForm({ tableNumber: 0, slug: '' });
      load();
    } catch (err: any) {
      console.error('Error creating table:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to create table');
      }
    }
  };

  // Don't render until auth is hydrated
  if (!hydrated) {
    return (
      <Layout title="Tables & QR">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error if no token
  if (!token) {
    return (
      <Layout title="Tables & QR">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">🔒 Authentication Required</div>
            <p className="text-gray-600 mb-4">You need to be logged in to access this page.</p>
            <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Go to Login
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <RequireRole allow={["ADMIN","SUPER_ADMIN"] as any}>
      <Layout title="Tables & QR">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 font-medium">Error: {error}</div>
            <button 
              onClick={() => setError(null)} 
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div className="grid gap-8 lg:grid-cols-[400px,1fr]">
          {/* Create Table Card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur p-6 ring-1 ring-black/5 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.15)]">
            <h3 className="font-semibold mb-4 text-slate-800 text-lg">Create Table</h3>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <HashtagIcon className="h-5 w-5 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                <input 
                  type="number" 
                  placeholder="Table Number" 
                  value={form.tableNumber || ''} 
                  onChange={e => setForm({ ...form, tableNumber: Number(e.target.value) })} 
                  className="pl-10 w-full px-3 py-2.5 rounded-xl bg-white/90 text-slate-900 placeholder-gray-500 ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:ring-gray-400"
                />
              </div>
              <div className="relative">
                <LinkIcon className="h-5 w-5 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                <input 
                  placeholder="Slug (e.g. table-9)" 
                  value={form.slug} 
                  onChange={e => setForm({ ...form, slug: e.target.value })} 
                  className="pl-10 w-full px-3 py-2.5 rounded-xl bg-white/90 text-slate-900 placeholder-gray-500 ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:ring-gray-400"
                />
              </div>
              <button 
                onClick={createTable} 
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[.99] font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <PlusIcon className="h-5 w-5" />
                {loading ? 'Creating...' : 'Create Table'}
              </button>
            </div>
          </div>
          
          {/* Existing Tables Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-gray-800">Existing Tables</h3>
              <button 
                onClick={load} 
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className="h-4 w-4" />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading tables...</p>
                </div>
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tables found. Create your first table above.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {tables.map(t => (
                  <div key={t._id} className="rounded-2xl bg-white/90 p-5 ring-1 ring-black/5 shadow-sm hover:shadow-md transition-all animate-fade-up">
                    <div className="font-semibold text-gray-900 mb-1">Table #{t.tableNumber}</div>
                    <div className="text-gray-600 mb-3">Slug: {t.slug}</div>
                    <div className="mb-3 flex justify-center">
                      <img src={`/api/tables/${t._id}/qr`} alt="QR" width={180} height={180} className="rounded-lg" />
                    </div>
                    <div className="flex justify-center">
                      <Link href={`/table/${t.slug}`} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200">
                        <LinkIcon className="h-4 w-4" />
                        Open Link
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </RequireRole>
  );
}


