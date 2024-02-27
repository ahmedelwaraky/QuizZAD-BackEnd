import tryCatch from '../utils/tryCatch.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import {
  CustomError,
  InvalidEmailError,
  WeakPasswordError,
  InvalidRoleError,
  ExistingUserError,
} from '../errors/index.js';
import generateToken from '../utils/generateToken.js';
import generateResetPasswordToken from '../utils/generateRestPasswordToken.js';
import sendPasswordResetEmail from '../utils/sendPasswordResetEmail.js';
import {
  checkExistingUser,
  createUserRecord,
  formatUserResponse,
  generateTokenAndSendCookie,
  hashUserPassword,
  validateUserInput,
} from '../helper/registerUserHelper.js';
import {
  findUserByEmail,
  isPasswordValid,
  validateAuthInputs,
} from '../helper/authUserHelper.js';

const prisma = new PrismaClient();

// @desc Register a new user
// @route POST /api/v1/users
// @access Public
// Define tryCatch to handle errors gracefully
const registerUser = tryCatch(async (req, res) => {
  const userData = req.body;

  validateUserInput(userData);
  const existingUser = await checkExistingUser(userData);

  if (existingUser) {
    throw new ExistingUserError('User already exists', 400);
  }

  const hashedPassword = await hashUserPassword(userData.password);
  const userRecord = await createUserRecord(userData, hashedPassword);

  if (userRecord) {
    const userResponse = formatUserResponse(userRecord);

    generateTokenAndSendCookie(res, userRecord.id);
    return res.status(201).json({
      message: 'Registration done successfully',
      user: userResponse,
    });
  } else {
    throw new CustomError('Registration failed. Please try again later', 500);
  }
});

// @desc Auth user & get token
// @route POST /api/v1/users/auth
// @access Public
const authUser = tryCatch(async (req, res) => {
  const { email, password } = req.body;

  validateAuthInputs(email, password);
  const user = await findUserByEmail(email);

  if (user && (await isPasswordValid(password, user.password))) {
    generateTokenAndSendCookie(res, user.id);
    const userResponse = formatUserResponse(user);
    return res.status(200).json({
      message: 'Login done successfully',
      user: userResponse,
    });
  } else {
    throw new CustomError('Invalid email or password', 400);
  }
});

// @desc Logout user / clear and expire the cookie
// @route POST /api/v1/users/logout
// @access Public
const logoutUser = tryCatch(async (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
    secure: true,
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'User logged out successfully' });
});

const forgotPassword = tryCatch(async (req, res) => {
  const { email } = req.body;

  if (email && !validator.isEmail(email)) {
    throw new InvalidEmailError('Invalid email', 400);
  }

  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  const resetToken = generateResetPasswordToken(res, user.id);
  const resetUrl = `http://localhost:5173/reset?token=${resetToken}`;
  const emailSubject = 'Quizzad Password Reset';
  const emailText =
    'You have requested to reset your password. Please follow the link to reset your password.';
  const emailHtml = `<p>You have requested to reset your password. Please follow the link below to reset your password.</p><a href="${resetUrl}">Reset Password</a>`;

  await sendPasswordResetEmail({
    email: user.email,
    subject: emailSubject,
    text: emailText,
    html: emailHtml,
  });

  res.status(200).json({
    message: 'Password reset instructions sent to your email',
  });
});

const resetPassword = tryCatch(async (req, res) => {
  const resetToken = req.cookies['jwt-reset'];
  const requestToken = req.params.token;

  if (!resetToken || resetToken !== requestToken) {
    throw new CustomError('Invalid or missing reset token', 400);
  }

  const decoded = jwt.verify(requestToken, process.env.JWT_SECRET);

  if (Date.now() >= decoded.exp * 1000) {
    throw new CustomError('Reset token has expired', 400);
  }

  const userId = decoded.userId;
  const newPassword = req.body.password;

  if (newPassword) {
    const isStrongPassword = validator.isStrongPassword(newPassword, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });

    if (!isStrongPassword) {
      throw new WeakPasswordError('Password is too weak', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.clearCookie('jwt-reset');

    res.status(200).json({ message: 'Password reset successfully' });
  } else {
    throw new CustomError('Invalid password', 400);
  }
});

export { authUser, registerUser, logoutUser, forgotPassword, resetPassword };
