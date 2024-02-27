import express from 'express';
import {
  startQuizAttempt,
  updateStudentQuizAttempt,
  getQuizAttemptsForQuiz,
  getStudentAttempts,
  deleteQuizAttempt,
  submitStudentAnswer,
  updateStudentAnswer,
  getStudentAnswersForAttempt,
} from '../controllers/quizAttemptController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create a new StudentQuizAttempt object when a student starts a quiz attempt
router.post('/start-quiz-attempt', protect, startQuizAttempt);

// Update an existing StudentQuizAttempt object when a student submits their quiz attempt
router.put('/update-quiz-attempt', protect, updateStudentQuizAttempt);

// Retrieve a list of all StudentQuizAttempt objects for a particular quiz
router.get('/quiz-attempts/:quizId', protect, getQuizAttemptsForQuiz);

// Retrieve a list of all StudentQuizAttempt objects for a particular student
router.get('/student-attempts/:studentId', protect, getStudentAttempts);

// Delete a single StudentQuizAttempt object by its ID
router.delete('/delete-attempt/:attemptId', protect, deleteQuizAttempt);

// Create a new StudentAnswer object when a student submits an answer
router.post('/submit-student-answer', protect, submitStudentAnswer);

// Update an existing StudentAnswer object if needed
router.put('/update-student-answer', protect, updateStudentAnswer);

// Retrieve a list of all StudentAnswer objects for a particular quiz attempt
router.get('/student-answers/:attemptId', protect, getStudentAnswersForAttempt);

export default router;
