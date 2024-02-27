import jwt from 'jsonwebtoken';
import tryCatch from '../utils/tryCatch.js';
import pkg, { PrismaClient } from '@prisma/client';
import { CustomError } from '../errors/index.js';

const prisma = new PrismaClient();
const { PrismaClientKnownRequestError, PrismaClientValidationError } = pkg;

const protect = tryCatch(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      include: {
        admin: true,
        teacher: true,
        student: true,
      },
    });
    req.user = user;

    if (!req.user) {
      throw new CustomError('No user found', 404);
    }

    if (req.user.status === 'PENDING') {
      console.log('PENDING');
      throw new CustomError('User not verified', 401);
    }

    next();
  } else {
    throw new CustomError('Not authorized, no token', 401);
  }
});

const checkAdmin = tryCatch(async (req, res, next) => {
  if (req.user.role === 'ADMIN') {
    next();
  } else {
    throw new CustomError('Not authorized, you are not an admin', 401);
  }
});

export { protect, checkAdmin };
