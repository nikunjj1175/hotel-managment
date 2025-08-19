import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../store';
import { RequireRole } from '../../components/RequireRole';
import Layout from '../../components/Layout';

interface MenuItem { _id: string; name: string; price: number; category?: string; isAvailable: boolean }
 
export default function AdminMenuPage() {
  const { token } = useAppSelector(s => s.auth);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState({ name: '', price: 0, category: '', isAvailable: true });

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    load();
  }, [token]);

  const load = async () => {
    const res = await axios.get(`/api/menu`);
    setItems(res.data);
  };

  const createItem = async () => {
    await toast.promise(
      axios.post(`/api/menu`, form),
      { loading: 'Creating...', success: 'Item created', error: 'Failed to create' }
    );
    setForm({ name: '', price: 0, category: '', isAvailable: true });
    load();
  };

  const updateItem = async (id: string, payload: Partial<MenuItem>) => {
    await toast.promise(
      axios.put(`/api/menu/${id}`, payload),
      { loading: 'Updating...', success: 'Item updated', error: 'Failed to update' }
    );
    load();
  };

  const removeItem = async (id: string) => {
    await toast.promise(
      axios.delete(`/api/menu/${id}`),
      { loading: 'Deleting...', success: 'Item deleted', error: 'Failed to delete' }
    );
    load();
  };

  return (
    <RequireRole allow={["ADMIN","SUPER_ADMIN"] as any}>
      <Layout title="Manage Menu">
        <div className="grid gap-4">
          <div className="border rounded bg-white p-4 shadow-sm">
            <h3 className="font-semibold mb-2">Create Item</h3>
            <div className="flex flex-wrap gap-2">
              <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="w-32" type="number" placeholder="Price" value={form.price || 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
              <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} /> Available
              </label>
              <button onClick={createItem}>Create</button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Items</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map(mi => (
                <div key={mi._id} className="border rounded bg-white p-3 shadow-sm">
                  <div className="flex justify-between">
                    <b>{mi.name}</b>
                    <span>₹{mi.price}</span>
                  </div>
                  <div className="text-gray-600">{mi.category || '—'}</div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button onClick={() => updateItem(mi._id, { isAvailable: !mi.isAvailable })}>{mi.isAvailable ? 'Mark Unavailable' : 'Mark Available'}</button>
                    <button onClick={() => removeItem(mi._id)} className="bg-red-600 hover:bg-red-700">Delete</button>
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


