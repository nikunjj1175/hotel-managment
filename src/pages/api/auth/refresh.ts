import type { NextApiRequest, NextApiResponse } from 'next';
import { signAccessToken, verifyRefreshToken } from '../../../server/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const token = (req.cookies as any)?.refresh_token;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const payload = verifyRefreshToken(token) as any;
    // Ensure consistent payload structure for access token
    const tokenPayload = {
      userId: payload.userId || payload.id,
      role: payload.role,
      name: payload.name,
      cafeId: payload.cafeId
    };
    const access = signAccessToken(tokenPayload);
    return res.json({ token: access });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}




