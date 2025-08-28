import { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import { RequireRole } from '../components/RequireRole';
import Layout from '../components/Layout';
import { useSocket } from '../hooks/useSocket';
import { 
  ShoppingCartIcon, 
  PlusIcon, 
  MinusIcon, 
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/Toast';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  preparationTime: number;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export default function CustomerPage() {
  const { user, hydrated } = useAppSelector(s => s.auth);

  // NO MORE LOADING CHECKS - UI SHOWS IMMEDIATELY
  const { success, error: toastError, warning, info } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [orderStatus, setOrderStatus] = useState<'idle' | 'ordering' | 'ordered' | 'preparing' | 'ready'>('idle');
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const socket = useSocket();

  useEffect(() => {
    loadMenu();
    
    // Socket.IO event listeners for real-time updates
    if (socket) {
      socket.on('order:status_updated', (orderUpdate: any) => {
        if (orderUpdate._id === currentOrder?._id) {
          setOrderStatus(orderUpdate.orderStatus);
          setCurrentOrder(orderUpdate);
          
          const statusMessages: { [key: string]: string } = {
            'ACCEPTED': 'Your order has been accepted and is being prepared!',
            'COOKING': 'Your order is now being cooked!',
            'READY': 'Your order is ready for pickup!',
            'COMPLETED': 'Thank you for your order!'
          };
          
          if (statusMessages[orderUpdate.orderStatus]) {
            success('Order Update', statusMessages[orderUpdate.orderStatus], 4000);
          }
        }
      });

      socket.on('order:estimated_time', (timeUpdate: any) => {
        if (timeUpdate.orderId === currentOrder?._id) {
          info('Time Update', `Estimated time: ${timeUpdate.estimatedTime} minutes`, 3000);
        }
      });

      // Join customer room for real-time updates
      socket.emit('join:customer', { 
        cafeId: user?.cafeId, 
        userId: user?._id 
      });
    }

    return () => {
      if (socket) {
        socket.off('order:status_updated');
        socket.off('order:estimated_time');
        socket.emit('leave:customer');
      }
    };
  }, [socket, user?.cafeId, user?._id, currentOrder?._id]);

  // Mock menu data
  const loadMenu = () => {
    const mockMenu: MenuItem[] = [
      {
        _id: '1',
        name: 'Margherita Pizza',
        description: 'Classic tomato sauce with mozzarella cheese',
        price: 12.99,
        category: 'Pizza',
        isAvailable: true,
        isVegetarian: true,
        preparationTime: 20
      },
      {
        _id: '2',
        name: 'Chicken Burger',
        description: 'Grilled chicken with fresh vegetables',
        price: 8.99,
        category: 'Burgers',
        isAvailable: true,
        isVegetarian: false,
        preparationTime: 15
      },
      {
        _id: '3',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with caesar dressing',
        price: 6.99,
        category: 'Salads',
        isAvailable: true,
        isVegetarian: true,
        preparationTime: 10
      },
      {
        _id: '4',
        name: 'Pasta Carbonara',
        description: 'Creamy pasta with bacon and parmesan',
        price: 14.99,
        category: 'Pasta',
        isAvailable: true,
        isVegetarian: false,
        preparationTime: 18
      }
    ];
    setMenuItems(mockMenu);
    setCategories(['All', ...Array.from(new Set(mockMenu.map(item => item.category)))]);
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.item._id === item._id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.item._id === item._id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    success('Added to Cart', `${item.name} added to cart`, 2000);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(cartItem => cartItem.item._id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(cartItem => 
        cartItem.item._id === itemId 
          ? { ...cartItem, quantity }
          : cartItem
      ));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, cartItem) => total + (cartItem.item.price * cartItem.quantity), 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      warning('Empty Cart', 'Please add items to your cart before placing an order', 3000);
      return;
    }

    try {
      // Mock API call
      const orderData = {
        items: cart.map(cartItem => ({
          menuItemId: cartItem.item._id,
          name: cartItem.item.name,
          price: cartItem.item.price,
          quantity: cartItem.quantity,
          specialInstructions: cartItem.specialInstructions
        })),
        totalAmount: getTotalAmount(),
        customerNotes: orderNotes
      };

      console.log('Placing order:', orderData);
      
      // Clear cart and show success
      setCart([]);
      setOrderNotes('');
      setShowCart(false);
      success('Order Placed', 'Your order has been placed successfully!', 4000);
    } catch (err: any) {
      toastError('Order Failed', err.message || 'Failed to place order', 4000);
    }
  };

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <Layout title="Menu & Order">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">
                Welcome, {user?.name}! 🍽️
              </h1>
              <p className="text-orange-100 text-lg">
                Browse our delicious menu and place your order
              </p>
            </div>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Menu Section */}
          <div className="flex-1">
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      activeCategory === category
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.isAvailable ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    {item.isVegetarian && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-50">
                        Veg
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-gray-900">${item.price.toFixed(2)}</span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      {item.preparationTime} min
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.isAvailable}
                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="w-80">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Cart</h2>
                <button
                  onClick={() => setShowCart(!showCart)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showCart ? <XMarkIcon className="h-5 w-5" /> : <ShoppingCartIcon className="h-5 w-5" />}
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCartIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Your cart is empty</p>
                  <p className="text-sm">Add some delicious items to get started!</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cart.map((cartItem) => (
                      <div key={cartItem.item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{cartItem.item.name}</h4>
                          <p className="text-sm text-gray-600">${cartItem.item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(cartItem.item._id, cartItem.quantity - 1)}
                            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{cartItem.quantity}</span>
                          <button
                            onClick={() => updateQuantity(cartItem.item._id, cartItem.quantity + 1)}
                            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Notes */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Any special requests or notes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      rows={3}
                    />
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span>${getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={placeOrder}
                    className="w-full px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
                  >
                    Place Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </Layout>
  );
}
