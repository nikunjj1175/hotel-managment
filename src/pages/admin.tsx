import Layout from '../components/Layout';
import { useAppSelector } from '../store';
import { useToast } from '../components/Toast';
import { 
  UsersIcon, 
  TableCellsIcon, 
  ClipboardDocumentListIcon, 
  FireIcon, 
  TruckIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { user } = useAppSelector(s => s.auth);
  const { success, error, warning, info } = useToast();

  useEffect(() => {
    // Show welcome toast
    success('Dashboard Loaded', `Welcome to your admin dashboard, ${user?.name}!`, 3000);
  }, [success, user?.name]);

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: UsersIcon,
      iconBg: 'bg-indigo-50',
      iconClass: 'text-blue-500'
    },
    {
      title: 'Active Tables',
      value: '45',
      change: '+5%',
      changeType: 'positive',
      icon: TableCellsIcon,
      iconBg: 'bg-emerald-50',
      iconClass: 'text-emerald-500'
    },
    {
      title: 'Menu Items',
      value: '89',
      change: '+8%',
      changeType: 'positive',
      icon: ClipboardDocumentListIcon,
      iconBg: 'bg-purple-50',
      iconClass: 'text-violet-500'
    },
    {
      title: 'Orders Today',
      value: '156',
      change: '+23%',
      changeType: 'positive',
      icon: FireIcon,
      iconBg: 'bg-orange-50',
      iconClass: 'text-orange-500'
    }
  ];

  const quickActions = [
    {
      title: 'Add New User',
      description: 'Create a new user account',
      icon: UsersIcon,
      href: '/super-admin',
      cardGradient: 'from-blue-100 via-indigo-100 to-purple-100',
      iconClass: 'text-blue-600'
    },
    {
      title: 'Manage Tables',
      description: 'Configure table settings',
      icon: TableCellsIcon,
      href: '/admin/tables',
      cardGradient: 'from-emerald-100 via-teal-100 to-cyan-100',
      iconClass: 'text-emerald-600'
    },
    {
      title: 'Update Menu',
      description: 'Add or modify menu items',
      icon: ClipboardDocumentListIcon,
      href: '/admin/menu',
      cardGradient: 'from-violet-100 via-fuchsia-100 to-pink-100',
      iconClass: 'text-violet-600'
    },
    {
      title: 'View Orders',
      description: 'Monitor kitchen orders',
      icon: FireIcon,
      href: '/kitchen',
      cardGradient: 'from-orange-100 via-amber-100 to-rose-100',
      iconClass: 'text-orange-600'
    }
  ];

  const recentActivity = [
    {
      action: 'New user registered',
      user: 'John Doe',
      time: '2 minutes ago',
      type: 'success'
    },
    {
      action: 'Table 5 order completed',
      user: 'Kitchen Staff',
      time: '5 minutes ago',
      type: 'info'
    },
    {
      action: 'Menu item updated',
      user: 'Admin User',
      time: '15 minutes ago',
      type: 'warning'
    },
    {
      action: 'Delivery started',
      user: 'Delivery Team',
      time: '20 minutes ago',
      type: 'info'
    }
  ];

  const handleQuickAction = (action: any) => {
    info('Action Selected', `Opening ${action.title}...`, 2000);
    // Navigation will be handled by the Link component
  };

  const handleTestToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        success('Success!', 'This is a success message', 4000);
        break;
      case 'error':
        error('Error!', 'This is an error message', 4000);
        break;
      case 'warning':
        warning('Warning!', 'This is a warning message', 4000);
        break;
      case 'info':
        info('Info!', 'This is an info message', 4000);
        break;
    }
  };

  return (
    <Layout title="Admin Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="rounded-3xl p-8 text-gray-900 relative overflow-hidden bg-gradient-to-r from-sky-50 via-indigo-50 to-violet-50 border border-slate-200">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 text-[#111827]">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-[#6b7280] text-lg">
              Here's what's happening with your hotel today
            </p>
          </div>
          {/* Minimal illustration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -right-10 -bottom-8 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-2xl" />
            <div className="absolute right-8 bottom-8 opacity-20">
              <ChartBarIcon className="w-14 h-14 text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className={`bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1 group`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`h-10 w-10 rounded-full grid place-items-center ring-1 ring-slate-200 ${stat.iconBg}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconClass}`} />
              </div>
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-[#111827] mb-1">{stat.value}</h3>
            <p className="text-[#6b7280] text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <StarIcon className="w-6 h-6 text-yellow-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                className={`rounded-2xl p-5 md:p-6 bg-gradient-to-r ${action.cardGradient} border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleQuickAction(action)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-white grid place-items-center ring-1 ring-slate-200">
                    <Icon className={`w-6 h-6 md:w-7 md:h-7 ${action.iconClass}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold text-[#111827]">{action.title}</h3>
                    <p className="text-sm md:text-[15px] text-[#6b7280] mt-0.5">{action.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <BellIcon className="w-6 h-6 text-blue-500" />
          Recent Activity
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'error' ? 'bg-red-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{activity.action}</p>
                  <p className="text-gray-600 text-sm">by {activity.user}</p>
                </div>
                <span className="text-gray-500 text-sm">{activity.time}</span>
          </div>
        ))}
          </div>
        </div>
      </div>

      {/* Toast Test Section */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Toast Notifications</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleTestToast('success')}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200 hover:scale-105"
          >
            Success Toast
          </button>
          <button
            onClick={() => handleTestToast('error')}
            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 hover:scale-105"
          >
            Error Toast
          </button>
          <button
            onClick={() => handleTestToast('warning')}
            className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors duration-200 hover:scale-105"
          >
            Warning Toast
          </button>
          <button
            onClick={() => handleTestToast('info')}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 hover:scale-105"
          >
            Info Toast
          </button>
        </div>
      </div>
    </Layout>
  );
}


