import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteCloudinaryImage = async (publicId: string): Promise<boolean> => {
  try {
    if (!publicId) return true;
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image from Cloudinary: ${publicId}`, result);
    return true;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

export const uploadImageToCloudinary = async (
  imageBuffer: Buffer,
  adminName: string,
  menuName: string
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    // Create admin-specific folder name (sanitized)
    const adminFolderName = adminName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const sanitizedMenuName = menuName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    
    // Create unique image name with timestamp
    const timestamp = Date.now();
    const imageName = `${sanitizedMenuName}_${timestamp}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `hotel-management/${adminFolderName}`,
        public_id: imageName,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as any);
      }
    );

    uploadStream.end(imageBuffer);
  });
};
