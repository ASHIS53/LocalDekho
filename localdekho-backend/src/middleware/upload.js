const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'localdekho',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4'],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
