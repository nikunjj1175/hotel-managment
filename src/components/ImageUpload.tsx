import React, { useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImageUrl?: string;
  onImageRemove?: () => void;
  className?: string;
}

export default function ImageUpload({ 
  onImageUpload, 
  currentImageUrl, 
  onImageRemove,
  className = '' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        const response = await axios.post('/api/upload-image', {
          imageData,
          fileName: file.name
        });

        if (response.data.success) {
          onImageUpload(response.data.imageUrl);
          toast.success('Image uploaded successfully');
        } else {
          toast.error('Failed to upload image');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`grid gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">Item Image</label>
      <div className="flex items-center gap-4">
        {currentImageUrl && (
          <div className="image-upload-preview">
            <img 
              src={currentImageUrl} 
              alt="Preview" 
              className="w-24 h-24 object-cover rounded border"
            />
            {onImageRemove && (
              <button
                onClick={onImageRemove}
                className="image-upload-remove"
                type="button"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {uploading ? 'Uploading...' : currentImageUrl ? 'Change Image' : 'Upload Image'}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, GIF. Max size: 5MB
      </p>
    </div>
  );
}

