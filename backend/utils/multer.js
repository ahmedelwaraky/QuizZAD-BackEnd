import multer from 'multer';
import { CustomError } from '../errors/index.js';
const multerOptions = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter: (req, file, next) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    // Get the simplified MIME type (ignore charset and other parameters)
    const simplifiedMimeType = file.mimetype.split(';')[0].trim();

    if (allowed.includes(simplifiedMimeType)) {
      next(null, true);
    } else {
      next(CustomError('Invalid file type', 400), false);
    }
  },
};


const upload = (field_name) => multer(multerOptions).single(field_name);

export default upload;
