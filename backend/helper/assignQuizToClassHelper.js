import { PrismaClient } from '@prisma/client';
import {
  CustomError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/index.js';

const prisma = new PrismaClient();

async function assignQuizToClassInternal(quizId, classId, res) {
  const assignedQuiz = await prisma.quiz.update({
    where: { id: quizId },
    data: {
      isPublic: false,
      classes: {
        connect: { id: classId },
      },
    },
  });

  return res
    .status(200)
    .json({ message: 'Quiz assigned to class successfully', assignedQuiz });
}

async function assignQuizToClassAsTeacherInternal(quiz, user, classId, res) {
  if (!quiz.teacherId || quiz.teacherId !== user.teacher.id) {
    return res.status(403).json({
      message: 'You are not authorized to assign this quiz to a class',
    });
  }

  const assignedClasses = await prisma.teacher.findUnique({
    where: { id: user.teacher.id },
    include: {
      assignedClasses: {
        where: { id: classId },
      },
    },
  });

  if (!assignedClasses) {
    return res.status(403).json({
      message:
        'You are not authorized to assign this quiz to the specified class',
    });
  }

  return assignQuizToClassInternal(quiz.id, classId, res);
}

export { assignQuizToClassInternal, assignQuizToClassAsTeacherInternal };
