import { FormEvent, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { login } from '../store/slices/authSlice';
import { useRouter } from 'next/router';

export default function Login() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, user } = useAppSelector(s => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await dispatch(login({ email, password }));
    if ((res as any).meta.requestStatus === 'fulfilled') {
      const role = (res as any).payload.user.role;
      if (role === 'SUPER_ADMIN') router.push('/super-admin');
      else if (role === 'KITCHEN') router.push('/kitchen');
      else if (role === 'DELIVERY') router.push('/delivery');
      else router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-sm border rounded bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm text-gray-700">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-gray-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
          </div>
          <button disabled={loading} type="submit">Login</button>
        </form>
        {error && <p className="text-red-600 mt-3">{error}</p>}
        {user && <p className="text-green-700 mt-3">Logged in as {user.name} ({user.role})</p>}
      </div>
    </div>
  );
}


