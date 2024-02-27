import { PrismaClient } from '@prisma/client';
import { stringToBoolean } from './createQuizHelper.js';

const prisma = new PrismaClient();

async function updateQuizData(quizId, data) {
  return await prisma.quiz.update({
    where: {
      id: quizId,
    },
    data,
  });
}

function extractValidUpdateData(body, quiz) {
  const {
    title,
    subject,
    description,
    gradeLevel,
    term,
    unit,
    chapter,
    lesson,
    passingScore,
    difficultyLevel,
    duration,
    deadlineDate,
    immediateFeedback,
    numOfAllowedAttempts,
    isPublic,
    image,
  } = body;

  return {
    title,
    subject,
    description,
    gradeLevel,
    term,
    unit,
    chapter,
    lesson,
    passingScore: passingScore ? parseInt(passingScore, 10) : quiz.passingScore,
    difficultyLevel,
    duration: duration ? parseInt(duration, 10) : quiz.duration,
    deadlineDate,
    immediateFeedback: immediateFeedback
      ? stringToBoolean(immediateFeedback)
      : quiz.immediateFeedback,
    numOfAllowedAttempts: numOfAllowedAttempts
      ? parseInt(numOfAllowedAttempts, 10)
      : quiz.numOfAllowedAttempts,
    isPublic: isPublic ? stringToBoolean(isPublic) : quiz.isPublic,
    quizImage: image,
  };
}

async function updateQuizAuthorization(quiz, currentUser) {
  if (currentUser.role === 'ADMIN') {
    // Admins can update any quiz
    return true;
  }

  if (
    currentUser.role === 'TEACHER' &&
    quiz.creatorTeacher !== null &&
    quiz.creatorTeacher.id === currentUser.teacher.id
  ) {
    return true;
  }

  // By default, users are not authorized to update quizzes
  return false;
}

export { updateQuizData, extractValidUpdateData, updateQuizAuthorization };
