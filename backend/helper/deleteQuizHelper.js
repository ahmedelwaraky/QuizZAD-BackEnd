import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function deleteQuizById(quizId) {
  return await prisma.quiz.delete({
    where: {
      id: parseInt(quizId),
    },
  });
}
