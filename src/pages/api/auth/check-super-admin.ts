import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { User } from '../../../server/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDb();
    
    // Check if any SUPER_ADMIN exists
    const superAdmin = await (User as any).findOne({ role: 'SUPER_ADMIN' });
    
    res.json({
      exists: !!superAdmin,
      count: superAdmin ? 1 : 0,
      message: superAdmin ? 'SUPER_ADMIN exists' : 'No SUPER_ADMIN found'
    });

  } catch (error) {
    console.error('Error checking SUPER_ADMIN:', error);
    res.status(500).json({ 
      message: 'Internal server error while checking SUPER_ADMIN',
      exists: false
    });
  }
}
