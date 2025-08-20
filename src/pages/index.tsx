import Link from 'next/link';
import { ArrowRightIcon, ArrowRightOnRectangleIcon, ShieldCheckIcon, PresentationChartBarIcon, FireIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const tiles = [
    { href: '/login', title: 'Login', Icon: ArrowRightOnRectangleIcon, gradient: 'from-blue-500/15 via-sky-500/10 to-emerald-500/15' },
    { href: '/super-admin', title: 'Super Admin', Icon: ShieldCheckIcon, gradient: 'from-indigo-500/15 via-violet-500/10 to-emerald-500/15' },
    { href: '/admin', title: 'Admin Dashboard', Icon: PresentationChartBarIcon, gradient: 'from-blue-500/15 via-indigo-500/10 to-purple-500/15' },
    { href: '/kitchen', title: 'Kitchen Panel', Icon: FireIcon, gradient: 'from-teal-500/15 via-emerald-500/10 to-green-500/15' },
    { href: '/delivery', title: 'Delivery Panel', Icon: TruckIcon, gradient: 'from-cyan-500/15 via-blue-500/10 to-emerald-500/15' },
  ];

  return (
    <div className="px-6 py-16 max-w-7xl mx-auto">
      <div className="max-w-3xl mx-auto text-center animate-fade-up" style={{ animationDelay: '40ms' }}>
        <h1 className="inline-block text-5xl sm:text-6xl leading-[1.25] sm:leading-[1.15] pb-1 font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-600 bg-clip-text text-transparent">
          Restaurant Management
        </h1>
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
              <div className={`p-[2px] rounded-3xl bg-gradient-to-br ${gradient} transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-900/10`}>
                <div className="rounded-3xl bg-white/85 backdrop-blur-sm p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-white/70 ring-1 ring-black/5 flex items-center justify-center shadow-sm transition-colors duration-300 group-hover:bg-white">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{title}</span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-white/60 ring-1 ring-black/5 flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:bg-white group-hover:text-gray-700 group-hover:translate-x-0.5">
                      <ArrowRightIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


