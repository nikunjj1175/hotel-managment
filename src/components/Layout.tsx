import Link from 'next/link';
import { PropsWithChildren, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/slices/authSlice';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Layout({ title, children }: PropsWithChildren<{ title?: string }>) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-lg no-underline">Hotel Manager</Link>
            {user && (
              <nav className="hidden md:flex gap-4">
                {user.role === 'SUPER_ADMIN' && <Link href="/super-admin">Users</Link>}
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && <Link href="/admin">Dashboard</Link>}
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && <Link href="/admin/tables">Tables</Link>}
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && <Link href="/admin/menu">Menu</Link>}
                {(user.role === 'KITCHEN' || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && <Link href="/kitchen">Kitchen</Link>}
                {(user.role === 'DELIVERY' || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && <Link href="/delivery">Delivery</Link>}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-gray-600 hidden sm:inline">{user.name} ({user.role})</span>
                <button onClick={() => dispatch(logout())}>Logout</button>
              </>
            ) : (
              <Link href="/login">Login</Link>
            )}
            {user && (
              <button className="md:hidden" onClick={() => setOpen(o => !o)} aria-label="Toggle Menu">
                {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
        {user && open && (
          <div className="md:hidden border-t">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2">
              {user.role === 'SUPER_ADMIN' && <Link onClick={() => setOpen(false)} href="/super-admin">Users</Link>}
              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && <Link onClick={() => setOpen(false)} href="/admin">Dashboard</Link>}
              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && <Link onClick={() => setOpen(false)} href="/admin/tables">Tables</Link>}
              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && <Link onClick={() => setOpen(false)} href="/admin/menu">Menu</Link>}
              {(user.role === 'KITCHEN' || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && <Link onClick={() => setOpen(false)} href="/kitchen">Kitchen</Link>}
              {(user.role === 'DELIVERY' || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && <Link onClick={() => setOpen(false)} href="/delivery">Delivery</Link>}
            </div>
          </div>
        )}
      </header>
      <main className="px-4 py-6 max-w-6xl mx-auto">
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        {children}
      </main>
    </div>
  );
}


