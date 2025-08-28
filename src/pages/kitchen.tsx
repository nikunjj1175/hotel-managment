import { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import { RequireRole } from '../components/RequireRole';
import Layout from '../components/Layout';
import { useSocket } from '../hooks/useSocket';
import { 
  FireIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon
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
  orderStatus: 'PENDING' | 'ACCEPTED' | 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  estimatedTime?: number;
  customerNotes?: string;
  createdAt: string;
}

export default function KitchenPage() {
  const { user, hydrated } = useAppSelector(s => s.auth);
  const { success, error: toastError, warning, info } = useToast();

  // NO MORE LOADING CHECKS - UI SHOWS IMMEDIATELY
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('cooking');
  const socket = useSocket();

  useEffect(() => {
    loadOrders();
    
    // Socket.IO event listeners for real-time updates
    if (socket) {
      socket.on('order:new', (newOrder: Order) => {
        setOrders(prev => [newOrder, ...prev]);
        success('New Order', `New order received from Table ${newOrder.tableId}`, 3000);
      });

      socket.on('order:updated', (updatedOrder: Order) => {
        setOrders(prev => prev.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        ));
        info('Order Updated', `Order ${updatedOrder._id} status updated`, 2000);
      });

      socket.on('order:cancelled', (cancelledOrder: Order) => {
        setOrders(prev => prev.filter(order => order._id !== cancelledOrder._id));
        warning('Order Cancelled', `Order ${cancelledOrder._id} was cancelled`, 3000);
      });

      // Join kitchen room for real-time updates
      socket.emit('join:kitchen', { cafeId: user?.cafeId });
    }

    // Refresh orders every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('order:new');
        socket.off('order:updated');
        socket.off('order:cancelled');
        socket.emit('leave:kitchen');
      }
    };
  }, [socket, user?.cafeId]);

  const loadOrders = async () => {
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
          orderStatus: 'COOKING',
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
          orderStatus: 'PENDING',
          estimatedTime: 20,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
        },
        {
          _id: '3',
          tableId: 'table-5',
          items: [
            { menuItemId: '1', name: 'Margherita Pizza', price: 12.99, quantity: 2 }
          ],
          totalAmount: 25.98,
          orderStatus: 'READY',
          estimatedTime: 20,
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
        }
      ];
      setOrders(mockOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    try {
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, orderStatus: newStatus }
          : order
      ));
      
      const statusMessages = {
        'ACCEPTED': 'Order accepted and moved to cooking queue',
        'COOKING': 'Order marked as cooking',
        'READY': 'Order marked as ready for pickup',
        'COMPLETED': 'Order completed'
      };
      
      success('Status Updated', statusMessages[newStatus] || 'Order status updated', 3000);
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Failed to update order status', 4000);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return ExclamationTriangleIcon;
      case 'ACCEPTED': return ClockIcon;
      case 'COOKING': return FireIcon;
      case 'READY': return CheckCircleIcon;
      case 'COMPLETED': return CheckCircleIcon;
      case 'CANCELLED': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(elapsed / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  const getPriorityColor = (order: Order) => {
    const elapsed = Date.now() - new Date(order.createdAt).getTime();
    const minutes = Math.floor(elapsed / (1000 * 60));
    
    if (minutes > 20) return 'border-red-500 bg-red-50';
    if (minutes > 15) return 'border-orange-500 bg-orange-50';
    if (minutes > 10) return 'border-yellow-500 bg-yellow-50';
    return 'border-gray-200';
  };

  const renderOrderCard = (order: Order) => (
    <div key={order._id} className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border ${getPriorityColor(order)}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
            {order.orderStatus}
          </span>
          <span className="text-sm text-gray-500">Table {order.tableId}</span>
        </div>
        <div className="text-sm text-gray-500 inline-flex items-center gap-1">
          <ClockIcon className="h-4 w-4" />
          {getTimeElapsed(order.createdAt)}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{item.name}</span>
              <span className="text-sm text-gray-600">x{item.quantity}</span>
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
        <div className="text-lg font-bold text-gray-900 inline-flex items-center gap-2">
          <span role="img" aria-label="money">💲</span> ${order.totalAmount.toFixed(2)}
        </div>
        {order.estimatedTime && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            Est: {order.estimatedTime} min
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {order.orderStatus === 'PENDING' && (
          <>
            <button
              onClick={() => updateOrderStatus(order._id, 'ACCEPTED')}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Accept Order
            </button>
            <button
              onClick={() => updateOrderStatus(order._id, 'CANCELLED')}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </>
        )}
        
        {order.orderStatus === 'ACCEPTED' && (
          <button
            onClick={() => updateOrderStatus(order._id, 'COOKING')}
            className="w-full px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            Start Cooking
          </button>
        )}
        
        {order.orderStatus === 'COOKING' && (
          <button
            onClick={() => updateOrderStatus(order._id, 'READY')}
            className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            Mark Ready
          </button>
        )}
        
        {order.orderStatus === 'READY' && (
          <button
            onClick={() => updateOrderStatus(order._id, 'COMPLETED')}
            className="w-full px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            Mark Completed
          </button>
              )}
            </div>
    </div>
  );

  const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING');
  const cookingOrders = orders.filter(o => o.orderStatus === 'COOKING');
  const readyOrders = orders.filter(o => o.orderStatus === 'READY');

  return (
    <RequireRole allow={['KITCHEN', 'SUPER_ADMIN']}>
      <Layout title="Kitchen Dashboard">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="rounded-3xl p-8 text-gray-900 relative overflow-hidden bg-gradient-to-r from-sky-50 via-indigo-50 to-violet-50 border border-slate-200 shadow-sm">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2 text-[#111827]">
                Welcome, {user?.name}! 👨‍🍳
              </h1>
              <p className="text-[#6b7280] text-lg">
                Manage your cooking queue and prepare delicious orders
              </p>
            </div>
            {/* Minimal soft icons */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -right-10 -bottom-8 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-2xl" />
              <div className="absolute right-8 bottom-8 opacity-20">
                <FireIcon className="w-14 h-14 text-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-2xl">
            {[
              { id: 'pending', label: 'Pending', count: pendingOrders.length, icon: ExclamationTriangleIcon, iconColor: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-800' },
              { id: 'cooking', label: 'Cooking', count: cookingOrders.length, icon: FireIcon, iconColor: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' },
              { id: 'ready', label: 'Ready', count: readyOrders.length, icon: CheckCircleIcon, iconColor: 'text-green-600', badge: 'bg-green-100 text-green-800' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <tab.icon className={`h-4 w-4 ${tab.iconColor}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tab.badge}`}>{tab.count}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Orders Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeTab === 'pending' && pendingOrders.map(renderOrderCard)}
          {activeTab === 'cooking' && cookingOrders.map(renderOrderCard)}
          {activeTab === 'ready' && readyOrders.map(renderOrderCard)}
        </div>

        {/* Empty State */}
        {activeTab === 'pending' && pendingOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No pending orders</p>
            <p className="text-sm">All orders have been processed!</p>
          </div>
        )}
        
        {activeTab === 'cooking' && cookingOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FireIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No orders cooking</p>
            <p className="text-sm">Start accepting orders to begin cooking!</p>
          </div>
        )}
        
        {activeTab === 'ready' && readyOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No orders ready</p>
            <p className="text-sm">Complete cooking orders to mark them ready!</p>
      </div>
                )}
      </Layout>
    </RequireRole>
  );
}






