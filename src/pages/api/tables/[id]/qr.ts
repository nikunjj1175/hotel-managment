import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../../server/db';
import { Table } from '../../../../server/models';
import QRCode from 'qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  await connectDb();
  const table = await (Table as any).findById(req.query.id as string);
  if (!table) return res.status(404).json({ message: 'Not found' });
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = `${base}/table/${table.slug}`;
  const png = await QRCode.toBuffer(url, { type: 'png', margin: 1, width: 300 });
  res.setHeader('Content-Type', 'image/png');
  res.send(png);
}


