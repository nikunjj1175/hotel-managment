import type { NextApiRequest, NextApiResponse } from 'next';

// Mock user data for demonstration
const mockUsers = [
  {
    _id: '1',
    name: 'Super Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'SUPER_ADMIN',
    cafeId: null,
    permissions: ['manage_cafes', 'manage_subscriptions', 'view_analytics', 'manage_system_settings', 'view_reports', 'manage_users'],
    status: 'ACTIVE'
  },
  {
    _id: '2',
    name: 'Cafe Manager',
    email: 'cafe@example.com',
    password: 'cafe123',
    role: 'CAFE_ADMIN',
    cafeId: 'cafe1',
    permissions: ['manage_cafe_profile', 'manage_menu', 'manage_tables', 'manage_orders', 'manage_staff', 'view_cafe_analytics', 'manage_payments'],
    status: 'ACTIVE'
  }
];

// Simple JWT-like token generation
function generateToken(payload: any): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadStr = btoa(JSON.stringify(payload));
  const signature = btoa('mock-signature');
  return `${header}.${payloadStr}.${signature}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
  
  // Find user in mock data
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
  // Generate token
  const token = generateToken({ 
    userId: user._id, 
    role: user.role, 
    name: user.name,
    cafeId: user.cafeId 
  });
  
  // Return user data
  res.json({ 
    token, 
    user: { 
      _id: user._id, 
      name: user.name, 
      role: user.role, 
      email: user.email,
      cafeId: user.cafeId,
      permissions: user.permissions,
      status: user.status
    } 
  });
}


