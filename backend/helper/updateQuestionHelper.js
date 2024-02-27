import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findAndUpdateQuestion(questionId, updateData, user) {
  updateData.questionImage = updateData.image;
  delete updateData.image;
  console.log(updateData.questionImage);
  // Find the question by ID
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    include: {
      quiz: true,
    },
  });

  if (!question) {
    return null; // Question not found
  }

  if (userCanUpdateQuestion(user, question)) {
    const updatedQuestion = await prisma.question.update({
      where: {
        id: questionId,
      },
      include: { quiz: true },
      data: updateData,
    });

    return updatedQuestion;
  }

  return null; // User is not authorized
}

function userCanUpdateQuestion(user, question) {
  if (user.role === 'ADMIN') {
    return true; // Admin can update any question
  }

  if (user.role === 'TEACHER' && question.quiz.teacherId === user.teacher.id) {
    return true; // Teacher can update their own questions
  }

  return false; // User is not authorized
}

export { findAndUpdateQuestion };
