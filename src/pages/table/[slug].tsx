import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchMenu } from '../../store/slices/menuSlice';

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
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Table Order</h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map(mi => (
          <div key={mi._id} className="border rounded bg-white p-3 shadow-sm">
            <div className="flex justify-between items-center">
              <b>{mi.name}</b>
              <span>₹{mi.price}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => remove(mi._id)}>-</button>
              <span className="w-6 text-center">{cart[mi._id] || 0}</span>
              <button onClick={() => add(mi._id)}>+</button>
            </div>
            <input className="mt-2 w-full" placeholder="Notes" value={notes[mi._id] || ''} onChange={e => setNotes(n => ({ ...n, [mi._id]: e.target.value }))} />
          </div>
        ))}
      </div>
      <button className="mt-4" onClick={placeOrder} disabled={!slug || Object.keys(cart).length === 0}>Place Order</button>
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Your Orders</h3>
        <div className="grid gap-3">
          {orders.map(o => (
            <div key={o._id} className="border rounded bg-white p-3 shadow-sm">
              <div className="flex justify-between items-center">
                <div>Status: <b>{o.status}</b> — Total: ₹{o.totalAmount}</div>
                {['NEW','ACCEPTED'].includes(o.status) && (
                  <button className="bg-red-600 hover:bg-red-700" onClick={() => cancelOrder(o._id)}>Cancel</button>
                )}
              </div>
              <ul className="mt-2 list-disc ml-5 text-sm text-gray-700">
                {o.items.map((it: any, idx: number) => <li key={idx}>{it.nameSnapshot} × {it.quantity}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {message && <p className="mt-2 text-green-700">{message}</p>}
    </div>
  );
}


