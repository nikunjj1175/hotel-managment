import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { User } from '../../../server/models';
import { requireAuth } from '../../../server/auth';

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve) => fn(req, res, resolve));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDb();
  await runMiddleware(req, res, requireAuth(['SUPER_ADMIN']));
  if (req.method === 'GET') {
    const users = await (User as any)
      .find({ role: { $ne: 'SUPER_ADMIN' } })
      .sort({ createdAt: -1 })
      .select('-password');
    return res.json(users);
  }
  if (req.method === 'POST') {
    const { name, email, password, role, cafeId } = req.body || {};
    const exists = await (User as any).findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email in use' });
    const user = await (User as any).create({ name, email, password, role, cafeId });
    return res.json({ id: user._id });
  }
  return res.status(405).end();
}


