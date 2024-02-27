import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import colors from 'colors';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import errorHandler from './middlewares/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import classRoutes from './routes/classRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import answerRoutes from './routes/answerRoutes.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import quizAttemptRoutes from './routes/quizAttemptRoutes.js';
import { NotFoundError } from './errors/index.js';

// global variables
const port = process.env.PORT || 8080;
const __dirname = path.resolve();

//configure env
dotenv.config();

// express app server
const app = express();

// HTTP request logger middleware for node.js
app.use(morgan('dev'));

// enable cors
app.use(cors({ origin: 'http://146.190.43.38', credentials: true }));


// set security headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// protect against HTTP Parameter Pollution attacks
app.use(hpp());

// compress all responses
app.use(compression());

// parse json and urlencoded data into req.body
app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser());

// Limit each IP to 100 requests per `window` (here, per 15 minutes)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   message:
//     'Too many accounts created from this IP, please try again after an hour',
// });

// serve static files
app.use(
  '/static',
  express.static(path.join(__dirname, 'backend', 'public', 'uploads'))
);

// Apply the rate limiting middleware to all requests
// app.use('/api/v1', limiter);
//routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/answers', answerRoutes);
app.use('/api/v1/quiz-attempts', quizAttemptRoutes);

// error-handling middlewares
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(
    `Server Running on ${process.env.NODE_ENV} mode on port ${port}`.bgCyan
      .white
  );
});

// Handle rejection outside express
process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});

// Handle uncaughtException outside express
process.on('uncaughtException', (err) => {
  console.error(`uncaughtException Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
