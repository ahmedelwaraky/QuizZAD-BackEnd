import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function isUserAuthorized(userRole, quiz, currentUser) {
  if (userRole === 'ADMIN') {
    return true;
  }
  if (userRole === 'TEACHER' && quiz.teacherId === currentUser.teacher.id) {
    return true;
  }
  if (userRole === 'STUDENT') {
    const student = await prisma.student.findUnique({
      where: { id: currentUser.student.id },
      include: {
        profile: {
          select: { gradeLevel: true },
        },
        assignedClasses: true,
      },
    });

    if (quiz.isPublic && quiz.gradeLevel === student.profile.gradeLevel) {
      return true;
    }
    if (!quiz.isPublic && isStudentAssignedToClass(quiz, currentUser)) {
      return true;
    }
  }
  return false;
}

async function isStudentAssignedToClass(quiz, currentUser) {
  const student = await prisma.student.findUnique({
    where: { id: currentUser.student.id },
    include: {
      assignedClasses: {
        where: { gradeLevel: quiz.gradeLevel, id: quiz.classId },
      },
    },
  });
  return !!student;
}

async function retrieveQuestionsForQuiz(quizId, userRole, currentUser) {
  let questions = [];

  if (userRole === 'ADMIN') {
    questions = await prisma.question.findMany({
      where: { quizId: quizId },
      include: {
        answers: true,
      },
    });
  } else if (userRole === 'TEACHER') {
    const assignedClasses = currentUser.teacher?.assignedClasses || [];
    questions = await prisma.question.findMany({
      where: {
        quizId: quizId,
        OR: [
          { quiz: { teacherId: currentUser.teacher.id } },
          { quiz: { isPublic: true } },
          {
            quiz: {
              classes: {
                some: {
                  id: {
                    in: assignedClasses.map((c) => c.id),
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        answers: true,
      },
    });
  } else if (userRole === 'STUDENT') {
    const student = await prisma.student.findUnique({
      where: { id: currentUser.student.id },
      include: {
        profile: {
          select: { gradeLevel: true },
        },
        assignedClasses: true,
      },
    });

    const assignedClasses = student?.assignedClasses || [];

    questions = await prisma.question.findMany({
      where: {
        quizId: quizId,
        OR: [
          { quiz: { isPublic: true, gradeLevel: student.profile.gradeLevel } },
          {
            quiz: {
              classes: {
                some: {
                  id: {
                    in: assignedClasses.map((c) => c.id),
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        answers: true,
      },
    });
  }

  return questions;
}

async function retrieveQuiz(quizId, userRole, currentUser) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      creatorAdmin: true,
      creatorTeacher: true,
      classes: true,
    },
  });

  if (!quiz) {
    throw new NotFoundError('Quiz not found', 404);
  }

  if (userRole === 'STUDENT' && !quiz.isPublic) {
    if (!isStudentAssignedToClass(quiz, currentUser)) {
      throw new ForbiddenError('You are not assigned to this class', 403);
    }
  }

  if (quiz.endDate < new Date()) {
    throw new ForbiddenError('This quiz has ended', 403);
  }

  return quiz;
}

export {
  isUserAuthorized,
  retrieveQuestionsForQuiz,
  retrieveQuiz,
  isStudentAssignedToClass,
};
