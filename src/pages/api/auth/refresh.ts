import type { NextApiRequest, NextApiResponse } from 'next';
import { signAccessToken, verifyRefreshToken } from '../../../server/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const token = (req.cookies as any)?.refresh_token;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const payload = verifyRefreshToken(token) as any;
    const access = signAccessToken({ id: payload.id, role: payload.role, name: payload.name });
    return res.json({ token: access });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}


