import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchMenu, MenuItem } from '../../store/slices/menuSlice';

export default function TableOrderPage() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(s => s.menu);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => { dispatch(fetchMenu()); }, [dispatch]);
  useEffect(() => {
    const loadOrders = async () => {
      if (!slug) return;
      const res = await axios.get(`/api/orders/table?slug=${slug}`);
      setOrders(res.data);
    };
    loadOrders();
  }, [slug]);

  const add = (id: string) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const remove = (id: string) => setCart(c => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });

  const placeOrder = async () => {
    const payload = {
      tableSlug: slug,
      items: Object.entries(cart).map(([itemId, qty]) => ({ itemId, quantity: qty, notes: notes[itemId] || '' }))
    };
    await toast.promise(
      axios.post(`/api/orders`, payload),
      { loading: 'Placing order...', success: 'Order placed!', error: 'Failed to place order' }
    );
    setMessage('Order placed!');
    setCart({});
    setNotes({});
    // reload orders list
    const res2 = await axios.get(`/api/orders/table?slug=${slug}`);
    setOrders(res2.data);
  };

  const cancelOrder = async (id: string) => {
    await toast.promise(
      axios.post(`/api/orders/${id}/cancel-public`, { tableSlug: slug }),
      { loading: 'Cancelling...', success: 'Order cancelled', error: 'Failed to cancel' }
    );
    const res2 = await axios.get(`/api/orders/table?slug=${slug}`);
    setOrders(res2.data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🍽️ Restaurant Menu</h1>
          <p className="text-gray-600">Table {slug?.replace('table-', '')} • Browse and order delicious food</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(mi => (
            <div key={mi._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {mi.imageUrl ? (
                <div className="relative h-48 bg-gray-100">
                  <img 
                    src={mi.imageUrl} 
                    alt={mi.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">🍽️</div>
                    <div className="text-sm">No image</div>
                  </div>
                </div>
              )}
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">{mi.name}</h3>
                  <span className="font-bold text-lg text-green-600">₹{mi.price}</span>
                </div>
                
                {mi.category && (
                  <div className="text-sm text-blue-600 font-medium mb-2">{mi.category}</div>
                )}
                
                {mi.description && (
                  <div className="text-sm text-gray-600 mb-4 line-clamp-2">{mi.description}</div>
                )}
                
                <div className="flex items-center gap-2 mb-3">
                  <button 
                    onClick={() => remove(mi._id)}
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium text-gray-900">{cart[mi._id] || 0}</span>
                  <button 
                    onClick={() => add(mi._id)}
                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
                
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Special instructions..." 
                  value={notes[mi._id] || ''} 
                  onChange={e => setNotes(n => ({ ...n, [mi._id]: e.target.value }))} 
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button 
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg" 
            onClick={placeOrder} 
            disabled={!slug || Object.keys(cart).length === 0}
          >
            🛒 Place Order ({Object.keys(cart).length} items)
          </button>
        </div>
        
        {orders.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Your Orders</h3>
            <div className="grid gap-4">
              {orders.map(o => (
                <div key={o._id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        o.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'ACCEPTED' ? 'bg-yellow-100 text-yellow-800' :
                        o.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-800' :
                        o.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        o.status === 'DELIVERED' ? 'bg-purple-100 text-purple-800' :
                        o.status === 'PAID' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {o.status}
                      </span>
                      <span className="font-semibold text-gray-900">₹{o.totalAmount}</span>
                    </div>
                    {['NEW','ACCEPTED'].includes(o.status) && (
                      <button 
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" 
                        onClick={() => cancelOrder(o._id)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {o.items.map((it: any, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 flex justify-between">
                        <span>{it.nameSnapshot}</span>
                        <span className="font-medium">× {it.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {message && (
          <div className="mt-4 text-center">
            <p className="text-green-700 font-medium">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}


