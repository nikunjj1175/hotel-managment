import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../../server/db';
import { Order } from '../../../../server/models';
import { requireAuth } from '../../../../server/auth';

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve) => fn(req, res, resolve));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  await connectDb();
  await runMiddleware(req, res, requireAuth(['SUPER_ADMIN','ADMIN']));
  const { method, amount, reference } = req.body || {};
  const order = await Order.findById(req.query.id as string);
  if (!order) return res.status(404).json({ message: 'Not found' });
  // @ts-ignore
  order.payments.push({ method, amount, reference });
  // @ts-ignore
  order.paidAmount = (order.paidAmount || 0) + Number(amount || 0);
  // @ts-ignore
  if (order.paidAmount >= order.totalAmount) order.status = 'PAID';
  await order.save();
  const io = (global as any).io || (global as any).socketServer?.io || undefined;
  if (io) io.to('role:ADMIN').emit('orders:update', order);
  return res.json(order);
}


