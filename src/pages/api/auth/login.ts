import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { User } from '../../../server/models';
import { signAccessToken } from '../../../server/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { email, username, password } = req.body || {};
  const identifier = (email || username || '').toString().trim();
  if (!identifier || !password) return res.status(400).json({ message: 'Missing email/username or password' });

  try {
    await connectDb();
    // Case-insensitive lookup by email/username/name
    const esc = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const ci = new RegExp(`^${esc}$`, 'i');
    const dbUser: any = await (User as any).findOne({ $or: [{ email: ci }, { username: ci }, { name: ci }] });
    if (!dbUser) return res.status(400).json({ message: 'Invalid credentials' });

    const bcrypt = await import('bcryptjs');
    let ok = false;
    try {
      ok = await bcrypt.compare(password, dbUser.password);
    } catch {
      ok = false;
    }

    // Support legacy plaintext password (upgrade to hash on first successful login)
    if (!ok && typeof dbUser.password === 'string' && dbUser.password === password) {
      const salt = await bcrypt.genSalt(10);
      dbUser.password = await bcrypt.hash(password, salt);
      await dbUser.save();
      ok = true;
    }

    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signAccessToken({ userId: dbUser._id, role: dbUser.role, name: dbUser.name, cafeId: dbUser.cafeId });

    const safeUser = {
      _id: String(dbUser._id),
      name: dbUser.name,
      role: dbUser.role,
      email: dbUser.email,
      cafeId: dbUser.cafeId || null,
      permissions: dbUser.permissions || [],
      status: dbUser.status || 'ACTIVE'
    };

    return res.json({ token, user: safeUser });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

