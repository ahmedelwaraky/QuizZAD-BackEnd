import tryCatch from '../utils/tryCatch.js';
import { PrismaClient } from '@prisma/client';
import {
  CustomError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/index.js';
import {
  checkRequiredFields,
  validateNumericFields,
  buildQuizData,
  determineCreatorField,
  createQuizInDatabase,
  stringToBoolean,
} from '../helper/createQuizHelper.js';
import {
  getAdminQuizzes,
  getTeacherQuizzes,
  getStudentQuizzes,
} from '../helper/getQuizzesHelper.js';

import {
  retrieveStudentPublicQuizzes,
  retrieveTeacherAdminPublicQuizzes,
} from '../helper/getPublicQuizzesHelper.js';

import {
  getSpecificQuizAuthorization,
  retrieveQuizById,
  retrieveStudentSpecificPublicQuizzes,
} from '../helper/getSpecificQuizHelper.js';

import {
  updateQuizData,
  extractValidUpdateData,
  updateQuizAuthorization,
} from '../helper/updateQuizHelper.js';

import deleteQuizById from '../helper/deleteQuizHelper.js';
import {
  assignQuizToClassAsTeacherInternal,
  assignQuizToClassInternal,
} from '../helper/assignQuizToClassHelper.js';
import {
  isTeacherAuthorized,
  validateAndCreateQuestion,
} from '../helper/createQuizQuestionHelper.js';
import {
  isUserAuthorized,
  retrieveQuestionsForQuiz,
  retrieveQuiz,
  isStudentAssignedToClass,
} from '../helper/retrieveQuizQuestionsHelper.js';
import {
  unassignQuizFromClassAsTeacherInternal,
  unassignQuizFromClassInternal,
} from '../helper/unassignQuizToClassHelper.js';

const prisma = new PrismaClient();

// Create a new quiz
const createQuiz = tryCatch(async (req, res) => {
  const userRole = req.user.role;
  const userData = req.user;
  const requiredFields = [
    'title',
    'subject',
    'description',
    'gradeLevel',
    'term',
    'unit',
    'chapter',
    'lesson',
    'passingScore',
    'difficultyLevel',
    'duration',
    'deadlineDate',
    'numOfAllowedAttempts',
  ];

  const requiredNumericFields = [
    'passingScore',
    'duration',
    'numOfAllowedAttempts',
  ];

  if (userRole !== 'ADMIN' && userRole !== 'TEACHER') {
    throw new ForbiddenError('You are not authorized to create a quiz', 403);
  }

  checkRequiredFields(req.body, requiredFields);

  validateNumericFields(req.body, requiredNumericFields);

  const creatorField = determineCreatorField(userRole, userData);

  const quizData = buildQuizData(req.body, creatorField);

  const quiz = await createQuizInDatabase(quizData);

  res.status(201).json({ message: 'Quiz created successfully', quiz });
});

// get quizzes depending on user role
const getQuizzes = tryCatch(async (req, res) => {
  const { filter } = req.query;
  const userRole = req.user.role;
  const filterEnum = {
    created: 'created',
    class: 'class',
    public: 'public',
  };

  let quizzes;

  if (userRole === 'ADMIN') {
    quizzes = await getAdminQuizzes(req, filter, filterEnum);
  } else if (userRole === 'TEACHER') {
    quizzes = await getTeacherQuizzes(req, filter, filterEnum);
  } else if (userRole === 'STUDENT') {
    quizzes = await getStudentQuizzes(req);
  } else {
    return res.status(403).json({
      message: 'You are not authorized to retrieve quizzes',
    });
  }

  return res.status(200).json({
    message: 'Quizzes retrieved successfully',
    quizzes,
  });
});

const getAllPublicQuizzes = tryCatch(async (req, res) => {
  const userRole = req.user.role;

  if (userRole === 'STUDENT') {
    await retrieveStudentPublicQuizzes(req, res);
  } else if (userRole === 'TEACHER' || userRole === 'ADMIN') {
    await retrieveTeacherAdminPublicQuizzes(req, res);
  } else {
    res.status(403).json({
      message: 'You are not authorized to retrieve public quizzes',
    });
  }
});

const getQuizById = tryCatch(async (req, res) => {
  const quizId = parseInt(req.params.quizId);
  const currentUser = req.user;
  const quiz = await retrieveQuizById(quizId);

  if (!quiz) {
    throw new NotFoundError('Quiz not found', 404);
  }

  if (
    quiz.isPublic &&
    currentUser.role === 'STUDENT' &&
    (await retrieveStudentSpecificPublicQuizzes(quiz, req))
  ) {
    return res
      .status(200)
      .json({ message: 'Quiz retrieved successfully', quiz });
  } else {
    const isAuthorized = await getSpecificQuizAuthorization(quiz, currentUser);

    if (!isAuthorized) {
      throw new ForbiddenError('You are not authorized', 403);
    }

    return res
      .status(200)
      .json({ message: 'Quiz retrieved successfully', quiz });
  }
});

const updateQuiz = tryCatch(async (req, res) => {
  const quizId = parseInt(req.params.quizId);
  const currentUser = req.user;
  const quiz = await retrieveQuizById(quizId);

  if (!quiz) {
    throw new NotFoundError('Quiz not found', 404);
  }

  const isAuthorized = await updateQuizAuthorization(quiz, currentUser);

  if (!isAuthorized) {
    throw new ForbiddenError('You are not authorized', 403);
  }

  const updatedData = extractValidUpdateData(req.body, quiz);
  console.log(updatedData);
  const updatedQuiz = await updateQuizData(quizId, updatedData);

  res.status(200).json({ message: 'Quiz updated successfully', updatedQuiz });
});

const deleteQuiz = tryCatch(async (req, res) => {
  const quizId = parseInt(req.params.quizId);

  const quiz = await retrieveQuizById(quizId);

  if (!quiz) {
    throw new NotFoundError('Quiz not found', 404);
  }

  const deletedQuiz = await deleteQuizById(quizId);

  res.status(200).json({
    message: 'Quiz Deleted successfully',
    deletedQuiz,
  });
});

const assignQuizToClass = tryCatch(async (req, res) => {
  const userRole = req.user.role;
  const quizId = parseInt(req.params.quizId);
  const classId = parseInt(req.params.classId);

  if (isNaN(quizId) || isNaN(classId)) {
    return res.status(400).json({ message: 'Invalid quizId or classId' });
  }

  const quiz = await retrieveQuizById(quizId);

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  if (userRole === 'STUDENT') {
    return res.status(403).json({
      message: 'Students are not authorized to assign quizzes to classes',
    });
  }

  if (userRole === 'ADMIN') {
    await assignQuizToClassInternal(quizId, classId, res);
  } else if (userRole === 'TEACHER') {
    await assignQuizToClassAsTeacherInternal(quiz, req.user, classId, res);
  }
});

const unassignQuizFromClass = tryCatch(async (req, res) => {
  const userRole = req.user.role;
  const quizId = parseInt(req.params.quizId);
  const classId = parseInt(req.params.classId);

  if (isNaN(quizId) || isNaN(classId)) {
    return res.status(400).json({ message: 'Invalid quizId or classId' });
  }

  const quiz = await retrieveQuizById(quizId);

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  if (userRole === 'STUDENT') {
    return res.status(403).json({
      message: 'Students are not authorized to unassign quizzes from classes',
    });
  }

  if (userRole === 'ADMIN') {
    await unassignQuizFromClassInternal(quizId, classId, res);
  } else if (userRole === 'TEACHER') {
    await unassignQuizFromClassAsTeacherInternal(quiz, req.user, classId, res);
  }
});

const createQuizQuestion = tryCatch(async (req, res) => {
  const userRole = req.user.role;
  const quizId = parseInt(req.params.quizId);
  const questionData = req.body;

  const quiz = await retrieveQuizById(quizId);

  if (!quiz) {
    throw new NotFoundError('Quiz not found', 404);
  }

  if (
    userRole === 'ADMIN' ||
    (userRole === 'TEACHER' && isTeacherAuthorized(quiz, req.user))
  ) {
    validateAndCreateQuestion(quizId, questionData, res);
  } else {
    throw new ForbiddenError('You are not authorized', 403);
  }
});

const retrieveQuizQuestions = tryCatch(async (req, res) => {
  const userRole = req.user.role;
  const quizId = parseInt(req.params.quizId);

  const quiz = await retrieveQuiz(quizId, userRole, req.user);

  if (isUserAuthorized(userRole, quiz, req.user)) {
    const questions = await retrieveQuestionsForQuiz(
      quizId,
      userRole,
      req.user
    );
    res.status(200).json({
      message: 'Questions retrieved successfully',
      questions,
    });
  } else {
    throw new ForbiddenError(
      'You are not authorized to retrieve questions for this quiz',
      403
    );
  }
});

export {
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
};
