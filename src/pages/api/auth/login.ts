import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { connectDb } from '../../../server/db';
import { User } from '../../../server/models';
import { signAccessToken, signRefreshToken, setRefreshCookie } from '../../../server/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  await connectDb();
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
  const user = await (User as any).findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const access = signAccessToken({ id: user._id, role: user.role, name: user.name });
  const refresh = signRefreshToken({ id: user._id });
  setRefreshCookie(res, refresh);
  res.json({ token: access, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
}


