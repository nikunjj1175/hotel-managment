import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAppSelector } from '../../store';
import { RequireRole } from '../../components/RequireRole';
import Layout from '../../components/Layout';
import { HashtagIcon, LinkIcon, PlusIcon, ArrowPathIcon, EllipsisHorizontalIcon, CheckCircleIcon, XCircleIcon, QrCodeIcon } from '@heroicons/react/24/outline';

interface Table { _id: string; tableNumber: number; slug: string; isActive: boolean }

export default function AdminTablesPage() {
  const { token, hydrated, user } = useAppSelector(s => s.auth);
  const [tables, setTables] = useState<Table[]>([]);
  const [form, setForm] = useState({ tableNumber: 0, slug: '', cafeId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    if (token) return token;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed?.token as string;
        }
      } catch {}
    }
    return undefined;
  };

  useEffect(() => {
    if (hydrated && token) {
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
      const bearer = getAuthToken();
      const res = await axios.get('/api/tables', {
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined
      });
      setTables(res.data as Table[]);
    } catch (err: any) {
      console.error('Error loading tables:', err);
      setError(err?.response?.data?.message || 'Failed to load tables');
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
      const cafeIdFromUser = (user as any)?.cafeId as string | undefined;
      const finalCafeId = form.cafeId?.trim() || cafeIdFromUser;
      if (!finalCafeId) {
        setError('Cafe ID is required to create a table');
        return;
      }
      const payload = {
        tableNumber: form.tableNumber,
        slug: form.slug || `table-${form.tableNumber}`,
        isActive: true,
        cafeId: finalCafeId,
      } as any;
      const bearer = getAuthToken();
      const res = await axios.post('/api/tables', payload, {
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined
      });
      setTables(prev => [...prev, res.data as Table]);
      setForm({ tableNumber: 0, slug: '', cafeId: '' });
    } catch (err: any) {
      console.error('Error creating table:', err);
      setError(err?.response?.data?.message || 'Failed to create table');
    }
  };

  // NO MORE LOADING CHECKS - UI SHOWS IMMEDIATELY

  return (
    <RequireRole allow={['CAFE_ADMIN','SUPER_ADMIN']}>
    <Layout title="Tables & QR">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
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
            <div className="rounded-2xl bg-white shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Create Table</h3>
              <div className="space-y-4">
                <div className="relative">
                  <HashtagIcon className="h-5 w-5 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                  <input 
                    type="number" 
                    placeholder="Table Number" 
                    value={form.tableNumber || ''} 
                    onChange={e => setForm({ ...form, tableNumber: Number(e.target.value) })} 
                    className="pl-10 w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="relative">
                  <LinkIcon className="h-5 w-5 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                  <input 
                    placeholder="Cafe ID (required if not linked)" 
                    value={form.cafeId} 
                    onChange={e => setForm({ ...form, cafeId: e.target.value })} 
                    className="pl-10 w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
                <div className="relative">
                  <LinkIcon className="h-5 w-5 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                  <input 
                    placeholder="Slug (e.g. table-9)" 
                    value={form.slug} 
                    onChange={e => setForm({ ...form, slug: e.target.value })} 
                    className="pl-10 w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
                <button 
                  onClick={createTable} 
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-3 px-4 text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[.99] font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <PlusIcon className="h-5 w-5" />
                  {loading ? 'Creating...' : 'Create Table'}
                </button>
              </div>
            </div>
            
            {/* Existing Tables Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Existing Tables</h3>
                <button
                  onClick={load}
                  disabled={loading}
                  title="Refresh tables"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Refresh</span>
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
                <div className="text-center py-12 text-gray-500">
                  <QrCodeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-lg">No tables found. Create your first table above.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                  {tables.map(t => (
                    <div key={t._id} className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex flex-col h-full">
                      {/* Header with title and status */}
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">Table #{t.tableNumber}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          t.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {t.isActive ? <CheckCircleIcon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                          {t.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {/* Slug */}
                      <p className="text-sm text-gray-500 mb-4">Slug: {t.slug}</p>
                      
                      {/* QR Code */}
                      <div className="mb-4 flex justify-center">
                        <img
                          src={`/api/tables/${t._id}/qr`}
                          alt={`QR for table ${t.tableNumber}`}
                          className="w-32 h-32 rounded-lg border border-gray-200 bg-white"
                        />
                      </div>
                      
                      {/* Action Buttons - compact side-by-side */}
                      <div className="mt-auto">
                        <div className="flex gap-2">
                          <Link 
                            href={`/table/${t.slug}`} 
                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            <LinkIcon className="h-4 w-4" />
                            Open Link
                          </Link>
                          <a
                            href={`/api/tables/${t._id}/qr`}
                            download={`table-${t.tableNumber}-qr.png`}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm text-center"
                          >
                            <EllipsisHorizontalIcon className="h-4 w-4" />
                            Download QR
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </RequireRole>
  );
}


