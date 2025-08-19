import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAppSelector } from '../../store';
import { RequireRole } from '../../components/RequireRole';
import Layout from '../../components/Layout';

interface Table { _id: string; tableNumber: number; slug: string; isActive: boolean }

export default function AdminTablesPage() {
  const { token } = useAppSelector(s => s.auth);
  const [tables, setTables] = useState<Table[]>([]);
  const [form, setForm] = useState({ tableNumber: 0, slug: '' });

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const load = async () => {
    const res = await axios.get(`/api/tables`);
    setTables(res.data);
  };

  const createTable = async () => {
    await axios.post(`/api/tables`, form);
    setForm({ tableNumber: 0, slug: '' });
    load();
  };

  return (
    <RequireRole allow={["ADMIN","SUPER_ADMIN"] as any}>
    <Layout title="Tables & QR">
      <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
        <div className="border rounded bg-white p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Create Table</h3>
          <div className="flex flex-col gap-2">
            <input type="number" placeholder="Table Number" value={form.tableNumber || ''} onChange={e => setForm({ ...form, tableNumber: Number(e.target.value) })} />
            <input placeholder="Slug (e.g. table-9)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
            <button onClick={createTable}>Create</button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Existing Tables</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {tables.map(t => (
              <div key={t._id} className="border rounded bg-white p-3 shadow-sm">
                <div className="font-semibold">Table #{t.tableNumber}</div>
                <div className="text-gray-600">Slug: {t.slug}</div>
                <div className="mt-2">
                  <img src={`/api/tables/${t._id}/qr`} alt="QR" width={200} height={200} />
                </div>
                <div className="mt-2">
                  <Link href={`/table/${t.slug}`}>Open Link</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
    </RequireRole>
  );
}


