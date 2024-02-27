import generateToken from '../utils/generateToken.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { CustomError, InvalidEmailError } from '../errors/index.js';

const prisma = new PrismaClient();

const validateAuthInputs = (email, password) => {
  if (!email || !password) {
    throw new CustomError(
      'Please provide both email and password',
      400,
      'Please provide both email and password for authentication'
    );
  }

  if (!validator.isEmail(email)) {
    throw new InvalidEmailError('Invalid email', 400);
  }
};

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

const isPasswordValid = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const formatUserResponse = (user) => {
  return {
    id: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    birthdate: user.birthdate,
    role: user.role,
    status: user.status,
    bio: user.bio,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const generateTokenAndSendCookie = (res, userId) => {
  generateToken(res, userId);
};

export {
  validateAuthInputs,
  findUserByEmail,
  isPasswordValid,
  formatUserResponse,
  generateTokenAndSendCookie,
};
