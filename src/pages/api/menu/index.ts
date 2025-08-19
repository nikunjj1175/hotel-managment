import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { MenuItem } from '../../../server/models';
import { requireAuth } from '../../../server/auth';

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve) => fn(req, res, resolve));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDb();
  if (req.method === 'GET') {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    return res.json(items);
  }
  if (req.method === 'POST') {
    await runMiddleware(req, res, requireAuth(['SUPER_ADMIN','ADMIN']));
    const item = await MenuItem.create(req.body);
    return res.json(item);
  }
  return res.status(405).end();
}


