import tryCatch from '../utils/tryCatch.js';
import pkg, { PrismaClient } from '@prisma/client';
import {
  CustomError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/index.js';
import {
  isAuthorizedToUpdateAnswer,
  updateQuestionAnswer,
} from '../helper/updateAnswerHelper.js';
import { isAuthorizedToDeleteAnswer } from '../helper/deleteAnswerHelper.js';

const prisma = new PrismaClient();

const updateAnswer = tryCatch(async (req, res) => {
  const userRole = req.user.role;
  const answerId = parseInt(req.params.answerId);

  if (
    !isAuthorizedToUpdateAnswer(userRole, answerId, req.user) ||
    userRole === 'STUDENT'
  ) {
    throw new ForbiddenError(
      'You are not authorized to update this answer',
      403
    );
  }

  const { isCorrect, answerText, correctAnswerExplanation, image } = req.body;

  const updatedAnswer = await updateQuestionAnswer(answerId, {
    isCorrect,
    answerText,
    correctAnswerExplanation,
    answerAsImage: image,
  });

  res
    .status(200)
    .json({ message: 'Answer updated successfully', updatedAnswer });
});

const deleteAnswer = tryCatch(async (req, res) => {
  const userRole = req.user.role;
  const answerId = parseInt(req.params.answerId);

  // Check if the user is authorized to delete this answer
  const answer = await prisma.questionAnswer.findUnique({
    where: { id: answerId },
    include: {
      question: {
        include: {
          quiz: {
            include: {
              creatorAdmin: true,
              creatorTeacher: true,
            },
          },
        },
      },
    },
  });

  if (!answer) {
    throw new NotFoundError('Answer not found', 404);
  }

  if (!isAuthorizedToDeleteAnswer(userRole, answer, req.user)) {
    throw new ForbiddenError(
      'You are not authorized to delete this answer',
      403
    );
  }

  await prisma.questionAnswer.delete({
    where: { id: answerId },
  });

  res.status(200).json({ message: 'Answer deleted successfully' });
});

export { updateAnswer, deleteAnswer };
