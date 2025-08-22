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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="sticky top-0 z-50">
        {/* Main Header */}
        <div className="relative">
          {/* Modern Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900" />
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,211,238,0.1),transparent_50%)]" />
          </div>
          
          {/* Glassmorphism Overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
          
          {/* Subtle Drop Shadow */}
          <div className="absolute inset-0 shadow-2xl" />
          
          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            {/* Left Side - Logo */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Link href="/" className="block">
                  <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-1">
                    Hotel Manager
                  </h1>
                  {/* Enhanced Glowing Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 blur-2xl opacity-0 group-hover:opacity-40 transition-all duration-500 group-hover:scale-125" />
                  {/* Floating Particles Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute top-0 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="absolute top-2 right-1/4 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
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
                          className={`relative px-4 py-3 font-medium transition-all duration-300 overflow-hidden rounded-xl flex items-center gap-2 ${
                            active 
                              ? 'text-white font-semibold bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 backdrop-blur-sm' 
                              : 'text-white/90 hover:text-white hover:font-semibold hover:bg-white/10 hover:backdrop-blur-sm'
                          }`}
                        >
                          <IconComponent className={`w-5 h-5 transition-all duration-300 ${active ? 'text-blue-300' : 'text-white/70 group-hover:text-white'}`} />
                          {l.label}
                          
                          {/* Enhanced Gradient Underline */}
                          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full transition-all duration-300 origin-left ${
                            active || isHovered
                              ? 'scale-x-100' 
                              : 'scale-x-0'
                          } ${active ? 'shadow-[0_0_20px_rgba(34,211,238,0.6)]' : ''}`} />
                          
                          {/* Active State Enhanced Glow */}
                          {active && (
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-600/10 rounded-xl transition-all duration-500 ring-1 ring-cyan-400/30" />
                          )}
                          
                          {/* Hover Glow Effect */}
                          {!active && isHovered && (
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-blue-500/5 to-purple-600/5 rounded-xl transition-all duration-300" />
                          )}
                          
                          {/* Enhanced Shimmer Effect */}
                          {!active && isHovered && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 animate-pulse transition-opacity duration-500 transform -skew-x-12" />
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
                  {/* Enhanced User Profile Card */}
                  <div className="relative">
                    <button 
                      onClick={() => setMenuOpen(o => !o)} 
                      className="group flex items-center gap-3 rounded-2xl px-4 py-3 bg-white/10 backdrop-blur-xl ring-1 ring-white/20 hover:bg-white/20 hover:ring-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/25"
                    >
                      {/* Enhanced Animated Avatar */}
                      <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 text-white grid place-items-center text-lg font-bold shadow-lg transition-all duration-300 hover:scale-110 group-hover:rotate-3 animate-pulse">
                        {initials}
                        {/* Avatar Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                      </div>
                      
                      {/* User Info */}
                      <div className="hidden sm:flex items-center gap-3">
                        <span className="text-white font-semibold">{user.name}</span>
                        <span className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full ring-1 ring-blue-400/50 shadow-lg backdrop-blur-sm">
                          {user.role}
                        </span>
                        
                        {/* Enhanced Rotating Dropdown Icon */}
                        <div className={`text-blue-300 transition-all duration-300 ${menuOpen ? 'rotate-180' : ''} group-hover:text-white`}>
                          <ChevronDownIcon className="w-5 h-5" />
                        </div>
                      </div>
                    </button>

                    {/* Enhanced Dropdown Menu */}
                    {menuOpen && (
                      <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white/95 backdrop-blur-2xl ring-1 ring-white/20 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                        <div className="p-3">
                          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 hover:scale-105">
                            <UserCircleIcon className="w-5 h-5 text-blue-500" />
                            Profile
                          </Link>
                          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 hover:scale-105">
                            <Cog6ToothIcon className="w-5 h-5 text-indigo-500" />
                            Settings
                          </Link>
                          <div className="border-t border-gray-200 my-2" />
                          <button 
                            onClick={() => { setMenuOpen(false); dispatch(logout()); }} 
                            className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-200 hover:scale-105"
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Mobile Menu Button */}
                  <button 
                    className="lg:hidden p-3 rounded-2xl bg-white/10 backdrop-blur-xl ring-1 ring-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl"
                    onClick={() => setOpen(o => !o)} 
                    aria-label="Toggle Menu"
                  >
                    {open ? (
                      <XMarkIcon className="w-6 h-6 text-white transition-all duration-200" />
                    ) : (
                      <Bars3Icon className="w-6 h-6 text-white transition-all duration-200" />
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
            <div className="bg-gradient-to-b from-slate-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-2xl border-t border-white/10">
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
                          className={`flex items-center gap-3 px-4 py-4 font-medium transition-all duration-300 relative overflow-hidden rounded-2xl ${
                            active 
                              ? 'text-white font-semibold bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 backdrop-blur-sm' 
                              : 'text-white/90 hover:text-white hover:font-semibold hover:bg-white/10 hover:backdrop-blur-sm'
                          }`}
                        >
                          <IconComponent className={`w-6 h-6 ${active ? 'text-blue-300' : 'text-white/70'}`} />
                          {l.label}
                          
                          {/* Mobile Active State - Enhanced Left Border */}
                          {active && (
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 rounded-r-full shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
                          )}
                          
                          {/* Mobile Hover Effect */}
                          {!active && (
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400/50 via-blue-500/50 to-purple-600/50 rounded-r-full opacity-0 group-hover:opacity-100 transition-all duration-300" />
                          )}
                        </Link>
                      </div>
                    );
                  })}
                </div>
                
                {/* Enhanced Mobile User Info */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 backdrop-blur-xl ring-1 ring-white/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 text-white grid place-items-center text-lg font-bold animate-pulse">
                      {initials}
                    </div>
                    <span className="text-white font-medium">{user.name}</span>
                  </div>
                  <button 
                    onClick={() => dispatch(logout())} 
                    className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-red-500/25 flex items-center gap-2"
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
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              {title}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full" />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}


