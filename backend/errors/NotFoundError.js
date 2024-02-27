import CustomError from './customError.js';

export default class NotFoundError extends CustomError {
  constructor(message, statusCode = 404) {
    super(message, statusCode);
  }
}
