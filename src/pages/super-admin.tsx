import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppSelector } from '../store';
import { RequireRole } from '../components/RequireRole';
import Layout from '../components/Layout';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'KITCHEN' | 'DELIVERY';

export default function SuperAdminPage() {
  const { token, user } = useAppSelector(s => s.auth);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ADMIN' as Role });
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (user?.role === 'SUPER_ADMIN') {
      load();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const load = async () => {
    try {
      const res = await axios.get(`/api/users`);
      setUsers(res.data);
      setError('');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load users');
      setUsers([]);
    }
  };

  const createUser = async () => {
    await axios.post(`/api/users`, form);
    setForm({ name: '', email: '', password: '', role: 'ADMIN' });
    load();
  };

  const remove = async (id: string) => {
    await axios.delete(`/api/users/${id}`);
    load();
  };

  return (
    <RequireRole allow={["SUPER_ADMIN"] as any}>
    <Layout title="Super Admin">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded bg-white p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Create User</h3>
          <div className="grid gap-2 max-w-md">
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })}>
              <option value="ADMIN">Admin</option>
              <option value="KITCHEN">Kitchen</option>
              <option value="DELIVERY">Delivery</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <button onClick={createUser}>Create</button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Users</h3>
          {error && <p className="text-red-600">{error}</p>}
          <ul className="space-y-2">
            {users.map(u => (
              <li key={u._id} className="border rounded bg-white p-3 shadow-sm flex items-center justify-between">
                <span>{u.name} — {u.email} — {u.role}</span>
                <button className="bg-red-600 hover:bg-red-700" onClick={() => remove(u._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
    </RequireRole>
  );
}


