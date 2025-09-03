import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { Cafe } from '../../../server/models';
import { requireAuth } from '../../../server/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDb();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const cafe = await (Cafe as any).findById(id);
      if (!cafe) {
        return res.status(404).json({ message: 'Cafe not found' });
      }
      return res.json(cafe);
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || 'Failed to fetch cafe' });
    }
  }

  if (req.method === 'PUT') {
    await new Promise((resolve, reject) => {
      requireAuth(['SUPER_ADMIN'])(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });
    
    try {
      const cafe = await (Cafe as any).findByIdAndUpdate(id, req.body, { new: true });
      if (!cafe) {
        return res.status(404).json({ message: 'Cafe not found' });
      }
      return res.json(cafe);
    } catch (err: any) {
      return res.status(400).json({ message: err?.message || 'Failed to update cafe' });
    }
  }

  if (req.method === 'DELETE') {
    await new Promise((resolve, reject) => {
      requireAuth(['SUPER_ADMIN'])(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });
    
    try {
      const cafe = await (Cafe as any).findByIdAndDelete(id);
      if (!cafe) {
        return res.status(404).json({ message: 'Cafe not found' });
      }
      return res.json({ message: 'Cafe deleted successfully' });
    } catch (err: any) {
      return res.status(400).json({ message: err?.message || 'Failed to delete cafe' });
    }
  }

  return res.status(405).end();
}

