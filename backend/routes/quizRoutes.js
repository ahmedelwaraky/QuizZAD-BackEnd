import express from 'express';
import {
  createQuiz,
  getQuizzes,
  getAllPublicQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  assignQuizToClass,
  createQuizQuestion,
  retrieveQuizQuestions,
  unassignQuizFromClass,
} from '../controllers/quizController.js';
import { protect, checkAdmin } from '../middlewares/authMiddleware.js';
import upload from '../utils/multer.js';
import imageProcessing from '../middlewares/imageProcessing.js';

const router = express.Router();

router.post('/', protect, upload('quizImage'), imageProcessing, createQuiz);
router.get('/', protect, getQuizzes);
router.get('/public', protect, getAllPublicQuizzes);
router
  .route('/:quizId')
  .get(protect, getQuizById)
  .put(protect, upload('quizImage'), imageProcessing, updateQuiz)
  .delete(protect, checkAdmin, deleteQuiz);

router.post('/:quizId/assign/:classId', protect, assignQuizToClass);
router.post('/:quizId/unassign/:classId', protect, unassignQuizFromClass);

router
  .route('/:quizId/questions')
  .get(protect, retrieveQuizQuestions)
  .post(protect, upload('questionImage'), imageProcessing, createQuizQuestion);

export default router;
