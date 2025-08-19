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
  if (req.method === 'DELETE') {
    await (User as any).findByIdAndDelete(req.query.id as string);
    return res.json({ ok: true });
  }
  return res.status(405).end();
}


