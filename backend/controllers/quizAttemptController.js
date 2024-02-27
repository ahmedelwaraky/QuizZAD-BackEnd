import tryCatch from '../utils/tryCatch.js';
import pkg, { PrismaClient } from '@prisma/client';
import {
  CustomError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/index.js';

const prisma = new PrismaClient();

const startQuizAttempt = tryCatch(async (req, res) => {
  if (req.user.role !== 'STUDENT') {
    throw new ForbiddenError('Not authorized to view this quiz attempt.', 403);
  }

  const studentId = req.user.student.id;
  const { quizId } = req.body;

  // Check if the quiz with the provided ID exists
  const existingQuiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });

  if (!existingQuiz) {
    throw new NotFoundError('Quiz not found.', 404);
  }

  // Check if the student has already reached the maximum allowed attempts for this quiz
  const allowedAttempts = existingQuiz.numOfAllowedAttempts;

  const studentAttemptsCount = await prisma.studentQuizAttempt.count({
    where: {
      studentId: studentId,
      quizId: quizId,
    },
  });

  if (studentAttemptsCount >= allowedAttempts) {
    throw new ForbiddenError(
      'You exceeded the maximum allowed attempts for this quiz.',
      403
    );
  }

  const startTime = new Date();
  const isCompleted = false;
  const score = 0;
  const passed = false;

  const newAttempt = await prisma.studentQuizAttempt.create({
    data: {
      student: { connect: { id: studentId } },
      quiz: { connect: { id: quizId } },
      startTime,
      isCompleted,
      score,
      passed,
    },
  });

  if (!newAttempt) {
    throw new CustomError('Quiz attempt not created.', 500);
  }

  res.status(201).json(newAttempt);
});

const updateStudentQuizAttempt = tryCatch(async (req, res) => {
  const { attemptId, answers, passingScore } = req.body;
  const endTime = new Date();
  const isCompleted = true;

  // Fetch the quizId from the attempt
  const attempt = await prisma.studentQuizAttempt.findUnique({
    where: { id: attemptId },
    select: { quizId: true },
  });

  if (!attempt) {
    throw new NotFoundError('Quiz attempt not found.', 404);
  }

  const { quizId } = attempt;
  const { score, totalCorrectAnswers } = await calculateScore(quizId, answers);
  const passed = score >= passingScore;

  const updatedAttempt = await prisma.studentQuizAttempt.update({
    where: { id: attemptId },
    data: { endTime, isCompleted, score, passed },
  });

  if (!updatedAttempt) {
    throw new CustomError('Quiz attempt not updated.', 500);
  }

  updatedAttempt.totalCorrectAnswers = totalCorrectAnswers;

  res.json(updatedAttempt);
});

const getQuizAttemptsForQuiz = tryCatch(async (req, res) => {
  const { quizId } = req.params;
  const quizAttempts = await prisma.studentQuizAttempt.findMany({
    where: { quizId: Number(quizId) },
  });

  if (!quizAttempts || quizAttempts.length === 0) {
    throw new NotFoundError('Quiz attempts not found.', 404);
  }

  res.json(quizAttempts);
});

const getStudentAttempts = tryCatch(async (req, res) => {
  const { studentId } = req.params;

  const studentAttempts = await prisma.studentQuizAttempt.findMany({
    where: { studentId: Number(studentId) },
    include: {
      answers: {
        include: {
          selectedAnswer: true,
        },
      },
    },
  });

  if (!studentAttempts || studentAttempts.length === 0) {
    throw new NotFoundError('Student attempts not found.', 404);
  }
  console.log(studentAttempts);
  res.json(studentAttempts);
});

const deleteQuizAttempt = tryCatch(async (req, res) => {
  const { attemptId } = req.params;
  const deletedAttempt = await prisma.studentQuizAttempt.delete({
    where: { id: attemptId },
  });

  if (!deletedAttempt) {
    throw new NotFoundError('Quiz attempt not found.', 404);
  }

  res.json(deletedAttempt);
});

