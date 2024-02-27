function isAuthorizedToDeleteAnswer(userRole, answer, user) {
  if (userRole === 'ADMIN') {
    return true;
  }

  if (userRole === 'TEACHER') {
    if (answer.question && answer.question.quiz) {
      if (
        answer.question.quiz.creatorAdmin &&
        answer.question.quiz.creatorAdmin.id === user.admin.id
      ) {
        return true;
      }
      if (
        answer.question.quiz.creatorTeacher &&
        answer.question.quiz.creatorTeacher.id === user.teacher.id
      ) {
        return true;
      }
    }
  }

  return false;
}

export { isAuthorizedToDeleteAnswer };
