const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dkcui067d',
  api_key: '378168273153864',
  api_secret: 'WVD6FI43h62qKFjCFKxUAYEL4XE',
});

// Upload options for different types of content
const uploadOptions = {
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
  lessonVideo: {
    folder: 'lessons/videos',
    resource_type: 'video',
    transformation: {
      quality: 'auto',
      format: 'mp4',
    },
  },
  generalUpload: {
    folder: 'general',
    transformation: {
      quality: 'auto',
    },
  },
};

/**
 * Upload a file to Cloudinary
 * @param {string|Buffer} file - File path or buffer
 * @param {string} type - Type of upload (courseThumbnail, userAvatar, etc.)
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = async (file, type = 'generalUpload', options = {}) => {
  try {
    const uploadConfig = {
      ...uploadOptions[type],
      ...options,
    };

    let result;
    if (typeof file === 'string') {
      // File path
      result = await cloudinary.uploader.upload(file, uploadConfig);
    } else if (Buffer.isBuffer(file)) {
      // Buffer data - convert to base64 data URI
      const base64Data = file.toString('base64');
      const dataUri = `data:${uploadConfig.resource_type || 'image'}/jpeg;base64,${base64Data}`;
      result = await cloudinary.uploader.upload(dataUri, uploadConfig);
    } else {
      throw new Error('Invalid file type. Expected string (path) or Buffer.');
    }

    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file paths or buffers
 * @param {string} type - Type of upload
 * @param {Object} options - Additional upload options
 * @returns {Promise<Array>} Array of Cloudinary upload results
 */
const uploadMultipleToCloudinary = async (files, type = 'generalUpload', options = {}) => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, type, options));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Generate optimized URL with transformations
 * @param {string} publicId - Public ID of the file
 * @param {Object} transformations - Transformation options
 * @returns {string} Optimized URL
 */
const getCloudinaryUrl = (publicId, transformations = {}) => {
  let url = `https://res.cloudinary.com/dkcui067d/image/upload`;
  
  if (Object.keys(transformations).length > 0) {
    const transforms = [];
    
    if (transformations.width) transforms.push(`w_${transformations.width}`);
    if (transformations.height) transforms.push(`h_${transformations.height}`);
    if (transformations.crop) transforms.push(`c_${transformations.crop}`);
    if (transformations.quality) transforms.push(`q_${transformations.quality}`);
    if (transformations.format) transforms.push(`f_${transformations.format}`);
    if (transformations.effect) transforms.push(`e_${transformations.effect}`);
    if (transformations.angle) transforms.push(`a_${transformations.angle}`);
    
    if (transforms.length > 0) {
      url += `/${transforms.join(',')}`;
    }
  }
  
  return `${url}/${publicId}`;
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null if not found
 */
const extractPublicId = (url) => {
  const regex = /\/v\d+\/(.+?)\.(jpg|jpeg|png|gif|webp|mp4|mov)$/i;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * Get file information from Cloudinary
 * @param {string} publicId - Public ID of the file
 * @param {string} resourceType - Resource type
 * @returns {Promise<Object>} File information
 */
const getCloudinaryFileInfo = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary get file info error:', error);
    throw error;
  }
};

/**
 * Search files in Cloudinary
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
const searchCloudinaryFiles = async (options = {}) => {
  try {
    const result = await cloudinary.search.expression(options.expression || '')
      .sort_by(options.sortBy || 'created_at', 'desc')
      .max_results(options.maxResults || 100)
      .execute();
    return result;
  } catch (error) {
    console.error('Cloudinary search error:', error);
    throw error;
  }
};

/**
 * Create a folder in Cloudinary
 * @param {string} folderName - Name of the folder
 * @returns {Promise<Object>} Creation result
 */
const createCloudinaryFolder = async (folderName) => {
  try {
    // Cloudinary doesn't have a direct folder creation API
    // Folders are created automatically when uploading with folder parameter
    console.log(`Folder "${folderName}" will be created when first file is uploaded to it.`);
    return { success: true, message: `Folder "${folderName}" will be created when first file is uploaded to it.` };
  } catch (error) {
    console.error('Cloudinary folder creation error:', error);
    throw error;
  }
};

/**
 * Get usage statistics from Cloudinary
 * @returns {Promise<Object>} Usage statistics
 */
const getCloudinaryUsage = async () => {
  try {
    const result = await cloudinary.api.usage();
    return result;
  } catch (error) {
    console.error('Cloudinary usage error:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUrl,
  extractPublicId,
  getCloudinaryFileInfo,
  searchCloudinaryFiles,
  createCloudinaryFolder,
  getCloudinaryUsage,
  uploadOptions,
};
