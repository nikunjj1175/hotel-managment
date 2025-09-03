import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { Cafe } from '../../../server/models';
import { requireAuth } from '../../../server/auth';

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve) => fn(req, res, resolve));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDb();

  if (req.method === 'GET') {
    const cafes = await (Cafe as any).find().sort({ createdAt: -1 });
    return res.json(cafes);
  }

  if (req.method === 'POST') {
    try {
      await runMiddleware(req, res, requireAuth(['SUPER_ADMIN']));
      const body = req.body || {};
      console.log('Creating cafe with data:', body);
      const cafe = await (Cafe as any).create(body);
      console.log('Cafe created successfully:', cafe._id);
      return res.json(cafe);
    } catch (err: any) {
      console.error('Error in cafe creation:', err);
      if (err.message === 'Unauthorized' || err.message === 'Forbidden') {
        return res.status(err.message === 'Unauthorized' ? 401 : 403).json({ message: err.message });
      }
      return res.status(400).json({ message: err?.message || 'Failed to create cafe' });
    }
  }

  return res.status(405).end();
}



