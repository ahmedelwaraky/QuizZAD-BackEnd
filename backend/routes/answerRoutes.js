import express from 'express';
import { updateAnswer, deleteAnswer } from '../controllers/answerController.js';
import { protect, checkAdmin } from '../middlewares/authMiddleware.js';
import upload from '../utils/multer.js';
import imageProcessing from '../middlewares/imageProcessing.js';

const router = express.Router();

router
  .route('/:answerId')
  .delete(protect, deleteAnswer)
  .put(protect, upload('answerAsImage'), imageProcessing, updateAnswer);

export default router;
