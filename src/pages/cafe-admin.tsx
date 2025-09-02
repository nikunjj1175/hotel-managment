import { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import { RequireRole } from '../components/RequireRole';
import Layout from '../components/Layout';
import { useSocket } from '../hooks/useSocket';
import { 
  BuildingStorefrontIcon, 
  ClipboardDocumentListIcon, 
  TableCellsIcon, 
  FireIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/Toast';

export default function CafeAdminPage() {
  const { user, cafe, hydrated } = useAppSelector(s => s.auth);
  const { success, error: toastError, warning, info } = useToast();
  const [selectedCafeData, setSelectedCafeData] = useState<any>(null);

  // NO MORE LOADING CHECKS - UI SHOWS IMMEDIATELY

  const [activeTab, setActiveTab] = useState('dashboard');
  const [cafeStats, setCafeStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeTables: 0,
    menuItems: 0
  });
  const socket = useSocket();

  useEffect(() => {
    // Check if we have selected cafe data from super admin
    if (typeof window !== 'undefined') {
      try {
        const storedCafe = localStorage.getItem('selectedCafe');
        if (storedCafe) {
          const cafeData = JSON.parse(storedCafe);
          setSelectedCafeData(cafeData);
          success('Cafe Dashboard', `Viewing ${cafeData.name} dashboard`, 3000);
          // Clear the stored data after using it
          localStorage.removeItem('selectedCafe');
        }
      } catch (error) {
        console.error('Error loading selected cafe data:', error);
      }
    }

    loadStats();
    
    // Socket.IO event listeners for real-time updates
    if (socket) {
      socket.on('order:new', (newOrder: any) => {
        setCafeStats(prev => ({
          ...prev,
          totalOrders: prev.totalOrders + 1
        }));
        success('New Order', `New order received from Table ${newOrder.tableId}`, 3000);
      });

      socket.on('order:completed', (completedOrder: any) => {
        setCafeStats(prev => ({
          ...prev,
          totalRevenue: prev.totalRevenue + completedOrder.totalAmount
        }));
        info('Order Completed', `Order ${completedOrder._id} completed`, 2000);
      });

      socket.on('table:status_changed', (tableUpdate: any) => {
        setCafeStats(prev => ({
          ...prev,
          activeTables: tableUpdate.isOccupied ? prev.activeTables + 1 : prev.activeTables - 1
        }));
      });

      // Join cafe admin room for real-time updates
      socket.emit('join:cafe_admin', { cafeId: user?.cafeId });
    }

    // Refresh stats every minute
    const interval = setInterval(loadStats, 60000);
    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('order:new');
        socket.off('order:completed');
        socket.off('table:status_changed');
        socket.emit('leave:cafe_admin');
      }
    };
  }, [socket, user?.cafeId]);

  const loadStats = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockStats = {
        totalOrders: 24,
        totalRevenue: 1247,
        activeTables: 8,
        menuItems: 45
      };
      setCafeStats(mockStats);
    } catch (error) {
      toastError('Failed to load stats', 'Could not fetch cafe statistics.', 5000);
      console.error('Error loading stats:', error);
    }
  };

  const statsCards = [
    {
      title: 'Total Orders',
      value: '24',
      change: '+5 today',
      changeType: 'positive',
      icon: ShoppingCartIcon,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Tables',
      value: '8',
      change: '12 total',
      changeType: 'positive',
      icon: TableCellsIcon,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Menu Items',
      value: '45',
      change: '42 available',
      changeType: 'positive',
      icon: ClipboardDocumentListIcon,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Revenue Today',
      value: '$1,247',
      change: '+12% vs yesterday',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    }
  ];

  return (
    <RequireRole allow={['CAFE_ADMIN', 'SUPER_ADMIN']}>
      <Layout title="Cafe Admin Dashboard">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-green-100 text-lg">
                Manage your cafe operations and monitor performance
              </p>
              {cafe && (
                <div className="mt-4 flex items-center gap-3">
                  <BuildingStorefrontIcon className="h-6 w-6" />
                  <span className="text-lg font-medium">{cafe.name}</span>
                </div>
              )}
              {selectedCafeData && (
                <div className="mt-4 p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <BuildingStorefrontIcon className="h-6 w-6" />
                    <span className="text-lg font-medium text-white">{selectedCafeData.name}</span>
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                      Super Admin View
                    </span>
                  </div>
                  <p className="text-green-100 text-sm">
                    {selectedCafeData.address} • {selectedCafeData.contactEmail}
                  </p>
                </div>
              )}
            </div>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-2xl">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
              { id: 'menu', label: 'Menu', icon: ClipboardDocumentListIcon },
              { id: 'tables', label: 'Tables', icon: TableCellsIcon },
              { id: 'orders', label: 'Orders', icon: FireIcon },
              { id: 'staff', label: 'Staff', icon: UserGroupIcon },
              { id: 'settings', label: 'Settings', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => (
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
                <CogIcon className="w-6 h-6 text-blue-500" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer text-left"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 bg-opacity-10 mb-4 group-hover:scale-110 transition-transform duration-300 w-fit">
                    <PlusIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Menu Item</h3>
                  <p className="text-gray-600 text-sm">Create new menu items for your customers</p>
                </button>

                <button
                  onClick={() => setActiveTab('tables')}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer text-left"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 bg-opacity-10 mb-4 group-hover:scale-110 transition-transform duration-300 w-fit">
                    <PlusIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Tables</h3>
                  <p className="text-gray-600 text-sm">Configure tables and generate QR codes</p>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer text-left"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 bg-opacity-10 mb-4 group-hover:scale-110 transition-transform duration-300 w-fit">
                    <FireIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">View Orders</h3>
                  <p className="text-gray-600 text-sm">Monitor and manage incoming orders</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Other Tabs */}
        {activeTab === 'menu' && (
          <div className="text-center py-12 text-gray-500">
            <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Menu management coming soon...</p>
          </div>
        )}
        {activeTab === 'tables' && (
          <div className="text-center py-12 text-gray-500">
            <TableCellsIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Table management coming soon...</p>
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="text-center py-12 text-gray-500">
            <FireIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Orders management coming soon...</p>
          </div>
        )}
        {activeTab === 'staff' && (
          <div className="text-center py-12 text-gray-500">
            <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Staff management coming soon...</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-12 text-gray-500">
            <CogIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Cafe settings coming soon...</p>
          </div>
        )}
      </Layout>
    </RequireRole>
  );
}
