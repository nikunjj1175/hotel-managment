import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { connectDb } from '../../../server/db';
import { User } from '../../../server/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDb();
    
    const { name, email, password, role} = req.body || {};

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, email, password, role' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password validation (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Check if email already exists
    const existingUser = await (User as any).findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Check if SUPER_ADMIN already exists (optional - remove if you want multiple super admins)
    const existingSuperAdmin = await (User as any).findOne({ role: 'SUPER_ADMIN' });
    if (existingSuperAdmin) {
      return res.status(409).json({ 
        message: 'SUPER_ADMIN already exists. Only one SUPER_ADMIN is allowed.' 
      });
    }

    // Create new SUPER_ADMIN user
    const newSuperAdmin = await (User as any).create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: 'SUPER_ADMIN'
    });

    // Return success response (without password)
    res.status(201).json({
      message: 'SUPER_ADMIN registered successfully',
      user: {
        id: newSuperAdmin._id,
        name: newSuperAdmin.name,
        email: newSuperAdmin.email,
        role: newSuperAdmin.role,
        createdAt: newSuperAdmin.createdAt
      }
    });

  } catch (error) {
    console.error('Error registering SUPER_ADMIN:', error);
    res.status(500).json({ 
      message: 'Internal server error while registering SUPER_ADMIN' 
    });
  }
}
