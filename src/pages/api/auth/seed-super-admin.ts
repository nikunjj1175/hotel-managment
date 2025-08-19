import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { User } from '../../../server/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  await connectDb();
  const email = process.env.SUPER_ADMIN_EMAIL || 'super@admin.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'password';
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';
  const existing = await (User as any).findOne({ email });
  if (existing) return res.json({ message: 'Super admin exists', id: existing._id });
  const user = await (User as any).create({ name, email, password, role: 'SUPER_ADMIN' });
  res.json({ message: 'Seeded', id: user._id, email });
}


