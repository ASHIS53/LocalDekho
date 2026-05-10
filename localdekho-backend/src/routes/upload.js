const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { auth, roleCheck } = require('../middleware/auth');

// POST /image - Upload single image (e.g. shop cover)
router.post('/image', auth, roleCheck(['owner', 'admin']), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    // req.file.path contains the Cloudinary URL
    res.json({ url: req.file.path });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// POST /images - Upload multiple images (e.g. products)
router.post('/images', auth, roleCheck(['owner', 'admin']), upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }
    
    const urls = req.files.map(file => file.path);
    res.json({ urls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Error uploading images' });
  }
});

// POST /video - Upload video
router.post('/video', auth, roleCheck(['owner', 'admin']), upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video uploaded' });
    }
    res.json({ url: req.file.path });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Error uploading video' });
  }
});

module.exports = router;
