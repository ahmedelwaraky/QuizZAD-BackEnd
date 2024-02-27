import generateToken from '../utils/generateToken.js';
import validateRegisterInputs from '../utils/validateRegisterInputs.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import {
  CustomError,
  InvalidEmailError,
  WeakPasswordError,
  InvalidRoleError,
  ExistingUserError,
} from '../errors/index.js';

const prisma = new PrismaClient();

const validateUserInput = (userData) => {
  validateRegisterInputs(userData);

  if (!validator.isEmail(userData.email)) {
    throw new InvalidEmailError();
  }

  if (!validator.isMobilePhone(userData.phoneNumber, 'ar-EG')) {
    throw new CustomError(
      'Invalid phone number.',
      400,
      'Please provide a valid mobile phone number for Egypt.'
    );
  }

  const isStrongPassword = validator.isStrongPassword(userData.password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  if (!isStrongPassword) {
    throw new WeakPasswordError(
      'Password is too weak. It should include at least 8 characters, 1 lowercase, 1 uppercase, 1 number, and 1 symbol.',
      400
    );
  }

  if (userData.role !== 'STUDENT' && userData.role !== 'TEACHER') {
    throw new InvalidRoleError(
      "Role is invalid. It should be either 'STUDENT' or 'TEACHER'",
      400
    );
  }
};

const checkExistingUser = async (userData) => {
  return await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: userData.email,
        },
        {
          phoneNumber: userData.phoneNumber,
        },
      ],
    },
  });
};

const hashUserPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const createUserRecord = async (userData, hashedPassword) => {
  return await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });
};

const formatUserResponse = (userRecord) => {
  const userResponse = {
    id: userRecord.id,
    email: userRecord.email,
    phoneNumber: userRecord.phoneNumber,
    firstName: userRecord.firstName,
    lastName: userRecord.lastName,
    gender: userRecord.gender,
    birthdate: userRecord.birthdate,
    role: userRecord.role,
    status: userRecord.status,
    gradeLevel: userRecord.gradeLevel,
    specialization: userRecord.specialization,
    bio: userRecord.bio,
    profileImage: userRecord.profileImage,
    createdAt: userRecord.createdAt,
    updatedAt: userRecord.updatedAt,
  };

  if (userRecord.role === 'STUDENT') {
    userResponse.gradeLevel = userRecord.gradeLevel;
  } else if (userRecord.role === 'TEACHER') {
    userResponse.specialization = userRecord.specialization;
  }

  return userResponse;
};

const generateTokenAndSendCookie = (res, userId) => {
  generateToken(res, userId);
};

export {
  generateTokenAndSendCookie,
  formatUserResponse,
  createUserRecord,
  hashUserPassword,
  checkExistingUser,
  validateUserInput,
};
