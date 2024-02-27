import tryCatch from '../utils/tryCatch.js';
import pkg, { PrismaClient } from '@prisma/client';
import {
  CustomError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/index.js';
import findAndDeleteQuestion from '../helper/deleteQuestionHelper.js';
import { findAndUpdateQuestion } from '../helper/updateQuestionHelper.js';
import {
  createQuestionAnswer,
  isAuthorized,
} from '../helper/createAnswerHelper.js';

const { PrismaClientKnownRequestError } = pkg;
const prisma = new PrismaClient();

const deleteQuestion = tryCatch(async (req, res) => {
  const questionId = parseInt(req.params.questionId);

  // Find and delete the question
  const deletedQuestion = await findAndDeleteQuestion(questionId);

  if (deletedQuestion) {
    res
      .status(200)
      .json({ message: 'Question deleted successfully', deletedQuestion });
  } else {
    throw new NotFoundError('Question not found', 404);
  }
});

const updateQuestion = tryCatch(async (req, res) => {
  const userRole = req.user.role;
  const questionId = parseInt(req.params.questionId);

  // Find and update the question
  const updatedQuestion = await findAndUpdateQuestion(
    questionId,
    req.body,
    req.user
  );

  if (updatedQuestion) {
    res
      .status(200)
      .json({ message: 'Question updated successfully', updatedQuestion });
  } else {
    throw new NotFoundError('Question not found', 404);
  }
});

const createAnswer = tryCatch(async (req, res) => {
  const userRole = req.user.role;
  const questionId = parseInt(req.params.questionId);

  if (!isAuthorized(userRole, questionId, req.user)) {
    throw new ForbiddenError('You are not authorized', 403);
  }

  const { isCorrect, answerText, correctAnswerExplanation, image } = req.body;

  if (!isCorrect || !answerText || !correctAnswerExplanation) {
    throw new BadRequestError('Missing required fields', 400);
  }

  const isCorrectParsedValue = JSON.parse(isCorrect.toLowerCase());

  const answer = await createQuestionAnswer(questionId, {
    isCorrect: isCorrectParsedValue,
    answerText,
    correctAnswerExplanation,
    answerAsImage: image,
  });

  res.status(201).json({ message: 'Answer created successfully', answer });
});

export { deleteQuestion, updateQuestion, createAnswer };
