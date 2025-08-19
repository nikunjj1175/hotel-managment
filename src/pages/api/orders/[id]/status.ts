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
  await runMiddleware(req, res, requireAuth(['SUPER_ADMIN','ADMIN','KITCHEN','DELIVERY']));
  const { status } = req.body || {};
  const order = await (Order as any).findById(req.query.id as string).populate('table');
  if (!order) return res.status(404).json({ message: 'Not found' });
  const allowedNext: any = {
    NEW: ['ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED'],
    ACCEPTED: ['IN_PROGRESS','COMPLETED','CANCELLED'],
    IN_PROGRESS: ['COMPLETED','CANCELLED'],
    COMPLETED: ['DELIVERED','CANCELLED'],
    DELIVERED: ['PAID'],
    PAID: [],
    CANCELLED: []
  };
  // @ts-ignore
  const role = (req as any).user.role as string;
  if (!allowedNext[order.status].includes(status) && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
    return res.status(400).json({ message: 'Invalid transition' });
  }
  // @ts-ignore
  order.status = status;
  // @ts-ignore
  if (status === 'ACCEPTED') order.acceptedBy = (req as any).user.id;
  // @ts-ignore
  if (status === 'COMPLETED') order.completedBy = (req as any).user.id;
  // @ts-ignore
  if (status === 'DELIVERED') order.deliveredBy = (req as any).user.id;
  await order.save();
  const io = (global as any).io || (global as any).socketServer?.io || undefined;
  if (io) {
    io.to('role:ADMIN').emit('orders:update', order);
    io.to('role:KITCHEN').emit('orders:update', order);
    io.to('role:DELIVERY').emit('orders:update', order);
  }
  return res.json(order);
}


