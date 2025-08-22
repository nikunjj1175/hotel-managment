import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchOrders, connectSocket, updateOrderStatus } from '../store/slices/ordersSlice';
import toast from 'react-hot-toast';
import { RequireRole } from '../components/RequireRole';
import Layout from '../components/Layout';

export default function KitchenPanel() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector(s => s.orders);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(connectSocket({ role: 'KITCHEN' }));
  }, [dispatch]);

  const filtered = list.filter(o => ['NEW','ACCEPTED','IN_PROGRESS'].includes(o.status));

  return (
    <RequireRole allow={["KITCHEN","SUPER_ADMIN","ADMIN"] as any}>
    <Layout title="Kitchen Panel">
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
          <span className="text-gray-600">Loading orders…</span>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map(o => (
          <div key={o._id} className="rounded-2xl bg-white/90 backdrop-blur ring-1 ring-black/5 p-5 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.15)] animate-fade-up">
            <div className="flex justify-between items-center mb-3">
              <div className="text-slate-800 font-semibold">Table #{o.table?.tableNumber}</div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                o.status === 'NEW' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' :
                o.status === 'ACCEPTED' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' :
                o.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' :
                'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              }`}>{o.status.replace('_',' ')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {o.status === 'NEW' && (
                <button className="btn-primary" onClick={() => toast.promise(dispatch(updateOrderStatus({ id: o._id, status: 'ACCEPTED' }) as any).unwrap(), { loading: 'Accepting...', success: 'Accepted', error: 'Failed' })}>Accept</button>
              )}
              {(o.status === 'NEW' || o.status === 'ACCEPTED') && (
                <button className="btn-warning" onClick={() => toast.promise(dispatch(updateOrderStatus({ id: o._id, status: 'IN_PROGRESS' }) as any).unwrap(), { loading: 'Updating...', success: 'In progress', error: 'Failed' })}>Mark In Progress</button>
              )}
              {o.status !== 'COMPLETED' && (
                <button className="btn-success" onClick={() => toast.promise(dispatch(updateOrderStatus({ id: o._id, status: 'COMPLETED' }) as any).unwrap(), { loading: 'Completing...', success: 'Completed', error: 'Failed' })}>Mark Completed</button>
              )}
            </div>
            <ul className="mt-4 list-disc ml-5 text-sm text-gray-700">
              {o.items.map((it, idx) => <li key={idx}>{it.nameSnapshot} × {it.quantity}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Layout>
    </RequireRole>
  );
}


