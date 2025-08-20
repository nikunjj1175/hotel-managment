import Link from 'next/link';
import { PropsWithChildren, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/slices/authSlice';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

export default function Layout({ title, children }: PropsWithChildren<{ title?: string }>) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const links = useMemo(() => {
    if (!user) return [] as { href: string; label: string; roles?: string[] }[];
    const allow = (roles?: string[]) => !roles || roles.includes(user.role);
    const all = [
      { href: '/super-admin', label: 'Users', roles: ['SUPER_ADMIN'] },
      { href: '/admin', label: 'Dashboard', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { href: '/admin/tables', label: 'Tables', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { href: '/admin/menu', label: 'Menu', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { href: '/kitchen', label: 'Kitchen', roles: ['KITCHEN', 'SUPER_ADMIN', 'ADMIN'] },
      { href: '/delivery', label: 'Delivery', roles: ['DELIVERY', 'SUPER_ADMIN', 'ADMIN'] },
    ];
    return all.filter(l => allow(l.roles));
  }, [user]);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'U';
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b shadow-md bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800 text-white/90 backdrop-blur supports-[backdrop-filter]:bg-opacity-90">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-lg no-underline">Hotel Manager</Link>
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {links.map(l => {
                  const active = router.pathname.startsWith(l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`relative rounded-lg px-3 py-2 no-underline transition-colors ${active ? 'text-white bg-white/10 ring-1 ring-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                    >
                      {l.label}
                      {active && <span className="absolute inset-x-1 -bottom-0.5 h-0.5 rounded-full active-underline" />}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!user && <Link href="/login">Login</Link>}
            {user && (
              <>
                <div className="relative">
                  <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/10 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 text-white grid place-items-center text-sm font-semibold">
                      {initials}
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-sm text-white font-medium">{user.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 text-white ring-1 ring-white/20">{user.role}</span>
                      <ChevronDownIcon className="w-4 h-4 text-white/80" />
                    </div>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white/95 backdrop-blur ring-1 ring-black/5 shadow-lg animate-fade-up" style={{ animationDelay: '0ms' }}>
                      <div className="py-1">
                        <Link href="#" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                        <Link href="#" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</Link>
                        <button onClick={() => { setMenuOpen(false); dispatch(logout()); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                      </div>
                    </div>
                  )}
                </div>
                <button className="md:hidden" onClick={() => setOpen(o => !o)} aria-label="Toggle Menu">
                  {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                </button>
              </>
            )}
          </div>
        </div>
        {user && open && (
          <div className="md:hidden border-t bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800 text-white/90 backdrop-blur">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2">
              {links.map(l => (
                <Link key={l.href} onClick={() => setOpen(false)} href={l.href} className={`px-2 py-2 rounded-md ${router.pathname.startsWith(l.href) ? 'bg-white/15 text-white' : 'hover:bg-white/10'}`}>{l.label}</Link>
              ))}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 text-white grid place-items-center text-sm font-semibold">{initials}</div>
                  <span className="text-sm text-white">{user.name}</span>
                </div>
                <button onClick={() => dispatch(logout())} className="px-3 py-1.5 rounded-md bg-red-600 text-white">Logout</button>
              </div>
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


