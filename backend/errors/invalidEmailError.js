import CustomError from './customError.js';

export default class InvalidEmailError extends CustomError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
  }
}
