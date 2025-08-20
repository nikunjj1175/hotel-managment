import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppSelector } from '../store';
import { RequireRole } from '../components/RequireRole';
import Layout from '../components/Layout';
import { UserIcon, EnvelopeIcon, LockClosedIcon, ShieldCheckIcon, TrashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

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
    <Layout>
      <div className="mb-6 text-center md:text-left animate-fade-up" style={{ animationDelay: '20ms' }}>
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent text-glow">Super Admin</h1>
        <p className="mt-1 text-gray-500 animate-fade-up" style={{ animationDelay: '100ms' }}>Manage users and permissions</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Create User Card */}
        <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="p-[2px] rounded-2xl bg-gradient-to-br from-blue-400/20 via-indigo-400/10 to-emerald-400/20">
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.15)] ring-1 ring-black/5">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-lg">Create User</h3>
              </div>
              <div className="grid gap-3 max-w-md">
                <div className="relative">
                  <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    placeholder="Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="pl-10 w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition-shadow shadow-sm"
                  />
                </div>
                <div className="relative">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    placeholder="Email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="pl-10 w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/70 transition-shadow shadow-sm"
                  />
                </div>
                <div className="relative">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    placeholder="Password"
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="pl-10 w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/70 transition-shadow shadow-sm"
                  />
                </div>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as Role })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/70 bg-white shadow-sm"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="KITCHEN">Kitchen</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                <button
                  onClick={createUser}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[.99]"
                >
                  Create
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h3 className="font-semibold text-lg mb-3">Users</h3>
          {error && <p className="text-red-600 mb-2 animate-shake">{error}</p>}
          <div className="rounded-2xl overflow-hidden bg-white/80 backdrop-blur ring-1 ring-black/5 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.15)]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/70">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-700">{u.email}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-medium ring-1 ring-blue-200">{u.role}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 transition-colors" onClick={() => remove(u._id)}>
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No users yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
    </RequireRole>
  );
}


