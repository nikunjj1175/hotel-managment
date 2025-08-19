import type { NextApiRequest, NextApiResponse } from 'next';
import { clearRefreshCookie } from '../../../server/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  clearRefreshCookie(res);
  res.json({ ok: true });
}