const submitStudentAnswer = tryCatch(async (req, res) => {
  const { attemptId, questionId, selectedAnswerId } = req.body;

  const attempt = await prisma.studentQuizAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.isCompleted) {
    throw new BadRequestError(
      'Invalid attempt ID or the attempt is already completed.',
      400
    );
  }

  const questionInQuiz = await prisma.question.findFirst({
    where: { id: questionId, quizId: attempt.quizId },
  });

  if (!questionInQuiz) {
    throw new BadRequestError(
      'The question does not belong to the quiz for this attempt.',
      400
    );
  }

  const existingAnswer = await prisma.studentAnswer.findFirst({
    where: {
      attemptId,
      selectedAnswer: {
        questionId,
      },
    },
  });

  if (existingAnswer) {
    throw new BadRequestError(
      'Answer for this question is already submitted.',
      400
    );
  }

  const newAnswer = await prisma.studentAnswer.create({
    data: {
      studentQuizAttempt: { connect: { id: attemptId } },
      selectedAnswer: { connect: { id: selectedAnswerId } },
    },
  });

  res.status(201).json(newAnswer);
});

const updateStudentAnswer = tryCatch(async (req, res) => {
  const { answerId, selectedAnswerId } = req.body;

  const answer = await prisma.studentAnswer.findUnique({
    where: { id: answerId },
    include: { studentQuizAttempt: true },
  });

  if (!answer || answer.studentQuizAttempt.isCompleted) {
    throw new BadRequestError(
      'Invalid answer ID or the associated attempt is completed.',
      400
    );
  }

  const updatedAnswer = await prisma.studentAnswer.update({
    where: { id: answerId },
    data: { selectedAnswer: { connect: { id: selectedAnswerId } } },
  });

  res.status(200).json(updatedAnswer);
});

const getStudentAnswersForAttempt = tryCatch(async (req, res) => {
  const { attemptId } = req.params;

  // Convert the attemptId to an integer
  const parsedAttemptId = parseInt(attemptId);

  const attempt = await prisma.studentQuizAttempt.findUnique({
    where: { id: parsedAttemptId },
  });

  if (!attempt) {
    throw new NotFoundError('Attempt not found.', 404);
  }

  const answers = await prisma.studentAnswer.findMany({
    where: { attemptId: Number(attemptId) },
    include: { selectedAnswer: true },
  });

  res.status(200).json(answers);
});

const calculateScore = async (quizId, answers) => {
  let totalCorrectAnswers = 0;
  let score = 0;
  const processedQuestions = new Set();

  const questions = await getQuestionsForQuiz(quizId);

  answers.forEach((userAnswer) => {
    const questionId = parseInt(Object.keys(userAnswer)[0]);
    const selectedAnswers = userAnswer[questionId];

    // Check if the question has already been processed
    if (!processedQuestions.has(questionId)) {
      const question = questions.find((q) => q.id === questionId);

      if (question) {
        const correctAnswers = question.answers
          .filter((answer) => answer.isCorrect)
          .map((answer) => answer.answerText);
        // Check if the user selected all correct answers
        if (arraysEqualIgnoreOrder(selectedAnswers, correctAnswers)) {
          score += question.gradePoints;
          totalCorrectAnswers++;
        }

        // Mark the question as processed
        processedQuestions.add(questionId);
      }
    }
  });

  return { score, totalCorrectAnswers };
};

// Helper function to check if two arrays are equal
function arraysEqualIgnoreOrder(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const sortedArr1 = arr1.slice().sort();
  const sortedArr2 = arr2.slice().sort();

  return sortedArr1.every((value, index) => value === sortedArr2[index]);
}

const getQuestionsForQuiz = async (quizId) => {
  const questions = await prisma.question.findMany({
    where: { quizId },
    include: { answers: true },
  });

  return questions;
};

export {
  startQuizAttempt,
  updateStudentQuizAttempt,
  getQuizAttemptsForQuiz,
  getStudentAttempts,
  deleteQuizAttempt,
  submitStudentAnswer,
  updateStudentAnswer,
  getStudentAnswersForAttempt,
};