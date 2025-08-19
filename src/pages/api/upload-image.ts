import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../server/auth';

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve) => fn(req, res, resolve));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, requireAuth(['SUPER_ADMIN', 'ADMIN']));
    
    const { imageData, fileName } = req.body || {};

    if (!imageData) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // For now, we'll store the image as base64 data URL
    // In production, you should upload to Cloudinary, AWS S3, or similar
    const imageUrl = imageData;

    res.json({
      success: true,
      imageUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload image' 
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
