import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { Order, Table } from '../../../server/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  await connectDb();
  const { slug } = req.query as { slug?: string };
  if (!slug) return res.status(400).json({ message: 'Missing slug' });
  const table = await (Table as any).findOne({ slug });
  if (!table) return res.status(404).json({ message: 'Invalid table' });
  const orders = await (Order as any).find({ table: table._id }).sort({ createdAt: -1 });
  return res.json(orders);
}


