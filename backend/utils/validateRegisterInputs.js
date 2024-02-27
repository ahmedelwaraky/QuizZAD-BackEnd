import { CustomError } from "../errors/index.js";

const validateRegisterInputs = (data) => {
  const {
    email,
    password,
    firstName,
    lastName,
    gender,
    birthdate,
    role,
    gradeLevel,
    specialization,
  } = data;

  if (!email || !password || !firstName || !lastName || !gender || !birthdate) {
    throw new CustomError("Please provide a valid required fields", 400);
  }

  if (role === "TEACHER" && (!specialization || gradeLevel)) {
    throw new CustomError(
      "Please provide a valid required fields. Teacher must have specialization, but teacher must not have gradeLevel",
      400
    );
  } else if (role === "STUDENT" && (!gradeLevel || specialization)) {
    throw new CustomError(
      "Please provide a valid required fields.Student must have gradeLevel, but student must not have specialization",
      400
    );
  }
};

export default validateRegisterInputs;
