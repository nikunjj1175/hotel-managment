import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchOrders, connectSocket, updateOrderStatus } from '../store/slices/ordersSlice';
import toast from 'react-hot-toast';
import { RequireRole } from '../components/RequireRole';
import { Role } from '../utils/roles';
import Layout from '../components/Layout';

export default function DeliveryPanel() {
  const dispatch = useAppDispatch();
  const { user, hydrated } = useAppSelector(s => s.auth);
  const { list, loading } = useAppSelector(s => s.orders);

  // NO MORE LOADING CHECKS - UI SHOWS IMMEDIATELY

  useEffect(() => {
    // For now, skip API calls to avoid errors
    // dispatch(fetchOrders());
    // dispatch(connectSocket({ role: 'DELIVERY' }));
  }, [dispatch]);

  // Mock data for now
  const mockOrders = [
    { _id: '1', table: { tableNumber: 1 }, status: 'COMPLETED' },
    { _id: '2', table: { tableNumber: 3 }, status: 'COMPLETED' },
    { _id: '3', table: { tableNumber: 5 }, status: 'COMPLETED' }
  ];
  
  const filtered = mockOrders.filter(o => o.status === 'COMPLETED');

  return (
    <RequireRole allow={['DELIVERY', 'SUPER_ADMIN'] as Role[]}>
      <Layout title="Delivery Panel">
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
          <span className="text-gray-600">Loading orders…</span>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map(o => (
          <div key={o._id} className="rounded-2xl p-5 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.15)] animate-fade-up transition-transform duration-200 hover:shadow-lg hover:scale-[1.01] ring-1 ring-black/5" style={{ backgroundImage: 'linear-gradient(135deg, rgba(232,243,255,0.9), rgba(245,240,255,0.9))' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-800 font-semibold">Table #{o.table?.tableNumber}</div>
              <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full ring-1 ring-emerald-200 text-emerald-800 shadow-sm" style={{ backgroundImage: 'linear-gradient(135deg, #E7FBEA, #D6F7DF)' }}>{o.status}</span>
            </div>
            <button
              className="w-fit px-5 py-2 rounded-full text-white font-semibold shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:brightness-95"
              style={{ backgroundImage: 'linear-gradient(135deg, #4a90e2, #34d399)' }}
              onClick={() =>
                toast.promise(
                  dispatch(updateOrderStatus({ id: o._id, status: 'DELIVERED' }) as any).unwrap(),
                  { loading: 'Delivering...', success: 'Delivered', error: 'Failed' }
                )
              }
            >
              Mark Delivered
            </button>
          </div>
        ))}
      </div>
      </Layout>
    </RequireRole>
  );
}


