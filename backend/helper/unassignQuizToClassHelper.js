import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function unassignQuizFromClassInternal(quizId, classId, res) {
  const unassignedQuiz = await prisma.quiz.update({
    where: { id: quizId },
    data: {
      classes: {
        disconnect: { id: classId },
      },
    },
  });

  return res.status(200).json({
    message: 'Quiz unassigned from class successfully',
    unassignedQuiz,
  });
}

async function unassignQuizFromClassAsTeacherInternal(
  quiz,
  user,
  classId,
  res
) {
  if (!quiz.teacherId || quiz.teacherId !== user.teacher.id) {
    return res.status(403).json({
      message: 'You are not authorized to unassign this quiz from a class',
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
        'You are not authorized to unassign this quiz from the specified class',
    });
  }

  return unassignQuizFromClassInternal(quiz.id, classId, res);
}

export {
  unassignQuizFromClassInternal,
  unassignQuizFromClassAsTeacherInternal,
};
