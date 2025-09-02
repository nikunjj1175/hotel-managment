import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export function signToken(payload: any) {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function signAccessToken(payload: any) {
  const secret = process.env.JWT_SECRET || 'secret';
  // 2 hours access token
  return jwt.sign(payload, secret, { expiresIn: '2h' });
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
      console.log('Auth middleware - Authorization header:', req.headers.authorization);
      console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');
      
      if (!token) return res.status(401).json({ message: 'Unauthorized' });
      
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      console.log('Auth middleware - Token payload:', payload);
      
      // Check if payload has required fields
      if (!payload || !payload.role) {
        console.log('Auth middleware - Invalid payload structure');
        return res.status(401).json({ message: 'Invalid token payload' });
      }
      
      // Normalize the payload to ensure consistent structure
      const normalizedPayload = {
        id: payload.userId || payload.id,
        role: payload.role,
        name: payload.name,
        cafeId: payload.cafeId
      };
      
      console.log('Auth middleware - Normalized payload:', normalizedPayload);
      
      // @ts-ignore
      (req as any).user = normalizedPayload;
      
      if (roles && roles.length && !roles.includes(normalizedPayload.role)) {
        console.log('Auth middleware - Role mismatch. Required:', roles, 'User role:', normalizedPayload.role);
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      console.log('Auth middleware - Authentication successful');
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}


