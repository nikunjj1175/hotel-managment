import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { Table } from '../../../server/models';
import { requireAuth } from '../../../server/auth';

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve) => fn(req, res, resolve));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDb();
  await runMiddleware(req, res, requireAuth(['SUPER_ADMIN','ADMIN']));
  if (req.method === 'GET') {
    const tables = await Table.find().sort({ tableNumber: 1 });
    return res.json(tables);
  }
  if (req.method === 'POST') {
    const table = await Table.create(req.body);
    return res.json(table);
  }
  if (req.method === 'PUT') {
    const updated = await Table.findByIdAndUpdate((req.query as any).id, req.body, { new: true });
    return res.json(updated);
  }
  return res.status(405).end();
}


