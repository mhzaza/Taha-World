// Types for Cloudinary upload results
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
  created_at: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  };
  public_id?: string;
  overwrite?: boolean;
  resource_type?: 'image' | 'video' | 'raw';
}

// Client-side upload function using our backend API
export const uploadToCloudinary = async (
  file: File,
  uploadType: 'courseThumbnail' | 'userAvatar' | 'courseVideo' | 'lessonImage' | 'general' = 'general'
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  
  // Determine the field name based on upload type
  let fieldName = 'file';
  if (uploadType === 'courseThumbnail') fieldName = 'thumbnail';
  else if (uploadType === 'userAvatar') fieldName = 'avatar';
  else if (uploadType === 'courseVideo') fieldName = 'video';
  
  formData.append(fieldName, file);

  try {
    // Use our backend API endpoint
    const endpoint = uploadType === 'courseThumbnail' ? '/api/upload/course-thumbnail' :
                    uploadType === 'userAvatar' ? '/api/upload/avatar' :
                    uploadType === 'courseVideo' ? '/api/upload/lesson-video' :
                    '/api/upload/single';

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
    const baseUrl = API_BASE_URL.replace('/api', ''); // Remove /api suffix for upload endpoints
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.arabic || errorData.error || 'Upload failed');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.arabic || result.error || 'Upload failed');
    }

    // Extract the file data from the response
    const fileData = result.data[fieldName] || result.data.file;
    return fileData;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Generate optimized URL with transformations
export const getCloudinaryUrl = (
  publicId: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
    effect?: string;
  }
): string => {
  let url = `https://res.cloudinary.com/dkcui067d/image/upload`;
  
  if (transformations) {
    const transforms: string[] = [];
    
    if (transformations.width) transforms.push(`w_${transformations.width}`);
    if (transformations.height) transforms.push(`h_${transformations.height}`);
    if (transformations.crop) transforms.push(`c_${transformations.crop}`);
    if (transformations.quality) transforms.push(`q_${transformations.quality}`);
    if (transformations.format) transforms.push(`f_${transformations.format}`);
    if (transformations.effect) transforms.push(`e_${transformations.effect}`);
    
    if (transforms.length > 0) {
      url += `/${transforms.join(',')}`;
    }
  }
  
  return `${url}/${publicId}`;
};

// Preset configurations for different use cases
export const uploadPresets = {
  courseThumbnail: {
    folder: 'courses/thumbnails',
    transformation: {
      width: 400,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      format: 'webp',
    },
  },
  userAvatar: {
    folder: 'users/avatars',
    transformation: {
      width: 200,
      height: 200,
      crop: 'fill',
      quality: 'auto',
      format: 'webp',
    },
  },
  courseVideo: {
    folder: 'courses/videos',
    resource_type: 'video',
    transformation: {
      quality: 'auto',
      format: 'mp4',
    },
  },
  lessonImage: {
    folder: 'lessons/images',
    transformation: {
      width: 800,
      height: 600,
      crop: 'fill',
      quality: 'auto',
      format: 'webp',
    },
  },
};

// Utility function to extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string | null => {
  const regex = /\/v\d+\/(.+?)\.(jpg|jpeg|png|gif|webp|mp4|mov)$/i;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Delete file from Cloudinary using our backend API
export const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> => {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
    const baseUrl = API_BASE_URL.replace('/api', '');
    const response = await fetch(`${baseUrl}/api/upload/${publicId}?resourceType=${resourceType}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.arabic || errorData.error || 'Delete failed');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.arabic || result.error || 'Delete failed');
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Delete file from Cloudinary using URL
export const deleteFromCloudinaryByUrl = async (url: string, resourceType: 'image' | 'video' = 'image'): Promise<void> => {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
    const baseUrl = API_BASE_URL.replace('/api', '');
    const response = await fetch(`${baseUrl}/api/upload/url`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ url, resourceType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.arabic || errorData.error || 'Delete failed');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.arabic || result.error || 'Delete failed');
    }
  } catch (error) {
    console.error('Cloudinary delete by URL error:', error);
    throw error;
  }
};
