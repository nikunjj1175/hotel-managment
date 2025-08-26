import { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import { RequireRole } from '../components/RequireRole';
import Layout from '../components/Layout';
import { useSocket } from '../hooks/useSocket';
import { 
  BuildingStorefrontIcon, 
  UserPlusIcon, 
  ChartBarIcon, 
  CogIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/Toast';

interface Cafe {
  _id: string;
  name: string;
  logo?: string;
  address: string;
  contactNumber: string;
  contactEmail: string;
  subscriptionPlan: {
    name: string;
    type: 'MONTHLY' | 'YEARLY' | 'TRIAL';
    price: number;
    features: string[];
    maxTables: number;
    maxStaff: number;
  };
  config: {
    kitchenEnabled: boolean;
    waiterEnabled: boolean;
    managerEnabled: boolean;
  };
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  paymentStatus: 'ACTIVE' | 'EXPIRED' | 'OVERDUE';
  createdAt: string;
}

const subscriptionPlans = [
  {
    name: 'Starter',
    type: 'MONTHLY' as const,
    price: 99,
    features: ['Up to 10 tables', 'Basic support', 'Standard features'],
    maxTables: 10,
    maxStaff: 5
  },
  {
    name: 'Professional',
    type: 'MONTHLY' as const,
    price: 199,
    features: ['Up to 25 tables', 'Priority support', 'Advanced analytics'],
    maxTables: 25,
    maxStaff: 15
  },
  {
    name: 'Enterprise',
    type: 'MONTHLY' as const,
    price: 399,
    features: ['Unlimited tables', '24/7 support', 'Custom integrations'],
    maxTables: 100,
    maxStaff: 50
  }
];

export default function SuperAdminPage() {
  const { user, hydrated } = useAppSelector(s => s.auth);
  const { success, error: toastError, warning, info } = useToast();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [showCreateCafe, setShowCreateCafe] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    contactNumber: '',
    contactEmail: '',
    subscriptionPlan: subscriptionPlans[0],
    config: {
      kitchenEnabled: true,
      waiterEnabled: true,
      managerEnabled: true
    }
  });
  const socket = useSocket();

  // NO MORE LOADING CHECKS - UI SHOWS IMMEDIATELY

  // Debug info
  console.log('User authenticated:', user);
  console.log('User role:', user?.role);
  console.log('Cafes loaded:', cafes.length);

  useEffect(() => {
    loadCafes();
    
    // Socket.IO event listeners for real-time updates
    if (socket) {
      socket.on('cafe:created', (newCafe: any) => {
        setCafes(prev => [newCafe, ...prev]);
        success('Cafe Created', `New cafe "${newCafe.name}" has been created`, 4000);
      });

      socket.on('cafe:updated', (updatedCafe: any) => {
        setCafes(prev => prev.map(cafe => 
          cafe._id === updatedCafe._id ? updatedCafe : cafe
        ));
        info('Cafe Updated', `Cafe "${updatedCafe.name}" has been updated`, 3000);
      });

      socket.on('cafe:subscription_expiring', (cafeAlert: any) => {
        warning('Subscription Alert', `Cafe "${cafeAlert.name}" subscription expires in ${cafeAlert.daysLeft} days`, 5000);
      });

      socket.on('system:alert', (systemAlert: any) => {
        warning('System Alert', systemAlert.message, 5000);
      });

      // Join super admin room for real-time updates
      socket.emit('join:super_admin');
    }

    // Refresh data every 5 minutes
    const interval = setInterval(loadCafes, 300000);
    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('cafe:created');
        socket.off('cafe:updated');
        socket.off('cafe:subscription_expiring');
        socket.off('system:alert');
        socket.emit('leave:super_admin');
      }
    };
  }, [socket]);

  const loadCafes = async () => {
    try {
      // Mock data for demonstration
      const mockCafes: Cafe[] = [
        {
          _id: '1',
          name: 'Coffee Corner',
          address: '123 Main St, City',
          contactNumber: '+1-555-0123',
          contactEmail: 'info@coffeecorner.com',
          subscriptionPlan: subscriptionPlans[0],
          config: { kitchenEnabled: true, waiterEnabled: true, managerEnabled: false },
          status: 'ACTIVE',
          paymentStatus: 'ACTIVE',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'Urban Bistro',
          address: '456 Oak Ave, Town',
          contactNumber: '+1-555-0456',
          contactEmail: 'hello@urbanbistro.com',
          subscriptionPlan: subscriptionPlans[1],
          config: { kitchenEnabled: true, waiterEnabled: true, managerEnabled: true },
          status: 'ACTIVE',
          paymentStatus: 'ACTIVE',
          createdAt: new Date().toISOString()
        }
      ];
      setCafes(mockCafes);
    } catch (err) {
      console.error('Error loading cafes:', err);
    }
  };

  const handleCreateCafe = async () => {
    try {
      // Mock API call
      const newCafe: Cafe = {
        _id: Date.now().toString(),
        ...form,
        status: 'ACTIVE',
        paymentStatus: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      setCafes([...cafes, newCafe]);
      success('Cafe Created', 'Cafe has been created successfully!', 3000);
      setShowCreateCafe(false);
      setForm({
        name: '',
        address: '',
        contactNumber: '',
        contactEmail: '',
        subscriptionPlan: subscriptionPlans[0],
        config: { kitchenEnabled: true, waiterEnabled: true, managerEnabled: true }
      });
    } catch (err: any) {
      toastError('Error', err.message || 'Failed to create cafe', 4000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50';
      case 'SUSPENDED': return 'text-yellow-600 bg-yellow-50';
      case 'DELETED': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50';
      case 'EXPIRED': return 'text-red-600 bg-red-50';
      case 'OVERDUE': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const stats = [
    {
      title: 'Total Cafes',
      value: cafes.length.toString(),
      change: '+2 this month',
      changeType: 'positive',
      icon: BuildingStorefrontIcon,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Subscriptions',
      value: cafes.filter(c => c.paymentStatus === 'ACTIVE').length.toString(),
      change: '98% active rate',
      changeType: 'positive',
      icon: CheckCircleIcon,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Monthly Revenue',
      value: `$${cafes.reduce((sum, c) => sum + c.subscriptionPlan.price, 0).toLocaleString()}`,
      change: '+15% vs last month',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'System Health',
      value: 'Excellent',
      change: '99.9% uptime',
      changeType: 'positive',
      icon: ChartBarIcon,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    }
  ];

  return (
    <Layout title="Super Admin Dashboard">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="rounded-3xl p-8 text-gray-800 relative overflow-hidden bg-gradient-to-r from-yellow-50 via-emerald-50 to-sky-50 border border-gray-200">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
              <p className="text-gray-600 text-lg">Manage your cafe network and system operations</p>
              <p className="text-gray-500 text-sm mt-2">Role: {user?.role} | ID: {user?._id} | Status: {user?.status}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className={`${stat.bgColor} rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-white ring-1 ring-gray-200">
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
            <CogIcon className="w-6 h-6 text-blue-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setShowCreateCafe(true)}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-md hover:scale-[1.01] transition-transform duration-200 group cursor-pointer text-left h-full min-h-[112px]"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100 flex items-center justify-center">
                  <PlusIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[18px] font-semibold text-gray-900">Create New Cafe</h3>
                  <p className="text-sm text-gray-600 mt-1">Add a new cafe to your network with subscription plan</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => info('Create Admin', 'Create cafe admin accounts', 2000)}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-md hover:scale-[1.01] transition-transform duration-200 group cursor-pointer text-left h-full min-h-[112px]"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <UserPlusIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[18px] font-semibold text-gray-900">Create Cafe Admin</h3>
                  <p className="text-sm text-gray-600 mt-1">Set up admin accounts for existing cafes</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => info('Analytics', 'View detailed system analytics and reports', 2000)}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-md hover:scale-[1.01] transition-transform duration-200 group cursor-pointer text-left h-full min-h-[112px]"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100 flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[18px] font-semibold text-gray-900">View Analytics</h3>
                  <p className="text-sm text-gray-600 mt-1">Monitor system performance and cafe metrics</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Cafes Management */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <BuildingStorefrontIcon className="w-6 h-6 text-blue-500" />
              Cafe Management
            </h2>
            <button
              onClick={() => setShowCreateCafe(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full shadow-sm hover:shadow-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Add Cafe
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cafe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cafes.map((cafe, idx) => (
                    <tr key={cafe._id} className="odd:bg-white even:bg-slate-50 hover:bg-slate-100 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {cafe.logo ? (
                              <img className="h-10 w-10 rounded-full" src={cafe.logo} alt={cafe.name} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <BuildingStorefrontIcon className="h-6 w-6 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{cafe.name}</div>
                            <div className="text-sm text-gray-500">{cafe.contactEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{cafe.subscriptionPlan.name}</div>
                        <div className="text-sm text-gray-500">${cafe.subscriptionPlan.price}/month</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cafe.status)}`}>
                          {cafe.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(cafe.paymentStatus)}`}>
                          {cafe.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {cafe.config.kitchenEnabled && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Kitchen
                            </span>
                          )}
                          {cafe.config.waiterEnabled && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Waiter
                            </span>
                          )}
                          {cafe.config.managerEnabled && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Manager
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => info('View', `Viewing ${cafe.name}`, 2000)}
                            className="text-slate-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => info('Edit', `Edit ${cafe.name}`, 2000)}
                            className="text-slate-500 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => warning('Delete', `Are you sure you want to delete ${cafe.name}?`, 4000)}
                            className="text-slate-500 hover:text-red-600 p-1 rounded hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Cafe Modal */}
        {showCreateCafe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New Cafe</h3>
                <button
                  onClick={() => setShowCreateCafe(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cafe Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter cafe name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                    <input
                      type="tel"
                      value={form.contactNumber}
                      onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="info@cafe.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Plan</label>
                  <select
                    value={form.subscriptionPlan.name}
                    onChange={(e) => {
                      const plan = subscriptionPlans.find(p => p.name === e.target.value);
                      if (plan) setForm({ ...form, subscriptionPlan: plan });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {subscriptionPlans.map((plan) => (
                      <option key={plan.name} value={plan.name}>
                        {plan.name} - ${plan.price}/month
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role Configuration</label>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={form.config.kitchenEnabled}
                        onChange={(e) => setForm({ ...form, config: { ...form.config, kitchenEnabled: e.target.checked } })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Kitchen</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={form.config.waiterEnabled}
                        onChange={(e) => setForm({ ...form, config: { ...form.config, waiterEnabled: e.target.checked } })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Waiter</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={form.config.managerEnabled}
                        onChange={(e) => setForm({ ...form, config: { ...form.config, managerEnabled: e.target.checked } })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Manager</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateCafe}
                    disabled={!form.name || !form.address || !form.contactNumber || !form.contactEmail}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Cafe
                  </button>
                  <button
                    onClick={() => setShowCreateCafe(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
  );
}
