import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchOrders, connectSocket, updateOrderStatus } from '../store/slices/ordersSlice';
import toast from 'react-hot-toast';
import { RequireRole } from '../components/RequireRole';
import Layout from '../components/Layout';

export default function DeliveryPanel() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector(s => s.orders);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(connectSocket({ role: 'DELIVERY' }));
  }, [dispatch]);

  const filtered = list.filter(o => o.status === 'COMPLETED');

  return (
    <RequireRole allow={["DELIVERY","SUPER_ADMIN","ADMIN"] as any}>
    <Layout title="Delivery Panel">
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
          <span className="text-gray-600">Loading orders…</span>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map(o => (
          <div key={o._id} className="rounded-2xl bg-white/90 backdrop-blur ring-1 ring-black/5 p-5 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.15)] animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-800 font-semibold">Table #{o.table?.tableNumber}</div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">{o.status}</span>
            </div>
            <button className="btn-primary" onClick={() => toast.promise(dispatch(updateOrderStatus({ id: o._id, status: 'DELIVERED' }) as any).unwrap(), { loading: 'Delivering...', success: 'Delivered', error: 'Failed' })}>Mark Delivered</button>
          </div>
        ))}
      </div>
    </Layout>
    </RequireRole>
  );
}


