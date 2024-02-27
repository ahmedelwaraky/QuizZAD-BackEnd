import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function isAuthorizedToUpdateAnswer(userRole, answerId, user) {
  if (userRole !== 'ADMIN' && userRole !== 'TEACHER') {
    return false;
  }

  const answer = await findAnswerById(answerId);

  if (!answer) {
    return false;
  }

  if (userRole === 'ADMIN') {
    return true;
  }

  if (userRole === 'TEACHER') {
    // Use Prisma's relationship access directly to check teacher ownership
    if (answer.question.quiz.teacherId === user.teacher.id) {
      return true;
    }
  }

  return false;
}

async function findAnswerById(answerId) {
  return prisma.questionAnswer.findUnique({
    where: { id: answerId },
    include: {
      question: {
        select: {
          quiz: {
            select: {
              teacherId: true,
            },
          },
        },
      },
    },
  });
}

async function updateQuestionAnswer(answerId, answerData) {
  return prisma.questionAnswer.update({
    where: { id: answerId },
    data: answerData,
  });
}

export { isAuthorizedToUpdateAnswer, updateQuestionAnswer };
