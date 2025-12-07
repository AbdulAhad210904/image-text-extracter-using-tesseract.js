const express = require('express');
const multer = require('multer');
const { createWorker } = require('tesseract.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Configure multer for file uploads (memory storage - no disk writes)
const storage = multer.memoryStorage();

// File filter for image types
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/tiff'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPEG, PNG, GIF, BMP, WEBP, TIFF) are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Text recognition endpoint
app.post('/api/recognize-text', upload.single('image'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided. Please upload an image file using the "image" field.'
      });
    }

    const imageBuffer = req.file.buffer;
    const language = req.body.language || 'eng'; // Default to English

    // Validate language format (basic validation)
    if (typeof language !== 'string' || language.length > 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid language parameter. Language code should be a string (e.g., "eng", "fra", "spa")'
      });
    }

    // Create Tesseract worker
    const worker = await createWorker(language);

    try {
      // Perform OCR directly from buffer (no disk I/O)
      const { data: { text, confidence, words } } = await worker.recognize(imageBuffer);

      // Terminate worker
      await worker.terminate();

      // Return success response
      res.status(200).json({
        status: 'success',
        data: {
          text: text.trim(),
          confidence: confidence,
          wordCount: words ? words.length : 0,
          language: language,
          timestamp: new Date().toISOString()
        }
      });

    } catch (ocrError) {
      // Terminate worker on error
      await worker.terminate();

      throw ocrError;
    }

  } catch (error) {
    console.error('OCR Error:', error);

    // Determine error type and return appropriate response
    if (error.message && error.message.includes('Invalid file type')) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    if (error.message && error.message.includes('File too large')) {
      return res.status(400).json({
        status: 'error',
        message: 'File size exceeds the maximum limit of 10MB'
      });
    }

    if (error.message && error.message.includes('language')) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or unsupported language code'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing the image. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size exceeds the maximum limit of 10MB'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  if (err) {
    return res.status(400).json({
      status: 'error',
      message: err.message || 'Bad request'
    });
  }

  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`OCR endpoint: http://localhost:${PORT}/api/recognize-text`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;

