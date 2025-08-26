import { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import { RequireRole } from '../components/RequireRole';
import Layout from '../components/Layout';
import { useSocket } from '../hooks/useSocket';
import { 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserIcon,
  HandRaisedIcon
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
  estimatedTime?: number;
  customerNotes?: string;
  createdAt: string;
}

export default function WaiterPage() {
  const { user, hydrated } = useAppSelector(s => s.auth);

  // NO MORE LOADING CHECKS - UI SHOWS IMMEDIATELY
  const { success, error: toastError, warning, info } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('cash-pending');
  const socket = useSocket();

  useEffect(() => {
    loadOrders();
    
    // Socket.IO event listeners for real-time updates
    if (socket) {
      socket.on('order:ready', (readyOrder: any) => {
        setOrders(prev => prev.map(order => 
          order._id === readyOrder._id ? { ...order, orderStatus: 'READY' } : order
        ));
        success('Order Ready', `Order ${readyOrder._id} is ready to serve`, 3000);
      });

      socket.on('order:new', (newOrder: any) => {
        setOrders(prev => [newOrder, ...prev]);
        info('New Order', `New order received from Table ${newOrder.tableId}`, 3000);
      });

      socket.on('order:status_updated', (orderUpdate: any) => {
        setOrders(prev => prev.map(order => 
          order._id === orderUpdate._id ? orderUpdate : order
        ));
      });

      // Join waiter room for real-time updates
      socket.emit('join:waiter', { cafeId: user?.cafeId });
    }

    // Refresh orders every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('order:ready');
        socket.off('order:new');
        socket.off('order:status_updated');
        socket.emit('leave:waiter');
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
          paymentMethod: 'CASH',
          paymentStatus: 'CASH_PENDING',
          orderStatus: 'READY',
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
          orderStatus: 'READY',
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
          paymentMethod: 'CASH',
          paymentStatus: 'CASH_PENDING',
          orderStatus: 'COOKING',
          estimatedTime: 20,
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
        }
      ];
      setOrders(mockOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: Order['paymentStatus']) => {
    try {
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, paymentStatus: newStatus }
          : order
      ));
      
      if (newStatus === 'PAID') {
        success('Payment Collected', 'Cash payment has been collected successfully!', 3000);
      } else {
        success('Status Updated', 'Payment status updated', 3000);
      }
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Failed to update payment status', 4000);
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
        'ACCEPTED': 'Order accepted',
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

  const getPriorityColor = (order: Order) => {
    const elapsed = Date.now() - new Date(order.createdAt).getTime();
    const minutes = Math.floor(elapsed / (1000 * 60));
    
    if (minutes > 20) return 'border-red-500 bg-red-50';
    if (minutes > 15) return 'border-orange-500 bg-orange-50';
    if (minutes > 10) return 'border-yellow-500 bg-yellow-50';
    return 'border-gray-200';
  };

  const cashPendingOrders = orders.filter(o => o.paymentStatus === 'CASH_PENDING');
  const readyOrders = orders.filter(o => o.orderStatus === 'READY');
  const allOrders = orders;

  const renderOrderCard = (order: Order) => (
    <div key={order._id} className={`bg-white rounded-2xl border-2 p-6 shadow-sm hover:shadow-md transition-all ${getPriorityColor(order)}`}>
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
        {order.paymentStatus === 'CASH_PENDING' && (
          <button
            onClick={() => updatePaymentStatus(order._id, 'PAID')}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            Collect Cash
          </button>
        )}
        
        {order.orderStatus === 'READY' && (
          <button
            onClick={() => updateOrderStatus(order._id, 'COMPLETED')}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Mark Served
          </button>
        )}
        
        {order.orderStatus === 'PENDING' && (
          <button
            onClick={() => updateOrderStatus(order._id, 'ACCEPTED')}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Accept Order
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Layout title="Waiter Dashboard">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">
                Welcome, {user?.name}! 👨‍💼
              </h1>
              <p className="text-blue-100 text-lg">
                Manage customer service and cash payments
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
              <CurrencyDollarIcon className="w-12 h-12 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-2xl">
            {[
              { id: 'cash-pending', label: 'Cash Pending', count: cashPendingOrders.length, icon: CurrencyDollarIcon },
              { id: 'ready', label: 'Ready to Serve', count: readyOrders.length, icon: CheckCircleIcon },
              { id: 'all', label: 'All Orders', count: allOrders.length, icon: EyeIcon }
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
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Orders Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeTab === 'cash-pending' && cashPendingOrders.map(renderOrderCard)}
          {activeTab === 'ready' && readyOrders.map(renderOrderCard)}
          {activeTab === 'all' && allOrders.map(renderOrderCard)}
        </div>

        {/* Empty State */}
        {activeTab === 'cash-pending' && cashPendingOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No cash payments pending</p>
            <p className="text-sm">All payments have been collected!</p>
          </div>
        )}
        
        {activeTab === 'ready' && readyOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No orders ready to serve</p>
            <p className="text-sm">Wait for kitchen to complete orders!</p>
          </div>
        )}
        
        {activeTab === 'all' && allOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <EyeIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No orders found</p>
            <p className="text-sm">Orders will appear here when customers place them!</p>
          </div>
        )}
      </Layout>
  );
}
