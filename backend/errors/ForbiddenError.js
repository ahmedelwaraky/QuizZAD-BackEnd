import CustomError from './customError.js';

export default class ForbiddenError extends CustomError {
  constructor(message, statusCode = 403) {
    super(message, statusCode);
  }
}
