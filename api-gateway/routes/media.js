const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Tạo thư mục uploads nếu chưa có
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/images',
    'uploads/images/menu',
    'uploads/images/categories',
    'uploads/images/areas',
    'uploads/images/thumbnails',
    'uploads/videos',
    'uploads/videos/menu',
    'uploads/videos/categories',
    'uploads/videos/areas'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

createUploadDirs();

// Cấu hình multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/images/menu'; // default
    
    const { type, category } = req.body;
    
    if (file.mimetype.startsWith('image/')) {
      if (type === 'category') {
        uploadPath = 'uploads/images/categories';
      } else if (type === 'area') {
        uploadPath = 'uploads/images/areas';
      } else {
        uploadPath = 'uploads/images/menu';
      }
    } else if (file.mimetype.startsWith('video/')) {
      if (type === 'category') {
        uploadPath = 'uploads/videos/categories';
      } else if (type === 'area') {
        uploadPath = 'uploads/videos/areas';
      } else {
        uploadPath = 'uploads/videos/menu';
      }
    }
    
    cb(null, path.join(__dirname, '..', uploadPath));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const filename = `${timestamp}-${uniqueId}${ext}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Loại file không được hỗ trợ. Chỉ chấp nhận ảnh (jpg, png, gif, webp) và video (mp4, avi, mov, wmv, webm)'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 10
  }
});

// POST /api/media/upload - Upload single file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Không có file được upload'
      });
    }

    const { type, itemId, purpose, description } = req.body;
    
    // Tạo URL truy cập file - Static URL (primary)
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const relativePath = req.file.path.replace(path.join(__dirname, '..'), '').replace(/\\/g, '/');
    const fileUrl = `${baseUrl}${relativePath.startsWith('/') ? relativePath : '/' + relativePath}`;
    
    // Backup: API serve URL
    const apiUrl = `${baseUrl}/api/media/serve/${type || 'menu'}/${req.file.filename}`;

    // Thông tin file
    const fileInfo = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      url: fileUrl,
      mimetype: req.file.mimetype,
      size: req.file.size,
      type: type || 'menu', // 'menu', 'category', hoặc 'area'
      itemId: itemId || null,
      purpose: purpose || 'main', // 'main', 'thumbnail', 'gallery'
      description: description || '',
      uploadedAt: new Date()
    };

    // Lưu thông tin vào database (sẽ implement sau)
    // await saveMediaInfo(fileInfo);

    res.json({
      success: true,
      message: 'Upload file thành công',
      data: fileInfo
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi upload file',
      details: error.message
    });
  }
});

// POST /api/media/upload-multiple - Upload multiple files
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Không có file được upload'
      });
    }

    const { type, itemId, purpose, description } = req.body;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const uploadedFiles = req.files.map(file => {
      const relativePath = file.path.replace(path.join(__dirname, '..'), '').replace(/\\/g, '/');
      const fileUrl = `${baseUrl}${relativePath.startsWith('/') ? relativePath : '/' + relativePath}`;

      return {
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        url: fileUrl,
        mimetype: file.mimetype,
        size: file.size,
        type: type || 'menu', // 'menu', 'category', hoặc 'area'
        itemId: itemId || null,
        purpose: purpose || 'gallery',
        description: description || '',
        uploadedAt: new Date()
      };
    });

    res.json({
      success: true,
      message: `Upload ${uploadedFiles.length} files thành công`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi upload files',
      details: error.message
    });
  }
});

// GET /api/media/files/:type/:itemId - Lấy danh sách media của một item
router.get('/files/:type/:itemId', async (req, res) => {
  try {
    const { type, itemId } = req.params;
    const { purpose } = req.query;

    // Mock data - sẽ thay bằng query database thật
    const mockFiles = [
      {
        id: 1,
        originalName: 'americano.jpg',
        filename: '1697123456789-uuid.jpg',
        url: `${req.protocol}://${req.get('host')}/uploads/images/menu/1697123456789-uuid.jpg`,
        mimetype: 'image/jpeg',
        size: 245760,
        type: 'menu',
        itemId: parseInt(itemId),
        purpose: 'main',
        description: 'Ảnh chính của Americano',
        uploadedAt: new Date()
      }
    ];

    // Filter theo purpose nếu có
    let filteredFiles = mockFiles.filter(file => 
      file.type === type && file.itemId === parseInt(itemId)
    );

    if (purpose) {
      filteredFiles = filteredFiles.filter(file => file.purpose === purpose);
    }

    res.json({
      success: true,
      data: filteredFiles,
      total: filteredFiles.length
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy danh sách files',
      details: error.message
    });
  }
});

// DELETE /api/media/files/:filename - Xóa file
router.delete('/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Tìm file trong các thư mục
    const searchDirs = [
      'uploads/images/menu',
      'uploads/images/categories',
      'uploads/images/areas',
      'uploads/videos/menu',
      'uploads/videos/categories',
      'uploads/videos/areas'
    ];

    let filePath = null;
    for (const dir of searchDirs) {
      const fullPath = path.join(__dirname, '..', dir, filename);
      if (fs.existsSync(fullPath)) {
        filePath = fullPath;
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({
        success: false,
        error: 'File không tồn tại'
      });
    }

    // Xóa file
    fs.unlinkSync(filePath);

    // Xóa thông tin trong database (sẽ implement sau)
    // await deleteMediaInfo(filename);

    res.json({
      success: true,
      message: 'Xóa file thành công'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi xóa file',
      details: error.message
    });
  }
});

// GET /api/media/serve/:type/:filename - Serve image files with CORS
router.get('/serve/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    
    // Determine file path based on type
    let filePath;
    const searchDirs = [
      `uploads/images/${type}`,
      `uploads/videos/${type}`,
      'uploads/images/menu',
      'uploads/images/categories',
      'uploads/images/areas',
      'uploads/videos/menu',
      'uploads/videos/categories',
      'uploads/videos/areas'
    ];

    for (const dir of searchDirs) {
      const fullPath = path.join(__dirname, '..', dir, filename);
      if (fs.existsSync(fullPath)) {
        filePath = fullPath;
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({
        success: false,
        error: 'File không tồn tại'
      });
    }

    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // Send file
    res.sendFile(filePath);

  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi serve file'
    });
  }
});

// GET /api/media/info - Thông tin media service
router.get('/info', (req, res) => {
  try {
    const uploadDirs = [
      'uploads/images/menu',
      'uploads/images/categories',
      'uploads/images/areas',
      'uploads/videos/menu',
      'uploads/videos/categories',
      'uploads/videos/areas'
    ];

    const dirInfo = uploadDirs.map(dir => {
      const fullPath = path.join(__dirname, '..', dir);
      const exists = fs.existsSync(fullPath);
      let fileCount = 0;
      
      if (exists) {
        try {
          const files = fs.readdirSync(fullPath);
          fileCount = files.length;
        } catch (e) {
          fileCount = 0;
        }
      }

      return {
        directory: dir,
        exists,
        fileCount
      };
    });

    res.json({
      success: true,
      message: 'Media service đang hoạt động',
      directories: dirInfo,
      maxFileSize: '100MB',
      allowedTypes: {
        images: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
        videos: ['mp4', 'avi', 'mov', 'wmv', 'webm']
      }
    });

  } catch (error) {
    console.error('Media info error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy thông tin media service'
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File quá lớn. Kích thước tối đa là 100MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Quá nhiều file. Tối đa 10 files'
      });
    }
  }
  
  res.status(400).json({
    success: false,
    error: error.message || 'Lỗi upload file'
  });
});

module.exports = router;
