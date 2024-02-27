import pkg, { PrismaClient } from '@prisma/client';
import {
  CustomError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/index.js';
import { request } from 'express';

const prisma = new PrismaClient();

async function getAdminQuizzes(req, filter, filterEnum) {
  const adminId = req.user.admin.id;
  const whereFilter = {};

  if (filter === filterEnum.created) {
    whereFilter.adminId = adminId;
  } else if (filter === filterEnum.class) {
    whereFilter.adminId = adminId;
    whereFilter.isPublic = false;
  } else if (filter === filterEnum.public) {
    whereFilter.adminId = adminId;
    whereFilter.isPublic = true;
  }

  return await prisma.quiz.findMany({
    where: whereFilter,
  });
}

async function getTeacherQuizzes(req, filter, filterEnum) {
  if (!filter) {
    throw new ForbiddenError('You are not authorized', 403);
  }

  const teacherId = req.user.teacher.id;
  const whereFilter = {};

  if (filter === filterEnum.created) {
    whereFilter.teacherId = teacherId;
  } else if (filter === filterEnum.class) {
    whereFilter.teacherId = teacherId;
    whereFilter.isPublic = false;
  } else if (filter === filterEnum.public) {
    whereFilter.teacherId = teacherId;
    whereFilter.isPublic = true;
  }

  return await prisma.quiz.findMany({
    where: whereFilter,
  });
}

async function getStudentQuizzes(req) {
  const studentId = req.user.student.id;
  const student = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
    include: {
      assignedClasses: true,
    },
  });

  if (student.assignedClasses.length === 0) {
    throw new ForbiddenError('You are not assigned to any classes', 403);
  }

  const classIds = student.assignedClasses.map((cls) => cls.id);

  return await prisma.quiz.findMany({
    where: {
      classes: {
        some: {
          id: { in: classIds },
        },
      },
    },
    include: {
      classes: true,
    },
  });
}

export { getAdminQuizzes, getTeacherQuizzes, getStudentQuizzes };
