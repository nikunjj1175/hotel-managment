import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../../server/db';
import { Order } from '../../../../server/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  await connectDb();
  const { tableSlug } = req.body || {};
  if (!tableSlug) return res.status(400).json({ message: 'Missing tableSlug' });
  const order = await (Order as any).findById(req.query.id as string).populate('table');
  if (!order) return res.status(404).json({ message: 'Not found' });
  // @ts-ignore
  if (!order.table || order.table.slug !== tableSlug) return res.status(403).json({ message: 'Forbidden' });
  // only allow cancel from table for early stages
  // @ts-ignore
  if (!['NEW','ACCEPTED'].includes(order.status)) return res.status(400).json({ message: 'Cannot cancel at this stage' });
  // @ts-ignore
  order.status = 'CANCELLED';
  await order.save();
  const io = (global as any).io || (global as any).socketServer?.io || undefined;
  if (io) {
    io.to('role:ADMIN').emit('orders:update', order);
    io.to('role:KITCHEN').emit('orders:update', order);
  }
  return res.json(order);
}


