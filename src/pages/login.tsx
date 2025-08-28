import { FormEvent, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { login } from '../store/slices/authSlice';
import { useRouter } from 'next/router';
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Role, getPortalPath } from '../utils/roles';

export default function Login() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, user } = useAppSelector(s => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const target = useMemo(() => (router.query.target as string) as Role | undefined, [router.query.target]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await dispatch(login({ email, password }));
    if ((res as any).meta.requestStatus === 'fulfilled') {
      // After successful login, always go to cards screen
      router.push('/');
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
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">Access your dashboard and continue managing operations.</p>
              {target && (
                <p className="mt-2 text-xs text-gray-600">You are logging in for <strong>{target.replace('_',' ')}</strong> access.</p>
              )}
              
            </div>

            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-1">
                <label className="text-sm text-gray-700">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="h-5 w-5 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email"
                    className="pl-10 w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-400"
                  />
                </div>
              </div>
              <div className="grid gap-1">
                <label className="text-sm text-gray-700">Password</label>
                <div className="relative">
                  <LockClosedIcon className="h-5 w-5 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="password"
                    className="pl-10 w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:border-gray-400"
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


