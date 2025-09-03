import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { RequireRole } from '../components/RequireRole';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { useAppSelector } from '../store';

type MetricCard = { label: string; value: string | number; sub?: string };

export default function SuperAdminAnalytics() {
  const { token } = useAppSelector(s => s.auth);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    monthlyRevenue: [] as { month: string; revenue: number }[],
    newCafesPerMonth: [] as { month: string; count: number }[],
    activeVsInactive: { active: 0, inactive: 0 },
    cafeWiseRevenue: [] as { cafe: string; revenue: number }[],
    roleOrders: [] as { role: string; orders: number }[],
    topMenu: [] as { name: string; count: number }[],
    uptime: [] as { time: string; percent: number }[],
    cards: [] as MetricCard[]
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const [cafesRes, ordersRes] = await Promise.all([
          axios.get('/api/cafes', { headers }).catch(() => ({ data: [] })),
          axios.get('/api/orders', { headers }).catch(() => ({ data: [] }))
        ]);

        const cafes: any[] = Array.isArray(cafesRes.data) ? cafesRes.data : [];
        const orders: any[] = Array.isArray(ordersRes.data) ? ordersRes.data : [];

        // Monthly revenue from orders
        const monthlyMap: Record<string, number> = {};
        const cafeRevenueMap: Record<string, number> = {};
        const itemCountMap: Record<string, number> = {};
        for (const o of orders) {
          const created = o.createdAt ? new Date(o.createdAt) : new Date();
          const ym = created.toISOString().slice(0,7);
          const lineTotal = (o.items || []).reduce((s: number, it: any) => {
            const price = typeof it.priceSnapshot === 'number' ? it.priceSnapshot : (it.price || 0);
            const qty = typeof it.quantity === 'number' ? it.quantity : 1;
            const name = it.nameSnapshot || it.name;
            if (name) itemCountMap[name] = (itemCountMap[name] || 0) + qty;
            return s + price * qty;
          }, 0);
          monthlyMap[ym] = (monthlyMap[ym] || 0) + lineTotal;
          const cafeId = o.cafeId || o.table?.cafe || o.table?.cafeId;
          if (cafeId) cafeRevenueMap[cafeId] = (cafeRevenueMap[cafeId] || 0) + lineTotal;
        }

        const monthlyRevenue = Object.entries(monthlyMap)
          .sort(([a],[b]) => a.localeCompare(b))
          .map(([month, revenue]) => ({ month, revenue }));

        // New cafes per month and active vs inactive
        const cafesPerMonth: Record<string, number> = {};
        let active = 0; let inactive = 0;
        for (const c of cafes) {
          const ym = (c.createdAt ? new Date(c.createdAt) : new Date()).toISOString().slice(0,7);
          cafesPerMonth[ym] = (cafesPerMonth[ym] || 0) + 1;
          if (c.paymentStatus === 'ACTIVE') active++; else inactive++;
        }
        const newCafesPerMonth = Object.entries(cafesPerMonth)
          .sort(([a],[b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }));

        // Cafe-wise revenue join with names
        const idToName: Record<string, string> = {};
        for (const c of cafes) idToName[c._id] = c.name;
        const cafeWiseRevenue = Object.entries(cafeRevenueMap)
          .map(([id, revenue]) => ({ cafe: idToName[id] || 'Unknown', revenue }))
          .sort((a,b) => b.revenue - a.revenue)
          .slice(0, 12);

        // Role orders (approximate mapping from orderStatus)
        const roleCounts: Record<string, number> = { Kitchen: 0, Waiter: 0, Delivery: 0 };
        for (const o of orders) {
          const s = (o.orderStatus || o.status || '').toUpperCase();
          if (['ACCEPTED','COOKING','IN_PROGRESS','READY','NEW'].includes(s)) roleCounts.Kitchen++;
          else if (['PENDING'].includes(s)) roleCounts.Waiter++;
          else if (['COMPLETED','DELIVERED'].includes(s)) roleCounts.Delivery++;
        }
        const roleOrders = Object.entries(roleCounts).map(([role, orders]) => ({ role, orders }));

        // Top menu items
        const topMenu = Object.entries(itemCountMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a,b) => b.count - a.count)
          .slice(0, 5);

        setMetrics({
          monthlyRevenue,
          newCafesPerMonth,
          activeVsInactive: { active, inactive },
          cafeWiseRevenue,
          roleOrders,
          topMenu,
          uptime: [],
          cards: [
            { label: 'Active Users', value: 0 },
            { label: 'Total Cafes', value: cafes.length },
            { label: 'Subscriptions', value: active },
            { label: 'Errors', value: 0 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const pieData = useMemo(() => ([
    { name: 'Active', value: metrics.activeVsInactive.active },
    { name: 'Inactive', value: metrics.activeVsInactive.inactive }
  ]), [metrics.activeVsInactive]);

  const COLORS = ['#10b981', '#ef4444', '#6366f1', '#f59e0b', '#3b82f6'];

  return (
    <RequireRole allow={['SUPER_ADMIN']}>
      <Layout title="Analytics">
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metrics.cards.map((c, i) => (
              <div key={c.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="text-sm text-gray-500">{c.label}</div>
                <div className="text-2xl font-bold mt-1">{c.value}</div>
                {c.sub && <div className="text-xs text-gray-400 mt-1">{c.sub}</div>}
              </div>
            ))}
          </motion.div>

          {/* Revenue & Subscriptions */}
          <Section title="Revenue & Subscriptions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Monthly Revenue (Line)">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={metrics.monthlyRevenue} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="New Cafes per Month (Bar)">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={metrics.newCafesPerMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </Section>

          {/* Cafe Performance */}
          <Section title="Cafe Performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Active vs Inactive (Pie)">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Cafe-wise Revenue (Bar)">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={metrics.cafeWiseRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cafe" interval={0} angle={-25} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#22c55e" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </Section>

          {/* Orders & Menu Insights */}
          <Section title="Orders & Menu Insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Orders by Role (Bar)">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={metrics.roleOrders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#f59e0b" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top 5 Menu Items">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={metrics.topMenu}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#ec4899" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </Section>

          {/* System Health */}
          <Section title="System Health">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Uptime % (Line)">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={metrics.uptime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="percent" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <div className="grid grid-cols-2 gap-4">
                {metrics.cards.map((c) => (
                  <div key={`health-${c.label}`} className="bg-white rounded-2xl p-5 border border-gray-100">
                    <div className="text-sm text-gray-500">{c.label}</div>
                    <div className="text-2xl font-bold mt-1">{c.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {loading && <div className="text-sm text-gray-500">Loading analytics...</div>}
        </div>
      </Layout>
    </RequireRole>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="text-[15px] font-semibold text-gray-900 mb-3">{title}</div>
      <div className="h-[280px]">
        {children}
      </div>
    </div>
  );
}


