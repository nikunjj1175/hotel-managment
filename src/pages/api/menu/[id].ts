import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDb } from '../../../server/db';
import { MenuItem } from '../../../server/models';
import { requireAuth } from '../../../server/auth';
import { deleteCloudinaryImage } from '../../../utils/cloudinaryUtils';

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve) => fn(req, res, resolve));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDb();
  await runMiddleware(req, res, requireAuth(['SUPER_ADMIN','ADMIN']));
  const id = req.query.id as string;
  
  if (req.method === 'PUT') {
    try {
      const existingItem = await (MenuItem as any).findById(id);
      
      // If image is being changed and there's an existing image, delete the old one
      if (req.body.imageUrl && req.body.imageUrl !== existingItem?.imageUrl && existingItem?.cloudinaryPublicId) {
        await deleteCloudinaryImage(existingItem.cloudinaryPublicId);
      }
      
      const updated = await (MenuItem as any).findByIdAndUpdate(id, req.body, { new: true });
      return res.json(updated);
    } catch (error) {
      console.error('Error updating menu item:', error);
      return res.status(500).json({ error: 'Failed to update menu item' });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      // Get the menu item before deletion to access its image data
      const menuItem = await (MenuItem as any).findById(id);
      
      if (menuItem && menuItem.cloudinaryPublicId) {
        // Delete image from Cloudinary
        await deleteCloudinaryImage(menuItem.cloudinaryPublicId);
      }
      
      // Delete the menu item from database
      await (MenuItem as any).findByIdAndDelete(id);
      return res.json({ ok: true, message: 'Menu item and associated image deleted successfully' });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      return res.status(500).json({ error: 'Failed to delete menu item' });
    }
  }
  
  return res.status(405).end();
}


