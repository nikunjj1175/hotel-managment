import Link from 'next/link';
import { PropsWithChildren, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/slices/authSlice';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  HomeIcon,
  UsersIcon,
  TableCellsIcon,
  ClipboardDocumentListIcon,
  FireIcon,
  TruckIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

export default function Layout({ title, children }: PropsWithChildren<{ title?: string }>) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const router = useRouter();

  const links = useMemo(() => {
    if (!user) return [] as { href: string; label: string; icon: any; roles?: string[] }[];
    const allow = (roles?: string[]) => !roles || roles.includes(user.role);
    const all = [
      { href: '/super-admin', label: 'Users', icon: UsersIcon, roles: ['SUPER_ADMIN'] },
      { href: '/admin', label: 'Dashboard', icon: HomeIcon, roles: ['ADMIN', 'SUPER_ADMIN'] },
      { href: '/admin/tables', label: 'Tables', icon: TableCellsIcon, roles: ['ADMIN', 'SUPER_ADMIN'] },
      { href: '/admin/menu', label: 'Menu', icon: ClipboardDocumentListIcon, roles: ['ADMIN', 'SUPER_ADMIN'] },
      { href: '/kitchen', label: 'Kitchen', icon: FireIcon, roles: ['KITCHEN', 'SUPER_ADMIN', 'ADMIN'] },
      { href: '/delivery', label: 'Delivery', icon: TruckIcon, roles: ['DELIVERY', 'SUPER_ADMIN', 'ADMIN'] },
    ];
    return all.filter(l => allow(l.roles));
  }, [user]);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'U';
  
  // Improved active state detection - only one item can be active
  const isActiveLink = (href: string) => {
    if (href === '/admin') {
      return router.pathname === '/admin';
    }
    if (href === '/super-admin') {
      return router.pathname === '/super-admin';
    }
    if (href === '/admin/tables') {
      return router.pathname === '/admin/tables';
    }
    if (href === '/admin/menu') {
      return router.pathname === '/admin/menu';
    }
    if (href === '/kitchen') {
      return router.pathname === '/kitchen';
    }
    if (href === '/delivery') {
      return router.pathname === '/delivery';
    }
    return router.pathname.startsWith(href);
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50">
        {/* Main Header */}
        <div className="relative bg-white border-b border-slate-200/80 shadow-sm">
          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            {/* Left Side - Logo */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Link href="/" className="block">
                  <h1 className="text-2xl font-extrabold text-slate-800 relative z-10 transition-all duration-300 group-hover:scale-[1.02]">
                    Hotel Manager
                  </h1>
                  
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              {user && (
                <nav className="hidden lg:flex items-center gap-2">
                  {links.map((l, index) => {
                    const active = isActiveLink(l.href);
                    const isHovered = hoveredItem === l.href;
                    const IconComponent = l.icon;
                    
                    return (
                      <div
                        key={l.href}
                        className="relative group"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onMouseEnter={() => setHoveredItem(l.href)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <Link
                          href={l.href}
                          className={`relative px-4 py-2.5 font-medium transition-all duration-200 overflow-hidden rounded-xl flex items-center gap-2 ${
                            active 
                              ? 'text-blue-600 bg-blue-50 ring-1 ring-blue-100' 
                              : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                          }`}
                        >
                          <IconComponent className={`w-5 h-5 transition-all duration-200 ${active ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} />
                          {l.label}
                          {active && (
                            <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-blue-400 rounded-full" />
                          )}
                        </Link>
                      </div>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Right Side - User Profile */}
            <div className="flex items-center gap-4">
              {!user && (
                <div className="transition-all duration-300 hover:scale-105 active:scale-95">
                  <Link href="/login" className="px-6 py-3 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/25 flex items-center gap-2">
                    <UserCircleIcon className="w-5 h-5" />
                    Login
                  </Link>
                </div>
              )}
              
              {user && (
                <>
                  {/* User Profile Card */}
                  <div className="relative">
                    <button 
                      onClick={() => setMenuOpen(o => !o)} 
                      className="group flex items-center gap-3 rounded-2xl px-4 py-2.5 bg-white ring-1 ring-blue-100 hover:ring-blue-200 shadow-sm hover:shadow transition-all duration-200"
                    >
                      {/* Avatar */}
                      <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-400 text-white grid place-items-center text-sm font-bold shadow-sm">
                        {initials}
                      </div>
                      
                      {/* User Info */}
                      <div className="hidden sm:flex items-center gap-3">
                        <span className="text-slate-800 font-semibold">{user.name}</span>
                        <span className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full ring-1 ring-blue-100">
                          {user.role}
                        </span>
                        
                        <div className={`text-slate-500 transition-all duration-200 ${menuOpen ? 'rotate-180' : ''} group-hover:text-blue-600`}>
                          <ChevronDownIcon className="w-5 h-5" />
                        </div>
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen && (
                      <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white ring-1 ring-slate-200 shadow-lg animate-in slide-in-from-top-2 duration-200">
                        <div className="p-3">
                          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 rounded-xl transition-colors duration-150">
                            <UserCircleIcon className="w-5 h-5 text-blue-500" />
                            Profile
                          </Link>
                          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 rounded-xl transition-colors duration-150">
                            <Cog6ToothIcon className="w-5 h-5 text-indigo-500" />
                            Settings
                          </Link>
                          <div className="border-t border-gray-200 my-2" />
                          <button 
                            onClick={() => { setMenuOpen(false); dispatch(logout()); router.push('/login'); }} 
                            className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-150"
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Menu Button */}
                  <button 
                    className="lg:hidden p-3 rounded-2xl bg-white ring-1 ring-slate-200 hover:ring-slate-300 transition-all duration-200 hover:shadow"
                    onClick={() => setOpen(o => !o)} 
                    aria-label="Toggle Menu"
                  >
                    {open ? (
                      <XMarkIcon className="w-6 h-6 text-slate-700 transition-all duration-200" />
                    ) : (
                      <Bars3Icon className="w-6 h-6 text-slate-700 transition-all duration-200" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Drawer */}
        {user && open && (
          <div className="lg:hidden overflow-hidden transition-all duration-500 ease-in-out">
            <div className="bg-white border-t border-slate-200">
              <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-3 mb-6">
                  {links.map((l, index) => {
                    const active = isActiveLink(l.href);
                    const IconComponent = l.icon;
                    return (
                      <div
                        key={l.href}
                        className="relative group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <Link 
                          onClick={() => setOpen(false)} 
                          href={l.href} 
                          className={`flex items-center gap-3 px-4 py-3 font-medium transition-all duration-200 relative overflow-hidden rounded-xl ${
                            active 
                              ? 'text-blue-600 bg-blue-50 ring-1 ring-blue-100' 
                              : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                          }`}
                        >
                          <IconComponent className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-500'}`} />
                          {l.label}
                        </Link>
                      </div>
                    );
                  })}
                </div>
                
                {/* Mobile User Info */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white ring-1 ring-slate-200 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-400 text-white grid place-items-center text-sm font-bold">
                      {initials}
                    </div>
                    <span className="text-slate-800 font-medium">{user.name}</span>
                  </div>
                  <button 
                    onClick={() => { dispatch(logout()); router.push('/login'); }} 
                    className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      
      <main className="px-4 py-8 max-w-7xl mx-auto">
        {title && (
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold text-slate-800 mb-2">
              {title}
            </h2>
            <div className="w-24 h-1 bg-blue-400/60 mx-auto rounded-full" />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}


