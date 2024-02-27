import { PrismaClient } from '@prisma/client';
import {
  CustomError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/index.js';

const prisma = new PrismaClient();

function isTeacherAuthorized(quiz, user) {
  return quiz.teacherId && quiz.teacherId === user.teacher.id;
}

function validateAndCreateQuestion(quizId, questionData, res) {
  const requiredFields = ['questionType', 'questionText', 'gradePoints'];

  if (requiredFields.every((field) => questionData[field])) {
    createQuestion(quizId, questionData, res);
  } else {
    throw new BadRequestError('Missing required fields', 400);
  }
}

async function createQuestion(quizId, questionData, res) {
  const {
    questionType,
    questionText,
    gradePoints,
    timeLimit,
    difficultyLevel,
    image,
  } = questionData;

  const createdQuestion = await prisma.question.create({
    data: {
      questionType,
      questionText,
      gradePoints: parseInt(gradePoints),
      timeLimit: parseInt(timeLimit),
      difficultyLevel,
      questionImage: image,
      quiz: { connect: { id: quizId } },
    },
  });

  res.status(201).json({
    message: 'Question created successfully',
    question: createdQuestion,
  });
}

export { isTeacherAuthorized, validateAndCreateQuestion };
