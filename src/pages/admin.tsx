import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchOrders, connectSocket, updateOrderStatus } from '../store/slices/ordersSlice';
import { RequireRole } from '../components/RequireRole';
import Layout from '../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector(s => s.orders);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(connectSocket({ role: 'ADMIN' }));
  }, [dispatch]);

  const [pay, setPay] = useState<{ amount: number; method: 'CASH'|'CARD'|'UPI'; reference?: string }>({ amount: 0, method: 'CASH' });

  const payNow = async (id: string, due: number) => {
    await toast.promise(
      axios.post(`/api/orders/${id}/pay`, { amount: pay.amount || due, method: pay.method, reference: pay.reference }),
      { loading: 'Collecting payment...', success: 'Payment recorded', error: 'Payment failed' }
    );
    dispatch(fetchOrders());
  };

  return (
    <RequireRole allow={["ADMIN","SUPER_ADMIN"] as any}>
    <Layout title="Admin Dashboard">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/admin/tables">Manage Tables & QR</Link>
        <span className="text-gray-400">|</span>
        <Link href="/admin/menu">Manage Menu</Link>
      </div>
      {loading && <p>Loading...</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map(o => (
          <div key={o._id} className="border rounded bg-white p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>Table #{o.table?.tableNumber} — <b>{o.status}</b></div>
              <div className="font-semibold">₹{o.totalAmount}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => dispatch(updateOrderStatus({ id: o._id, status: 'ACCEPTED' }))}>ACCEPTED</button>
              <button className="bg-red-600 hover:bg-red-700" onClick={() => dispatch(updateOrderStatus({ id: o._id, status: 'CANCELLED' }))}>CANCEL</button>
              {['IN_PROGRESS','COMPLETED','DELIVERED','PAID'].map(s => (
                <button key={s} onClick={() => dispatch(updateOrderStatus({ id: o._id, status: s as any }))}>{s}</button>
              ))}
            </div>
            <div className="mt-3">
              <div className="font-semibold mb-1">Payment</div>
              <div className="flex flex-wrap items-center gap-2">
                <input className="w-32" type="number" placeholder="Amount" onChange={e => setPay(p => ({ ...p, amount: Number(e.target.value) }))} />
                <select onChange={e => setPay(p => ({ ...p, method: e.target.value as any }))}>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                </select>
                <input placeholder="Reference (optional)" onChange={e => setPay(p => ({ ...p, reference: e.target.value }))} />
                <button onClick={() => payNow(o._id, Math.max(0, (o.totalAmount || 0) - (o as any).paidAmount || 0))}>Collect</button>
              </div>
            </div>
            <ul className="mt-3 list-disc ml-5 text-sm text-gray-700">
              {o.items.map((it, idx) => <li key={idx}>{it.nameSnapshot} × {it.quantity} — ₹{(it.priceSnapshot || 0) * it.quantity}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Layout>
    </RequireRole>
  );
}


