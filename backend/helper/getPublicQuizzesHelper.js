import pkg, { PrismaClient } from '@prisma/client';
import {
  CustomError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/index.js';
import { request } from 'express';

const prisma = new PrismaClient();

async function retrieveStudentPublicQuizzes(req, res) {
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

  return res.status(200).json({
    message: 'Public quizzes retrieved successfully',
    quizzes: publicQuizzes,
  });
}

async function retrieveTeacherAdminPublicQuizzes(req, res) {
  const publicQuizzes = await prisma.quiz.findMany({
    where: {
      isPublic: true,
    },
  });

  return res.status(200).json({
    message: 'Public quizzes retrieved successfully',
    quizzes: publicQuizzes,
  });
}

export { retrieveStudentPublicQuizzes, retrieveTeacherAdminPublicQuizzes };
