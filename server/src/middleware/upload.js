const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Configure multer for memory storage (for Cloudinary uploads)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
  const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocumentTypes];
  
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
          arabic: 'نوع الملف غير مسموح أو حجم الملف كبير جداً'
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          arabic: 'لم يتم رفع أي ملف'
        });
      }
      
      try {
        // Determine upload type based on file type and field name
        let uploadType = 'generalUpload';
        
        if (fieldName === 'thumbnail' || fieldName === 'avatar') {
          uploadType = fieldName === 'thumbnail' ? 'courseThumbnail' : 'userAvatar';
        } else if (req.file.mimetype.startsWith('video/')) {
          uploadType = 'courseVideo';
        } else if (req.file.mimetype.startsWith('image/')) {
          uploadType = 'lessonImage';
        }
        
        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, uploadType);
        
        // Add Cloudinary result to request
        req.cloudinaryResult = result;
        
        next();
      } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
          success: false,
          error: 'Upload failed',
          arabic: 'فشل في رفع الملف'
        });
      }
    });
  };
};

// Middleware for multiple files upload
const uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
          arabic: 'نوع الملف غير مسموح أو حجم الملف كبير جداً'
        });
      }
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded',
          arabic: 'لم يتم رفع أي ملفات'
        });
      }
      
      try {
        const uploadResults = [];
        
        for (const file of req.files) {
          // Determine upload type based on file type
          let uploadType = 'generalUpload';
          
          if (file.mimetype.startsWith('video/')) {
            uploadType = 'courseVideo';
          } else if (file.mimetype.startsWith('image/')) {
            uploadType = 'lessonImage';
          }
          
          // Upload to Cloudinary
          const result = await uploadToCloudinary(file.buffer, uploadType);
          uploadResults.push(result);
        }
        
        // Add Cloudinary results to request
        req.cloudinaryResults = uploadResults;
        
        next();
      } catch (error) {
        console.error('Multiple upload error:', error);
        return res.status(500).json({
          success: false,
          error: 'Upload failed',
          arabic: 'فشل في رفع الملفات'
        });
      }
    });
  };
};

// Middleware for mixed file uploads (different field names)
const uploadFields = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
          arabic: 'نوع الملف غير مسموح أو حجم الملف كبير جداً'
        });
      }
      
      if (!req.files) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded',
          arabic: 'لم يتم رفع أي ملفات'
        });
      }
      
      try {
        const uploadResults = {};
        
        for (const [fieldName, files] of Object.entries(req.files)) {
          if (Array.isArray(files)) {
            // Multiple files for this field
            const fieldResults = [];
            
            for (const file of files) {
              // Determine upload type based on field name and file type
              let uploadType = 'generalUpload';
              
              if (fieldName === 'thumbnail') {
                uploadType = 'courseThumbnail';
              } else if (fieldName === 'avatar') {
                uploadType = 'userAvatar';
              } else if (file.mimetype.startsWith('video/')) {
                uploadType = 'courseVideo';
              } else if (file.mimetype.startsWith('image/')) {
                uploadType = 'lessonImage';
              }
              
              // Upload to Cloudinary
              const result = await uploadToCloudinary(file.buffer, uploadType);
              fieldResults.push(result);
            }
            
            uploadResults[fieldName] = fieldResults;
          } else {
            // Single file for this field
            const file = files;
            
            // Determine upload type based on field name and file type
            let uploadType = 'generalUpload';
            
            if (fieldName === 'thumbnail') {
              uploadType = 'courseThumbnail';
            } else if (fieldName === 'avatar') {
              uploadType = 'userAvatar';
            } else if (file.mimetype.startsWith('video/')) {
              uploadType = 'courseVideo';
            } else if (file.mimetype.startsWith('image/')) {
              uploadType = 'lessonImage';
            }
            
            // Upload to Cloudinary
            const result = await uploadToCloudinary(file.buffer, uploadType);
            uploadResults[fieldName] = result;
          }
        }
        
        // Add Cloudinary results to request
        req.cloudinaryResults = uploadResults;
        
        next();
      } catch (error) {
        console.error('Fields upload error:', error);
        return res.status(500).json({
          success: false,
          error: 'Upload failed',
          arabic: 'فشل في رفع الملفات'
        });
      }
    });
  };
};

// Utility function to delete file from Cloudinary
const deleteCloudinaryFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await deleteFromCloudinary(publicId, resourceType);
    return result;
  } catch (error) {
    console.error('Delete Cloudinary file error:', error);
    throw error;
  }
};

// Error handler for upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        arabic: 'حجم الملف كبير جداً'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        arabic: 'عدد الملفات كبير جداً'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field',
        arabic: 'حقل غير متوقع'
      });
    }
  }
  
  return res.status(500).json({
    success: false,
    error: error.message || 'Upload error',
    arabic: 'خطأ في رفع الملف'
  });
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteCloudinaryFile,
  handleUploadError,
};
