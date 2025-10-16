const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple, uploadFields, deleteCloudinaryFile, handleUploadError } = require('../middleware/upload');
const { extractPublicId } = require('../config/cloudinary');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/upload/single
 * @desc    Upload a single file to Cloudinary
 * @access  Private
 */
router.post('/single', authenticate, uploadSingle('file'), async (req, res) => {
  try {
    const result = req.cloudinaryResult;
    
    res.json({
      success: true,
      data: {
        file: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          resource_type: result.resource_type,
          bytes: result.bytes,
          created_at: result.created_at,
        }
      },
      message: 'File uploaded successfully',
      arabic: 'تم رفع الملف بنجاح'
    });
  } catch (error) {
    console.error('Single upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      arabic: 'فشل في رفع الملف'
    });
  }
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files to Cloudinary
 * @access  Private
 */
router.post('/multiple', authenticate, uploadMultiple('files'), async (req, res) => {
  try {
    const results = req.cloudinaryResults;
    
    const files = results.map(result => ({
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
      created_at: result.created_at,
    }));
    
    res.json({
      success: true,
      data: { files },
      message: 'Files uploaded successfully',
      arabic: 'تم رفع الملفات بنجاح'
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      arabic: 'فشل في رفع الملفات'
    });
  }
});

/**
 * @route   POST /api/upload/course-thumbnail
 * @desc    Upload course thumbnail to Cloudinary
 * @access  Private
 */
router.post('/course-thumbnail', authenticate, uploadSingle('thumbnail'), async (req, res) => {
  try {
    const result = req.cloudinaryResult;
    
    res.json({
      success: true,
      data: {
        thumbnail: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          resource_type: result.resource_type,
          bytes: result.bytes,
          created_at: result.created_at,
        }
      },
      message: 'Course thumbnail uploaded successfully',
      arabic: 'تم رفع صورة الكورس بنجاح'
    });
  } catch (error) {
    console.error('Course thumbnail upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      arabic: 'فشل في رفع صورة الكورس'
    });
  }
});

/**
 * @route   POST /api/upload/lesson-video
 * @desc    Upload lesson video to Cloudinary
 * @access  Private
 */
router.post('/lesson-video', authenticate, uploadSingle('video'), async (req, res) => {
  try {
    const result = req.cloudinaryResult;
    
    res.json({
      success: true,
      data: {
        video: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          resource_type: result.resource_type,
          bytes: result.bytes,
          duration: result.duration,
          created_at: result.created_at,
        }
      },
      message: 'Lesson video uploaded successfully',
      arabic: 'تم رفع فيديو الدرس بنجاح'
    });
  } catch (error) {
    console.error('Lesson video upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      arabic: 'فشل في رفع فيديو الدرس'
    });
  }
});

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar to Cloudinary
 * @access  Private
 */
router.post('/avatar', authenticate, uploadSingle('avatar'), async (req, res) => {
  try {
    const result = req.cloudinaryResult;
    
    res.json({
      success: true,
      data: {
        avatar: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          resource_type: result.resource_type,
          bytes: result.bytes,
          created_at: result.created_at,
        }
      },
      message: 'Avatar uploaded successfully',
      arabic: 'تم رفع الصورة الشخصية بنجاح'
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      arabic: 'فشل في رفع الصورة الشخصية'
    });
  }
});

/**
 * @route   POST /api/upload/course-media
 * @desc    Upload course media files (thumbnails, videos, images)
 * @access  Private
 */
router.post('/course-media', authenticate, uploadFields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'videos', maxCount: 10 },
  { name: 'images', maxCount: 20 }
]), async (req, res) => {
  try {
    const results = req.cloudinaryResults;
    
    res.json({
      success: true,
      data: {
        media: results
      },
      message: 'Course media uploaded successfully',
      arabic: 'تم رفع ملفات الكورس بنجاح'
    });
  } catch (error) {
    console.error('Course media upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      arabic: 'فشل في رفع ملفات الكورس'
    });
  }
});

/**
 * @route   DELETE /api/upload/:publicId
 * @desc    Delete file from Cloudinary
 * @access  Private
 */
router.delete('/:publicId', authenticate, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;
    
    const result = await deleteCloudinaryFile(publicId, resourceType);
    
    res.json({
      success: true,
      data: { result },
      message: 'File deleted successfully',
      arabic: 'تم حذف الملف بنجاح'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Delete failed',
      arabic: 'فشل في حذف الملف'
    });
  }
});

/**
 * @route   DELETE /api/upload/url
 * @desc    Delete file from Cloudinary using URL
 * @access  Private
 */
router.delete('/url', authenticate, async (req, res) => {
  try {
    const { url, resourceType = 'image' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
        arabic: 'الرابط مطلوب'
      });
    }
    
    const publicId = extractPublicId(url);
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Cloudinary URL',
        arabic: 'رابط Cloudinary غير صحيح'
      });
    }
    
    const result = await deleteCloudinaryFile(publicId, resourceType);
    
    res.json({
      success: true,
      data: { result },
      message: 'File deleted successfully',
      arabic: 'تم حذف الملف بنجاح'
    });
  } catch (error) {
    console.error('Delete file by URL error:', error);
    res.status(500).json({
      success: false,
      error: 'Delete failed',
      arabic: 'فشل في حذف الملف'
    });
  }
});

/**
 * @route   GET /api/upload/stats
 * @desc    Get upload statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        arabic: 'غير مصرح بالوصول'
      });
    }
    
    const { getCloudinaryUsage } = require('../config/cloudinary');
    const usage = await getCloudinaryUsage();
    
    res.json({
      success: true,
      data: { stats: usage },
      message: 'Upload statistics retrieved successfully',
      arabic: 'تم استرجاع إحصائيات الرفع بنجاح'
    });
  } catch (error) {
    console.error('Get upload stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      arabic: 'فشل في استرجاع الإحصائيات'
    });
  }
});

// Error handling middleware
router.use(handleUploadError);

module.exports = router;