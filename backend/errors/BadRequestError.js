import CustomError from './customError.js';

export default class BadRequestError extends CustomError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
  }
}
