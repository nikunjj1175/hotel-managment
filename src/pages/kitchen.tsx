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
      {loading && <p>Loading...</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map(o => (
          <div key={o._id} className="border rounded bg-white p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div>Table #{o.table?.tableNumber} — <b>{o.status}</b></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {o.status === 'NEW' && <button onClick={() => toast.promise(dispatch(updateOrderStatus({ id: o._id, status: 'ACCEPTED' }) as any).unwrap(), { loading: 'Accepting...', success: 'Accepted', error: 'Failed' })}>Accept</button>}
              {(o.status === 'NEW' || o.status === 'ACCEPTED') && <button onClick={() => toast.promise(dispatch(updateOrderStatus({ id: o._id, status: 'IN_PROGRESS' }) as any).unwrap(), { loading: 'Updating...', success: 'In progress', error: 'Failed' })}>Mark In Progress</button>}
              {o.status !== 'COMPLETED' && <button onClick={() => toast.promise(dispatch(updateOrderStatus({ id: o._id, status: 'COMPLETED' }) as any).unwrap(), { loading: 'Completing...', success: 'Completed', error: 'Failed' })}>Mark Completed</button>}
            </div>
            <ul className="mt-3 list-disc ml-5 text-sm text-gray-700">
              {o.items.map((it, idx) => <li key={idx}>{it.nameSnapshot} × {it.quantity}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Layout>
    </RequireRole>
  );
}


