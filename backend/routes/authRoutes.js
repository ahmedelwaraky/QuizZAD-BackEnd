import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

//router object
const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.post('/forgotPassword', forgotPassword);
router.put('/resetPassword/:token', resetPassword);

export default router;
