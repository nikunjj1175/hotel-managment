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
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Tables',
      value: '45',
      change: '+5%',
      changeType: 'positive',
      icon: TableCellsIcon,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Menu Items',
      value: '89',
      change: '+8%',
      changeType: 'positive',
      icon: ClipboardDocumentListIcon,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Orders Today',
      value: '156',
      change: '+23%',
      changeType: 'positive',
      icon: FireIcon,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Add New User',
      description: 'Create a new user account',
      icon: UsersIcon,
      href: '/super-admin',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Manage Tables',
      description: 'Configure table settings',
      icon: TableCellsIcon,
      href: '/admin/tables',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Update Menu',
      description: 'Add or modify menu items',
      icon: ClipboardDocumentListIcon,
      href: '/admin/menu',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'View Orders',
      description: 'Monitor kitchen orders',
      icon: FireIcon,
      href: '/kitchen',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
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
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your hotel today
            </p>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16" />
          </div>
          
          {/* Floating Icons */}
          <div className="absolute top-4 right-8 opacity-20">
            <ChartBarIcon className="w-16 h-16 animate-bounce" style={{ animationDelay: '0s' }} />
          </div>
          <div className="absolute bottom-4 right-4 opacity-20">
            <ClockIcon className="w-12 h-12 animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className={`${stat.bgColor} rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
      </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
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
          {quickActions.map((action, index) => (
            <div
              key={action.title}
              className={`${action.bgColor} rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleQuickAction(action)}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} bg-opacity-10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className={`w-6 h-6 ${action.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            </div>
          ))}
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


