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
      {loading && <p>Loading...</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map(o => (
          <div key={o._id} className="border rounded bg-white p-4 shadow-sm">
            <div className="mb-2">Table #{o.table?.tableNumber} — <b>{o.status}</b></div>
            <button onClick={() => toast.promise(dispatch(updateOrderStatus({ id: o._id, status: 'DELIVERED' }) as any).unwrap(), { loading: 'Delivering...', success: 'Delivered', error: 'Failed' })}>Mark Delivered</button>
          </div>
        ))}
      </div>
    </Layout>
    </RequireRole>
  );
}


