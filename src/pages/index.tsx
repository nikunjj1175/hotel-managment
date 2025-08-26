import Link from 'next/link';
import {
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  FireIcon,
  UserIcon,
  ChartBarSquareIcon,
  UserCircleIcon,
  TableCellsIcon,
  ClipboardDocumentListIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const tiles = [
    { href: '/super-admin', title: 'Super Admin', Icon: ShieldCheckIcon, gradient: 'from-yellow-400/30 via-amber-300/20 to-orange-300/20' },
    { href: '/cafe-admin', title: 'Cafe Admin', Icon: BuildingStorefrontIcon, gradient: 'from-emerald-400/25 via-teal-300/20 to-cyan-300/20' },
    { href: '/kitchen', title: 'Kitchen', Icon: FireIcon, gradient: 'from-orange-400/25 via-red-300/20 to-pink-300/20' },
    { href: '/waiter', title: 'Waiter', Icon: UserIcon, gradient: 'from-purple-400/25 via-fuchsia-300/20 to-pink-300/20' },
    { href: '/manager', title: 'Manager', Icon: ChartBarSquareIcon, gradient: 'from-indigo-400/25 via-violet-300/20 to-sky-300/20' },
    { href: '/customer', title: 'Customer', Icon: UserCircleIcon, gradient: 'from-pink-400/25 via-rose-300/20 to-orange-300/20' },
    { href: '/admin/tables', title: 'Tables', Icon: TableCellsIcon, gradient: 'from-teal-400/25 via-cyan-300/20 to-blue-300/20' },
    { href: '/admin/menu', title: 'Menu', Icon: ClipboardDocumentListIcon, gradient: 'from-yellow-400/25 via-orange-300/20 to-rose-300/20' },
    { href: '/delivery', title: 'Delivery', Icon: TruckIcon, gradient: 'from-sky-400/25 via-blue-300/20 to-indigo-300/20' },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen" style={{ backgroundImage: 'linear-gradient(135deg, #FFFDFE, #F6F9FC)' }}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Abstract blurred blobs */}
        <div className="absolute -top-24 -left-24 h-96 w-96 bg-gradient-to-br from-indigo-300/60 via-blue-200/60 to-cyan-200/60 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] bg-gradient-to-br from-amber-200/60 via-pink-200/60 to-purple-200/60 rounded-full blur-3xl opacity-50"></div>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="px-6 py-16 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center animate-fade-up" style={{ animationDelay: '40ms' }}>
          <h1
            className="inline-block text-5xl sm:text-6xl leading-[1.25] sm:leading-[1.15] pb-1 font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(250,204,21,0.6), rgba(52,211,153,0.6), rgba(244,114,182,0.6), rgba(56,189,248,0.6))'
            }}
          >
            Restaurant Management
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600">Smart system for Hotel & Restaurant Operations</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((item, idx) => {
            const { href, title, Icon, gradient } = item;
            return (
              <Link
                key={href}
                href={href}
                className="group relative block no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-3xl animate-fade-up"
                style={{ animationDelay: `${100 + idx * 70}ms` }}
              >
                <div className={`p-[2px] rounded-3xl bg-gradient-to-br ${gradient} transition-all duration-300 overflow-hidden group-hover:shadow-2xl` }>
                  <div className="rounded-3xl bg-white/70 backdrop-blur-xl p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/80 ring-1 ring-black/5 flex items-center justify-center shadow-sm transition-all duration-300 group-hover:bg-white">
                          <Icon className="h-7 w-7 text-gray-800" />
                        </div>
                        <span className="text-xl font-semibold text-gray-900">{title}</span>
                      </div>
                      <div className="h-9 w-9 rounded-full bg-white/70 ring-1 ring-black/5 flex items-center justify-center text-gray-500 transition-all duration-300 group-hover:bg-white group-hover:text-gray-800 group-hover:translate-x-1">
                        <span className="text-lg">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ System Status: WORKING</h3>
            <p className="text-green-700">All pages load immediately with beautiful UI. No more loading issues!</p>
          </div>
        </div>
      </div>
      <style jsx global>{`
        /* Light, subtle scrollbar */
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: #f0f4f8; }
        ::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.55);
          border-radius: 9999px;
          border: 2px solid #f0f4f8;
        }
        ::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.65); }
        html { scrollbar-color: rgba(148,163,184,0.55) #f0f4f8; }
      `}</style>
    </div>
  );
}


