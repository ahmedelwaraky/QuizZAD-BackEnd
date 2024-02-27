import pkg, { PrismaClient } from '@prisma/client';
import {
  CustomError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/index.js';

const prisma = new PrismaClient();

function checkRequiredFields(data, requiredFields) {
  const missingFields = requiredFields.filter((field) => !data[field]);
  if (missingFields.length > 0) {
    throw new BadRequestError(
      'Missing required fields: ' + missingFields.join(', '),
      400
    );
  }
}

function validateNumericFields(data, requiredNumericFields) {
  const numericFields = requiredNumericFields;
  numericFields.forEach((field) => {
    const value = parseInt(data[field], 10);
    if (isNaN(value) || value < 0) {
      throw new BadRequestError('Invalid number format for ' + field, 400);
    }
  });
}

function buildQuizData(requestData, creatorField) {
  requestData.quizImage = requestData.image;
  delete requestData.image;
  return {
    ...requestData,
    passingScore: parseInt(requestData.passingScore, 10),
    duration: parseInt(requestData.duration, 10),
    numOfAllowedAttempts: parseInt(requestData.numOfAllowedAttempts, 10),
    immediateFeedback: stringToBoolean(requestData.immediateFeedback),
    quizType: !requestData.quizType ? 'PRACTICE' : requestData.quizType,
    isPublic: stringToBoolean(requestData.isPublic),
    ...creatorField,
  };
}

function determineCreatorField(userRole, userData) {
  if (userRole === 'ADMIN') {
    return { adminId: userData.admin.id };
  } else if (userRole === 'TEACHER') {
    return { teacherId: userData.teacher.id };
  }
}

function stringToBoolean(value) {
  if (value === 'true' || value === '1' || value === true) {
    return true;
  }
  if (
    value === 'false' ||
    value === '0' ||
    value === false ||
    value === null ||
    value === ''
  ) {
    return false;
  }
  throw new BadRequestError('Invalid boolean format: ' + value, 400);
}

async function createQuizInDatabase(quizData) {
  return await prisma.quiz.create({ data: quizData });
}

export {
  checkRequiredFields,
  validateNumericFields,
  buildQuizData,
  determineCreatorField,
  createQuizInDatabase,
  stringToBoolean,
};
