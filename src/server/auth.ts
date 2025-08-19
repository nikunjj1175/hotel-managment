import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export function signToken(payload: any) {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function signAccessToken(payload: any) {
  const secret = process.env.JWT_SECRET || 'secret';
  // 30 minutes access token
  return jwt.sign(payload, secret, { expiresIn: '30m' });
}

export function signRefreshToken(payload: any) {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'secret';
  // 7 days refresh token
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyRefreshToken(token: string) {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'secret';
  return jwt.verify(token, secret) as any;
}

export function setRefreshCookie(res: NextApiResponse, token: string) {
  const cookie = serialize('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  });
  res.setHeader('Set-Cookie', cookie);
}

export function clearRefreshCookie(res: NextApiResponse) {
  const cookie = serialize('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
  res.setHeader('Set-Cookie', cookie);
}

export function requireAuth(roles?: string[]) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      if (!token) return res.status(401).json({ message: 'Unauthorized' });
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      // @ts-ignore
      (req as any).user = payload;
      if (roles && roles.length && !roles.includes(payload.role)) return res.status(403).json({ message: 'Forbidden' });
      next();
    } catch {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}


