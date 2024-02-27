import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function isAuthorized(userRole, questionId, user) {
  if (userRole !== 'ADMIN' && userRole !== 'TEACHER') {
    return false;
  }

  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    include: {
      quiz: {
        select: {
          teacherId: true,
        },
      },
    },
  });

  if (!question) {
    return false;
  }

  if (userRole === 'ADMIN') {
    return true;
  }

  if (userRole === 'TEACHER' && question.quiz.teacherId === user.teacher.id) {
    return true;
  }

  return false;
}

async function createQuestionAnswer(questionId, answerData) {
  return prisma.questionAnswer.create({
    data: {
      ...answerData,
      question: {
        connect: {
          id: questionId,
        },
      },
    },
  });
}

export { isAuthorized, createQuestionAnswer };
