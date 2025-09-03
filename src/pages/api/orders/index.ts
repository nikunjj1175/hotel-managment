import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { Order, Table, MenuItem } from '../../../server/models';
import { requireAuth } from '../../../server/auth';

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve) => fn(req, res, resolve));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDb();
  if (req.method === 'POST') {
    const { tableSlug, items } = req.body || {};
    const table = await (Table as any).findOne({ slug: tableSlug });
    if (!table) return res.status(400).json({ message: 'Invalid table' });
    const menuItems = await (MenuItem as any).find({ _id: { $in: items.map((i:any) => i.itemId) } });
    const orderItems = items.map((i:any) => {
      const mi = menuItems.find((m:any) => String(m._id) === i.itemId);
      return { item: i.itemId, nameSnapshot: mi?.name, priceSnapshot: mi?.price, quantity: i.quantity || 1, notes: i.notes || '' };
    });
    const order = await (Order as any).create({ table: table._id, items: orderItems });
    // @ts-ignore
    order.recalculateTotals();
    await order.save();
    // emit
    // @ts-ignore
    const io = (global as any).io || (global as any).socketServer?.io || undefined;
    if (io) {
      io.to('role:ADMIN').emit('orders:new', order);
      io.to('role:KITCHEN').emit('orders:new', order);
    }
    return res.json(order);
  }
  // list (role based)
  await runMiddleware(req, res, requireAuth(['SUPER_ADMIN','ADMIN','KITCHEN','DELIVERY']));
  const role = (req as any).user.role as string;
  const filter: any = {};
  const cafeId = (req.query as any).cafeId as string | undefined;
  if (cafeId) filter.cafeId = cafeId;
  if (role === 'KITCHEN') filter.status = { $in: ['NEW','ACCEPTED','IN_PROGRESS'] };
  if (role === 'DELIVERY') filter.status = 'COMPLETED';
  const orders = await (Order as any).find(filter).populate('table').sort({ createdAt: -1 });
  return res.json(orders);
}


