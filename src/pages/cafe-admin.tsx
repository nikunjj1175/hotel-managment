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
  XCircleIcon,
  StarIcon
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
      const selectedId = selectedCafeData?._id || user?.cafeId;
      if (!selectedId) {
        setCafeStats({ totalOrders: 0, totalRevenue: 0, activeTables: 0, menuItems: 0 });
        return;
      }

      const [ordersRes, menuRes, tablesRes] = await Promise.all([
        fetch(`/api/orders?cafeId=${selectedId}`),
        fetch(`/api/menu?cafeId=${selectedId}`),
        fetch(`/api/tables?cafeId=${selectedId}`)
      ]);

      const orders = await ordersRes.json();
      const menuItems = await menuRes.json();
      const tables = await tablesRes.json();

      const totalRevenue = Array.isArray(orders)
        ? orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0)
        : 0;

      setCafeStats({
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalRevenue,
        activeTables: Array.isArray(tables) ? tables.length : 0,
        menuItems: Array.isArray(menuItems) ? menuItems.length : 0
      });
    } catch (error) {
      toastError('Failed to load stats', 'Could not fetch cafe statistics.', 5000);
      console.error('Error loading stats:', error);
    }
  };

  const statsCards = [
    {
      title: 'Total Orders',
      value: String(cafeStats.totalOrders),
      change: '',
      changeType: 'positive',
      icon: ShoppingCartIcon,
      iconBg: 'bg-indigo-50',
      iconClass: 'text-blue-500'
    },
    {
      title: 'Active Tables',
      value: String(cafeStats.activeTables),
      change: '',
      changeType: 'positive',
      icon: TableCellsIcon,
      iconBg: 'bg-emerald-50',
      iconClass: 'text-emerald-500'
    },
    {
      title: 'Menu Items',
      value: String(cafeStats.menuItems),
      change: '',
      changeType: 'positive',
      icon: ClipboardDocumentListIcon,
      iconBg: 'bg-purple-50',
      iconClass: 'text-violet-500'
    },
    {
      title: 'Revenue Today',
      value: `$${cafeStats.totalRevenue}`,
      change: '',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      iconBg: 'bg-amber-50',
      iconClass: 'text-amber-500'
    }
  ];

  return (
    <RequireRole allow={['CAFE_ADMIN', 'SUPER_ADMIN']}>
      <Layout title="Cafe Admin Dashboard">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="rounded-3xl p-8 text-gray-800 relative overflow-hidden bg-gradient-to-r from-yellow-50 via-emerald-50 to-sky-50 border border-gray-200">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
              <p className="text-gray-600 text-lg">Manage your cafe operations and monitor performance</p>
              {cafe && (
                <div className="mt-4 flex items-center gap-3 text-gray-800">
                  <BuildingStorefrontIcon className="h-6 w-6" />
                  <span className="text-lg font-medium">{cafe.name}</span>
                </div>
              )}
              {selectedCafeData && (
                <div className="mt-4 p-4 bg-white/60 rounded-xl backdrop-blur-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <BuildingStorefrontIcon className="h-6 w-6 text-gray-800" />
                    <span className="text-lg font-medium">{selectedCafeData.name}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium border border-gray-200">
                      Super Admin View
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {selectedCafeData.address} • {selectedCafeData.contactEmail}
                  </p>
                </div>
              )}
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
            {/* Stats Grid (Admin-style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => (
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

            {/* Quick Actions (Admin-style) */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <StarIcon className="w-6 h-6 text-yellow-500" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    id: 'add-user',
                    title: 'Add New User',
                    description: 'Create a new user account',
                    icon: UserGroupIcon,
                    cardGradient: 'from-indigo-50 to-purple-50',
                    iconClass: 'text-indigo-500',
                    onClick: () => setActiveTab('staff')
                  },
                  {
                    id: 'manage-tables',
                    title: 'Manage Tables',
                    description: 'Configure table settings',
                    icon: TableCellsIcon,
                    cardGradient: 'from-emerald-50 to-teal-50',
                    iconClass: 'text-emerald-500',
                    onClick: () => setActiveTab('tables')
                  },
                  {
                    id: 'update-menu',
                    title: 'Update Menu',
                    description: 'Add or modify menu items',
                    icon: ClipboardDocumentListIcon,
                    cardGradient: 'from-purple-50 to-pink-50',
                    iconClass: 'text-violet-500',
                    onClick: () => setActiveTab('menu')
                  },
                  {
                    id: 'view-orders',
                    title: 'View Orders',
                    description: 'Monitor kitchen orders',
                    icon: FireIcon,
                    cardGradient: 'from-amber-50 to-yellow-50',
                    iconClass: 'text-orange-500',
                    onClick: () => setActiveTab('orders')
                  }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.id}
                      className={`rounded-2xl p-5 md:p-6 bg-gradient-to-r ${action.cardGradient} border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] cursor-pointer`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={action.onClick}
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
