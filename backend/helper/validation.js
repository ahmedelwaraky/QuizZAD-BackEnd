import { BadRequestError } from "../errors/index.js";

const validateRequiredFields = async (req, res, fields) => {
  for (const field of fields) {
    if (!req.body[field]) {
      throw new BadRequestError(`Please provide ${field}`, 400);
    }
  }
};

export default validateRequiredFields;
