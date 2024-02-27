import express from 'express';
import {
  deleteQuestion,
  updateQuestion,
  createAnswer,
} from '../controllers/questionController.js';
import { protect, checkAdmin } from '../middlewares/authMiddleware.js';
import upload from '../utils/multer.js';
import imageProcessing from '../middlewares/imageProcessing.js';

const router = express.Router();

router
  .route('/:questionId')
  .delete(protect, checkAdmin, deleteQuestion)
  .put(protect, upload('questionImage'), imageProcessing, updateQuestion);

router.post(
  '/:questionId/answers',
  protect,
  upload('answerAsImage'),
  imageProcessing,
  createAnswer
);

export default router;
