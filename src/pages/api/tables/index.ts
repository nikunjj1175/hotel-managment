import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { Table } from '../../../server/models';
import { requireAuth } from '../../../server/auth';

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve) => fn(req, res, resolve));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDb();
  if (req.method === 'GET') {
    const user = (req as any).user || {};
    const cafeIdParam = (req.query as any).cafeId as string | undefined;
    const query: any = user.cafeId ? { cafeId: user.cafeId } : (cafeIdParam ? { cafeId: cafeIdParam } : {});
    const tables = await (Table as any).find(query).sort({ tableNumber: 1 });
    return res.json(tables);
  }
  if (req.method === 'POST') {
    const user = (req as any).user || {};
    const { tableNumber, slug, cafeId } = (req.body || {}) as any;
    if (!tableNumber) return res.status(400).json({ message: 'tableNumber required' });
    const finalSlug = slug && String(slug).trim().length ? String(slug).trim() : `table-${tableNumber}`;
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const qrCode = `${base}/table/${finalSlug}`;
    const payload = {
      cafeId: user.cafeId || cafeId,
      tableNumber,
      slug: finalSlug,
      qrCode,
      isActive: true,
    };
    if (!payload.cafeId) return res.status(400).json({ message: 'cafeId required' });
    const table = await (Table as any).create(payload);
    return res.json(table);
  }
  if (req.method === 'PUT') {
    const updated = await (Table as any).findByIdAndUpdate((req.query as any).id, req.body, { new: true });
    return res.json(updated);
  }
  return res.status(405).end();
}


