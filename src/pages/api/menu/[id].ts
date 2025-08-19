import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { MenuItem } from '../../../server/models';
import { requireAuth } from '../../../server/auth';

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve) => fn(req, res, resolve));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDb();
  await runMiddleware(req, res, requireAuth(['SUPER_ADMIN','ADMIN']));
  const id = req.query.id as string;
  if (req.method === 'PUT') {
    const updated = await (MenuItem as any).findByIdAndUpdate(id, req.body, { new: true });
    return res.json(updated);
  }
  if (req.method === 'DELETE') {
    await (MenuItem as any).findByIdAndDelete(id);
    return res.json({ ok: true });
  }
  return res.status(405).end();
}


