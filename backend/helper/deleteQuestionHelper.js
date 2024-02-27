import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function findAndDeleteQuestion(questionId) {
  // Find the question by ID
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });

  if (question) {
    // Delete the question
    await prisma.question.delete({
      where: {
        id: questionId,
      },
    });

    return question;
  } else {
    return null; // Question not found
  }
}
