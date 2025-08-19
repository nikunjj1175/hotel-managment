import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { Table, MenuItem } from '../../../server/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  await connectDb();
  const tables = Array.from({ length: 8 }).map((_, i) => ({ tableNumber: i + 1, slug: `table-${i + 1}` }));
  for (const t of tables) {
    await Table.updateOne({ tableNumber: t.tableNumber }, { $setOnInsert: t }, { upsert: true });
  }
  const menu = [
    { name: 'Margherita Pizza', price: 250, category: 'Pizza' },
    { name: 'Paneer Tikka', price: 180, category: 'Starter' },
    { name: 'Masala Dosa', price: 120, category: 'South Indian' },
    { name: 'Chai', price: 30, category: 'Beverage' }
  ];
  for (const m of menu) {
    await MenuItem.updateOne({ name: m.name }, { $setOnInsert: { ...m, isAvailable: true } }, { upsert: true });
  }
  const tblCount = await Table.countDocuments();
  const menuCount = await MenuItem.countDocuments();
  res.json({ tables: tblCount, menu: menuCount });
}


