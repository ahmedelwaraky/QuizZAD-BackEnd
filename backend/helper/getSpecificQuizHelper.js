import pkg, { PrismaClient } from '@prisma/client';
import {
  CustomError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/index.js';
import { request } from 'express';

const prisma = new PrismaClient();

async function retrieveQuizById(quizId) {
  return await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      creatorAdmin: {
        select: {
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
            },
          },
        },
      },
      creatorTeacher: {
        select: {
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
            },
          },
        },
      },
      classes: true,
    },
  });
}

async function getSpecificQuizAuthorization(quiz, currentUser) {
  // Students can only view public quizzes or class quizzes assigned to them
  if (currentUser.role === 'STUDENT') {
    const student = await prisma.student.findUnique({
      where: { id: currentUser.student.id },
      include: { assignedClasses: true },
    });

    if (
      quiz.classes.some((c) =>
        student.assignedClasses.some((ac) => ac.id === c.id)
      )
    ) {
      return true;
    }
  }

  // Teachers can only view quizzes they created
  if (currentUser.role === 'TEACHER') {
    if (quiz.isPublic === true) {
      return true;
    }
    const teacher = await prisma.teacher.findUnique({
      where: { id: currentUser.teacher.id },
      include: { assignedClasses: true },
    });
    if (
      quiz.classes.some((c) =>
        teacher.assignedClasses.some((ac) => ac.id === c.id)
      )
    ) {
      return true;
    } else if (
      quiz.creatorTeacher !== null &&
      quiz.creatorTeacher.id === currentUser.teacher.id
    ) {
      return true;
    }
  }

  // Admins can view any quiz

  if (currentUser.role === 'ADMIN') {
    return true;
  }
  // Otherwise, the user is not authorized to view the quiz
  return false;
}

async function retrieveStudentSpecificPublicQuizzes(retrievedQuiz, req) {
  const studentId = req.user.student.id;
  const student = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
    include: { profile: true },
  });
  console.log(student);
  if (!student) {
    throw new NotFoundError('Student not found', 404);
  }

  const publicQuizzes = await prisma.quiz.findMany({
    where: {
      isPublic: true,
      gradeLevel: student.profile.gradeLevel,
    },
  });

  const quiz = publicQuizzes.find((quiz) => {
    return quiz.id === retrievedQuiz.id;
  });

  if (!quiz.id) {
    return false;
  }

  return true;
}

export {
  retrieveQuizById,
  getSpecificQuizAuthorization,
  retrieveStudentSpecificPublicQuizzes,
};
