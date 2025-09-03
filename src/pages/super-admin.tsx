import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '../store';
import { RequireRole } from '../components/RequireRole';
import Layout from '../components/Layout';
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
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TableCellsIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { createCafe, createCafeAdmin } from '../store/slices/authSlice';
import axios from 'axios';
import { useToast } from '../components/Toast';
import { useSocket } from '../hooks/useSocket';

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
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading, hydrated, token } = useAppSelector(s => s.auth);
  const { success, error: toastError, warning, info } = useToast();
  const socket = useSocket();

  // NO MORE LOADING CHECKS - UI SHOWS IMMEDIATELY

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [showCreateCafe, setShowCreateCafe] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [editingCafe, setEditingCafe] = useState<Cafe | null>(null);
  const [deletingCafe, setDeletingCafe] = useState<Cafe | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    contactNumber: '',
    contactEmail: '',
    status: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED' | 'DELETED',
    paymentStatus: 'ACTIVE' as 'ACTIVE' | 'EXPIRED' | 'OVERDUE',
    subscriptionPlan: {
      name: 'Starter',
      type: 'MONTHLY' as 'MONTHLY' | 'YEARLY' | 'TRIAL',
      price: 99,
      features: ['Kitchen', 'Manager'],
      maxTables: 10,
      maxStaff: 5
    },
    config: {
      kitchenEnabled: true,
      waiterEnabled: false,
      managerEnabled: true
    }
  });
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
  const [formErrors, setFormErrors] = useState({
    name: '',
    address: '',
    contactNumber: '',
    contactEmail: ''
  });
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    cafeId: ''
  });
  const [adminErrors, setAdminErrors] = useState({
    cafeId: '',
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    loadCafes();

    if (socket) {
      socket.on('cafe:created', (newCafe: any) => {
        setCafes(prev => [newCafe, ...prev]);
        success('Cafe Created', `New cafe "${newCafe.name}" has been created`, 4000);
      });

      socket.on('cafe:updated', (updatedCafe: any) => {
        setCafes(prev => prev.map(cafe => cafe._id === updatedCafe._id ? updatedCafe : cafe));
        info('Cafe Updated', `Cafe "${updatedCafe.name}" has been updated`, 3000);
      });

      socket.on('cafe:subscription_expiring', (cafeAlert: any) => {
        warning('Subscription Alert', `Cafe "${cafeAlert.name}" subscription expires in ${cafeAlert.daysLeft} days`, 5000);
      });

      socket.on('system:alert', (systemAlert: any) => {
        warning('System Alert', systemAlert.message, 5000);
      });

      socket.emit('join:super_admin');
    }

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
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const res = await axios.get('/api/cafes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCafes(res.data);
    } catch (err) {
      console.error('Error loading cafes:', err);
    }
  };

  const handleCreateCafe = async () => {
    // Validate before submit
    const nextErrors: typeof formErrors = { name: '', address: '', contactNumber: '', contactEmail: '' };
    const trimmed = {
      name: form.name.trim(),
      address: form.address.trim(),
      contactNumber: form.contactNumber.trim(),
      contactEmail: form.contactEmail.trim()
    };
    if (trimmed.name.length < 3) nextErrors.name = 'Name must be at least 3 characters';
    if (trimmed.address.length < 10) nextErrors.address = 'Address must be at least 10 characters';
    // Basic international number: +, digits, spaces, dashes allowed, 7-15 digits
    const digitsCount = trimmed.contactNumber.replace(/\D/g, '').length;
    if (digitsCount < 7 || digitsCount > 15) nextErrors.contactNumber = 'Enter a valid phone number';
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed.contactEmail);
    if (!emailOk) nextErrors.contactEmail = 'Enter a valid email address';
    setFormErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toastError('Validation failed', 'Please correct the highlighted fields', 4000);
      return;
    }
    try {
      await dispatch(createCafe({
        ...form,
        name: trimmed.name,
        address: trimmed.address,
        contactNumber: trimmed.contactNumber,
        contactEmail: trimmed.contactEmail
      })).unwrap();
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
      setFormErrors({ name: '', address: '', contactNumber: '', contactEmail: '' });
      loadCafes();
    } catch (err: any) {
      toastError('Error', err.message || 'Failed to create cafe', 4000);
    }
  };

  const handleCreateAdmin = async () => {
    // Validate admin form
    const nextErrors: typeof adminErrors = { cafeId: '', name: '', email: '', password: '' };
    const trimmed = {
      name: adminForm.name.trim(),
      email: adminForm.email.trim(),
      password: adminForm.password.trim(),
      cafeId: adminForm.cafeId.trim()
    };
    if (!trimmed.cafeId) nextErrors.cafeId = 'Please select a cafe';
    if (trimmed.name.length < 3) nextErrors.name = 'Name must be at least 3 characters';
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed.email);
    if (!emailOk) nextErrors.email = 'Enter a valid email address';
    // Password: min 8 chars, at least 1 letter and 1 number
    const passOk = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(trimmed.password);
    if (!passOk) nextErrors.password = 'Min 8 chars, include letters and numbers';
    setAdminErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toastError('Validation failed', 'Please correct the highlighted fields', 4000);
      return;
    }
    try {
      await dispatch(createCafeAdmin({
        ...adminForm,
        name: trimmed.name,
        email: trimmed.email,
        password: trimmed.password,
        cafeId: trimmed.cafeId
      })).unwrap();
      success('Admin Created', 'Cafe admin has been created successfully!', 3000);
      setShowCreateAdmin(false);
      setAdminForm({ name: '', email: '', password: '', cafeId: '' });
      setAdminErrors({ cafeId: '', name: '', email: '', password: '' });
    } catch (err: any) {
      toastError('Error', err.message || 'Failed to create admin', 4000);
    }
  };

  const handleOpenCafeDashboard = (cafe: Cafe) => {
    // Store cafe data in localStorage for cafe-admin page
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('selectedCafe', JSON.stringify(cafe));
        // Navigate to cafe-admin page
        router.push('/cafe-admin');
      } catch (error) {
        console.error('Error storing cafe data:', error);
        toastError('Error', 'Failed to open cafe dashboard', 5000);
      }
    }
  };

  const handleEditCafe = (cafe: Cafe) => {
    setEditingCafe(cafe);
    setEditForm({
      name: cafe.name,
      address: cafe.address,
      contactNumber: cafe.contactNumber,
      contactEmail: cafe.contactEmail,
      status: cafe.status,
      paymentStatus: cafe.paymentStatus,
      subscriptionPlan: cafe.subscriptionPlan,
      config: cafe.config
    });
  };

  const handleUpdateCafe = async () => {
    if (!editingCafe) return;
    
    try {
      const response = await axios.put(`/api/cafes/${editingCafe._id}`, editForm);
      if (response.status === 200) {
        success('Success', 'Cafe updated successfully!', 3000);
        setEditingCafe(null);
        loadCafes(); // Refresh the cafes list
      }
    } catch (error: any) {
      toastError('Error', error.response?.data?.message || 'Failed to update cafe', 5000);
    }
  };

  const handleDeleteCafe = async () => {
    if (!deletingCafe) return;
    
    try {
      const response = await axios.delete(`/api/cafes/${deletingCafe._id}`);
      if (response.status === 200) {
        success('Success', `${deletingCafe.name} has been deleted successfully!`, 3000);
        setDeletingCafe(null);
        loadCafes(); // Refresh the cafes list
      }
    } catch (error: any) {
      toastError('Error', error.response?.data?.message || 'Failed to delete cafe', 5000);
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
    <RequireRole allow={['SUPER_ADMIN']}>
      <Layout title="Super Admin Dashboard">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="rounded-3xl p-8 text-gray-800 relative overflow-hidden bg-gradient-to-r from-yellow-50 via-emerald-50 to-sky-50 border border-gray-200">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
              <p className="text-gray-600 text-lg">Manage your cafe network and system operations</p>
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
              onClick={() => setShowCreateAdmin(true)}
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
              onClick={() => router.push('/super-admin-analytics')}
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
                  {cafes.map((cafe) => (
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
                            onClick={() => handleOpenCafeDashboard(cafe)}
                            className="text-slate-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                            title="View Cafe Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditCafe(cafe)}
                            className="text-slate-500 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50"
                            title="Edit Cafe"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingCafe(cafe)}
                            className="text-slate-500 hover:text-red-600 p-1 rounded hover:bg-red-50"
                            title="Delete Cafe"
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
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                  )}
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
                  {formErrors.address && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.address}</p>
                  )}
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
                    {formErrors.contactNumber && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.contactNumber}</p>
                    )}
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
                    {formErrors.contactEmail && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.contactEmail}</p>
                    )}
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
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Cafe'}
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

        {/* Create Admin Modal */}
        {showCreateAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create Cafe Admin</h3>
                <button
                  onClick={() => setShowCreateAdmin(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cafe</label>
                  <select
                    value={adminForm.cafeId}
                    onChange={(e) => setAdminForm({ ...adminForm, cafeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a cafe</option>
                    {cafes.map((cafe) => (
                      <option key={cafe._id} value={cafe._id}>
                        {cafe.name}
                      </option>
                    ))}
                  </select>
                  {adminErrors.cafeId && (
                    <p className="mt-1 text-xs text-red-600">{adminErrors.cafeId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Name</label>
                  <input
                    type="text"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter admin name"
                  />
                  {adminErrors.name && (
                    <p className="mt-1 text-xs text-red-600">{adminErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin@cafe.com"
                  />
                  {adminErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{adminErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                  />
                  {adminErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{adminErrors.password}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateAdmin}
                    disabled={loading || !adminForm.cafeId || !adminForm.name || !adminForm.email || !adminForm.password}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Admin'}
                  </button>
                  <button
                    onClick={() => setShowCreateAdmin(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cafe Details Modal */}
        {selectedCafe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Cafe Details</h3>
                <button
                  onClick={() => setSelectedCafe(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid gap-6">
                {/* Cafe Header */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedCafe.name}</h4>
                    <p className="text-gray-600">{selectedCafe.contactEmail}</p>
                  </div>
                </div>

                {/* Cafe Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{selectedCafe.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{selectedCafe.contactNumber}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{selectedCafe.contactEmail}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Subscription Plan</span>
                      <p className="text-gray-900 font-semibold">{selectedCafe.subscriptionPlan.name}</p>
                      <p className="text-sm text-gray-600">${selectedCafe.subscriptionPlan.price}/month</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCafe.status)}`}>
                        {selectedCafe.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Payment Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedCafe.paymentStatus)}`}>
                        {selectedCafe.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-3">Enabled Features</h5>
                  <div className="flex gap-2 flex-wrap">
                    {selectedCafe.config.kitchenEnabled && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Kitchen
                      </span>
                    )}
                    {selectedCafe.config.waiterEnabled && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Waiter
                      </span>
                    )}
                    {selectedCafe.config.managerEnabled && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Manager
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleOpenCafeDashboard(selectedCafe)}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Open Admin Dashboard
                  </button>
                  <button
                    onClick={() => setSelectedCafe(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Cafe Modal */}
        {editingCafe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Edit Cafe: {editingCafe.name}</h3>
                <button
                  onClick={() => setEditingCafe(null)}
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
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter cafe name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
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
                      value={editForm.contactNumber}
                      onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={editForm.contactEmail}
                      onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="info@cafe.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Plan</label>
                    <select
                      value={editForm.subscriptionPlan.name}
                      onChange={(e) => {
                        const plan = subscriptionPlans.find(p => p.name === e.target.value);
                        if (plan) setEditForm({ ...editForm, subscriptionPlan: plan });
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
                    <select
                      value={editForm.subscriptionPlan.type}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        subscriptionPlan: {
                          ...editForm.subscriptionPlan,
                          type: e.target.value as 'MONTHLY' | 'YEARLY' | 'TRIAL'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                      <option value="TRIAL">Trial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      value={editForm.subscriptionPlan.price}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        subscriptionPlan: {
                          ...editForm.subscriptionPlan,
                          price: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="99"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Tables</label>
                    <input
                      type="number"
                      value={editForm.subscriptionPlan.maxTables}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        subscriptionPlan: {
                          ...editForm.subscriptionPlan,
                          maxTables: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Staff</label>
                    <input
                      type="number"
                      value={editForm.subscriptionPlan.maxStaff}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        subscriptionPlan: {
                          ...editForm.subscriptionPlan,
                          maxStaff: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="5"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features Configuration</label>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.config.kitchenEnabled}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          config: { ...editForm.config, kitchenEnabled: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Kitchen</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.config.waiterEnabled}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          config: { ...editForm.config, waiterEnabled: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Waiter</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.config.managerEnabled}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          config: { ...editForm.config, managerEnabled: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Manager</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Features</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Available Features</label>
                      <div className="space-y-2">
                        {['Kitchen', 'Waiter', 'Manager', 'Analytics', 'Custom Domain', 'Payment Gateway'].map((feature) => (
                          <label key={feature} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editForm.subscriptionPlan.features.includes(feature)}
                              onChange={(e) => {
                                const newFeatures = e.target.checked
                                  ? [...editForm.subscriptionPlan.features, feature]
                                  : editForm.subscriptionPlan.features.filter(f => f !== feature);
                                setEditForm({
                                  ...editForm,
                                  subscriptionPlan: {
                                    ...editForm.subscriptionPlan,
                                    features: newFeatures
                                  }
                                });
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cafe Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        status: e.target.value as 'ACTIVE' | 'SUSPENDED' | 'DELETED'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="DELETED">Deleted</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                    <select
                      value={editForm.paymentStatus}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        paymentStatus: e.target.value as 'ACTIVE' | 'EXPIRED' | 'OVERDUE'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdateCafe}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Update Cafe
                  </button>
                  <button
                    onClick={() => setEditingCafe(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingCafe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Delete Cafe</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete <strong>{deletingCafe.name}</strong>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">This will permanently delete:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• All cafe data and settings</li>
                        <li>• Menu items and orders</li>
                        <li>• Table configurations</li>
                        <li>• Staff accounts</li>
                        <li>• Customer data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCafe}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Yes, Delete Cafe
                </button>
                <button
                  onClick={() => setDeletingCafe(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </RequireRole>
  );
}


