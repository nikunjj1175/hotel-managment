import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../server/auth';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUtils';

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve) => fn(req, res, resolve));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, requireAuth(['SUPER_ADMIN', 'ADMIN']));
    
    const { imageData, fileName, menuName } = req.body || {};
    const user = (req as any).user;

    if (!imageData) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    if (!menuName) {
      return res.status(400).json({ message: 'Menu name is required' });
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Cloudinary with admin folder structure
    const result = await uploadImageToCloudinary(buffer, user.name, menuName);

    res.json({
      success: true,
      imageUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
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
