import tryCatch from '../utils/tryCatch.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
const __dirname = path.resolve();
import { v4 as uuidv4 } from 'uuid';
import pkg, { PrismaClient } from '@prisma/client';


const { PrismaClientKnownRequestError, PrismaClientValidationError } = pkg;

const imageProcessing = tryCatch(async (req, res, next) => {
  if (!req.file) return next();
  const ext = req.file.mimetype.split('/')[1];
  req.file.filename = `${req.file.fieldname}-${
    req.user.id
  }-${uuidv4()}-${Date.now()}.${ext}`;
  const filename = req.file.filename;
  const filepath = path.join(
    __dirname,
    'backend',
    'public',
    'uploads',
    filename
  );
  if (!fs.existsSync('./backend/public/uploads')) {
    fs.mkdirSync('./backend/public/uploads', { recursive: true });
  }
  await sharp(req.file.buffer)
    .resize(1400, 1400)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(filepath);
  req.body.image = filename;
  next();
});

export default imageProcessing;
