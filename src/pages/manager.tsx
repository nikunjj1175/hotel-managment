import { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import { RequireRole } from '../components/RequireRole';
import Layout from '../components/Layout';
import { useSocket } from '../hooks/useSocket';
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CurrencyDollarIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/Toast';

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

interface Order {
  _id: string;
  tableId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'ONLINE' | 'CASH';
  paymentStatus: 'PENDING' | 'PAID' | 'CASH_PENDING' | 'FAILED';
  orderStatus: 'PENDING' | 'ACCEPTED' | 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: string;
  estimatedTime?: number;
  customerNotes?: string;
  createdAt: string;
}

interface StaffMember {
  _id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  ordersHandled: number;
  averageOrderTime: number;
  rating: number;
}

export default function ManagerPage() {
  const { user, hydrated } = useAppSelector(s => s.auth);

  // NO MORE LOADING CHECKS - UI SHOWS IMMEDIATELY
  const { success, error: toastError, warning, info } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const socket = useSocket();

  useEffect(() => {
    loadData();
    
    // Socket.IO event listeners for real-time updates
    if (socket) {
      socket.on('order:new', (newOrder: any) => {
        setOrders(prev => [newOrder, ...prev]);
        info('New Order', `New order received from Table ${newOrder.tableId}`, 3000);
      });

      socket.on('order:status_updated', (orderUpdate: any) => {
        setOrders(prev => prev.map(order => 
          order._id === orderUpdate._id ? orderUpdate : order
        ));
      });

      socket.on('staff:performance_updated', (staffUpdate: any) => {
        setStaff(prev => prev.map(member => 
          member._id === staffUpdate._id ? { ...member, ...staffUpdate } : member
        ));
      });

      socket.on('cafe:alert', (alert: any) => {
        warning('Cafe Alert', alert.message, 5000);
      });

      // Join manager room for real-time updates
      socket.emit('join:manager', { cafeId: user?.cafeId });
    }

    // Refresh data every minute
    const interval = setInterval(loadData, 60000);
    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('order:new');
        socket.off('order:status_updated');
        socket.off('staff:performance_updated');
        socket.off('cafe:alert');
        socket.emit('leave:manager');
      }
    };
  }, [socket, user?.cafeId]);

  const loadData = async () => {
    try {
      // Mock data for demonstration
      const mockOrders: Order[] = [
        {
          _id: '1',
          tableId: 'table-1',
          items: [
            { menuItemId: '1', name: 'Margherita Pizza', price: 12.99, quantity: 1 },
            { menuItemId: '2', name: 'Chicken Burger', price: 8.99, quantity: 2 }
          ],
          totalAmount: 30.97,
          paymentMethod: 'CASH',
          paymentStatus: 'CASH_PENDING',
          orderStatus: 'READY',
          assignedTo: 'waiter-1',
          estimatedTime: 25,
          customerNotes: 'Extra cheese on pizza',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago
        },
        {
          _id: '2',
          tableId: 'table-3',
          items: [
            { menuItemId: '3', name: 'Caesar Salad', price: 6.99, quantity: 1 },
            { menuItemId: '4', name: 'Pasta Carbonara', price: 14.99, quantity: 1 }
          ],
          totalAmount: 21.98,
          paymentMethod: 'ONLINE',
          paymentStatus: 'PAID',
          orderStatus: 'COOKING',
          assignedTo: 'kitchen-1',
          estimatedTime: 20,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
        }
      ];

      const mockStaff: StaffMember[] = [
        {
          _id: 'waiter-1',
          name: 'John Smith',
          role: 'WAITER',
          status: 'ACTIVE',
          ordersHandled: 45,
          averageOrderTime: 18,
          rating: 4.8
        },
        {
          _id: 'kitchen-1',
          name: 'Maria Garcia',
          role: 'KITCHEN',
          status: 'ACTIVE',
          ordersHandled: 38,
          averageOrderTime: 22,
          rating: 4.6
        },
        {
          _id: 'waiter-2',
          name: 'David Lee',
          role: 'WAITER',
          status: 'ACTIVE',
          ordersHandled: 32,
          averageOrderTime: 16,
          rating: 4.9
        }
      ];

      setOrders(mockOrders);
      setStaff(mockStaff);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const assignOrder = async (orderId: string, staffId: string) => {
    try {
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, assignedTo: staffId }
          : order
      ));
      
      const staffMember = staff.find(s => s._id === staffId);
      success('Order Assigned', `Order assigned to ${staffMember?.name}`, 3000);
    } catch (err: any) {
      toastError('Assignment Failed', err.message || 'Failed to assign order', 4000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'ACCEPTED': return 'text-blue-600 bg-blue-50';
      case 'COOKING': return 'text-orange-600 bg-orange-50';
      case 'READY': return 'text-green-600 bg-green-50';
      case 'COMPLETED': return 'text-gray-600 bg-gray-50';
      case 'CANCELLED': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'PAID': return 'text-green-600 bg-green-50';
      case 'CASH_PENDING': return 'text-orange-600 bg-orange-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(elapsed / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING');
  const activeOrders = orders.filter(o => ['ACCEPTED', 'COOKING'].includes(o.orderStatus));
  const completedOrders = orders.filter(o => o.orderStatus === 'COMPLETED');

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const averageOrderValue = orders.length > 0 
    ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length 
    : 0;

  const renderOrderCard = (order: Order) => (
    <div key={order._id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
            {order.orderStatus}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
            {order.paymentStatus}
          </span>
          <span className="text-sm text-gray-500">Table {order.tableId}</span>
        </div>
        <div className="text-sm text-gray-500">
          {getTimeElapsed(order.createdAt)}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.name}</span>
              <span className="text-sm text-gray-500">x{item.quantity}</span>
            </div>
            <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {order.customerNotes && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Notes:</strong> {order.customerNotes}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-bold text-gray-900">
          Total: ${order.totalAmount.toFixed(2)}
        </div>
        {order.estimatedTime && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            Est: {order.estimatedTime} min
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <select
          value={order.assignedTo || ''}
          onChange={(e) => assignOrder(order._id, e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Assign to...</option>
          {staff.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name} ({member.role})
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStaffCard = (member: StaffMember) => (
    <div key={member._id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
          <p className="text-sm text-gray-500">{member.role}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          member.status === 'ACTIVE' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
        }`}>
          {member.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{member.ordersHandled}</div>
          <div className="text-xs text-gray-500">Orders</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{member.averageOrderTime}</div>
          <div className="text-xs text-gray-500">Avg Min</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{member.rating}</div>
          <div className="text-xs text-gray-500">Rating</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => info('View Details', `Viewing details for ${member.name}`, 2000)}
          className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          View Details
        </button>
        <button
          onClick={() => info('Performance', `Viewing performance for ${member.name}`, 2000)}
          className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
        >
          Performance
        </button>
      </div>
    </div>
  );

  return (
    <Layout title="Manager Dashboard">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">
                Welcome, {user?.name}! 👔
              </h1>
              <p className="text-purple-100 text-lg">
                Oversee operations and manage your team
              </p>
            </div>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16" />
            </div>
            
            {/* Floating Icons */}
            <div className="absolute top-4 right-8 opacity-20">
              <UserGroupIcon className="w-16 h-16 animate-bounce" style={{ animationDelay: '0s' }} />
            </div>
            <div className="absolute bottom-4 right-4 opacity-20">
              <ChartBarIcon className="w-12 h-12 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-2xl">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'orders', label: 'Orders', icon: FireIcon },
              { id: 'staff', label: 'Staff', icon: UserGroupIcon }
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <FireIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{orders.length}</h3>
                <p className="text-gray-600 text-sm">Total Orders</p>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-green-100">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">${totalRevenue.toFixed(2)}</h3>
                <p className="text-gray-600 text-sm">Total Revenue</p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">${averageOrderValue.toFixed(2)}</h3>
                <p className="text-gray-600 text-sm">Avg Order Value</p>
              </div>

              <div className="bg-orange-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-orange-100">
                    <UserGroupIcon className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{staff.length}</h3>
                <p className="text-gray-600 text-sm">Active Staff</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <ClockIcon className="w-6 h-6 text-blue-500" />
                Recent Activity
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-3 h-3 rounded-full ${
                        order.orderStatus === 'COMPLETED' ? 'bg-green-500' :
                        order.orderStatus === 'READY' ? 'bg-blue-500' :
                        order.orderStatus === 'COOKING' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">Order #{order._id.slice(-6)} - Table {order.tableId}</p>
                        <p className="text-gray-600 text-sm">${order.totalAmount.toFixed(2)} - {order.orderStatus}</p>
                      </div>
                      <span className="text-gray-500 text-sm">{getTimeElapsed(order.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FireIcon className="w-6 h-6 text-orange-500" />
              Order Management
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {orders.map(renderOrderCard)}
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <UserGroupIcon className="w-6 h-6 text-purple-500" />
              Staff Management
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {staff.map(renderStaffCard)}
            </div>
          </div>
        )}
      </Layout>
  );
}
