import { FormEvent, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { login } from '../store/slices/authSlice';
import { useRouter } from 'next/router';
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

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
    <div className="min-h-screen grid place-items-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="p-[2px] rounded-3xl bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-emerald-500/20 shadow-lg">
          <div className="rounded-3xl bg-white/85 backdrop-blur-sm p-8 ring-1 ring-black/5">
            <div className="text-center mb-6">
              <h2 className="inline-block text-3xl leading-[1.25] pb-0.5 font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-600 bg-clip-text text-transparent">
                Login
              </h2>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">Access your dashboard and continue managing orders.</p>
            </div>

            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-1">
                <label className="text-sm text-gray-700">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email"
                    className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition-shadow shadow-sm"
                  />
                </div>
              </div>
              <div className="grid gap-1">
                <label className="text-sm text-gray-700">Password</label>
                <div className="relative">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="password"
                    className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/70 transition-shadow shadow-sm"
                  />
                </div>
              </div>
              <button
                disabled={loading}
                type="submit"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 shadow-sm hover:shadow-md transition-all duration-300 hover:from-blue-600 hover:via-indigo-600 hover:to-green-600 active:scale-[.99] disabled:opacity-60"
              >
                {loading ? 'Logging in…' : 'Login'}
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </form>

            {error && <p className="text-red-600 mt-4 text-sm text-center">{error}</p>}
            {user && <p className="text-emerald-700 mt-4 text-sm text-center">Logged in as {user.name} ({user.role})</p>}
          </div>
        </div>
      </div>
    </div>
  );
}


