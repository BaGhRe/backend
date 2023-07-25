const multer = require('multer');
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage}).single('image');

module.exports.resizeImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const fileName = req.file.filename;
  const resizedImage = path.join("images", `resized_${fileName}`);

  sharp(filePath)
    .resize({ width: 206, height: 260 })
    .webp({ quality: 20 })
    .toFile(resizedImage)
    .then(() => {
      fs.unlink(filePath, () => {
        req.file.path = resizedImage;
        next();
      });
    })
    .catch((err) => {
      console.log(err);
      return next();
    });
};