import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  allUsers,
  updateStatus,
  deleteUserProfile,
  resetStatus,
} from '../controllers/userController.js';
import { protect, checkAdmin } from '../middlewares/authMiddleware.js';
import upload from '../utils/multer.js';
import imageProcessing from '../middlewares/imageProcessing.js';

//router object
const router = express.Router();

// Routes for all users
router.get('/', protect, checkAdmin, allUsers);

// Routes for getting and updating user profile
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload('profileImage'), imageProcessing, updateUserProfile);

// Routes for updating user status and deleting user profile
router
  .route('/:id')
  .put(protect, checkAdmin, updateStatus)
  .delete(protect, checkAdmin, deleteUserProfile);

router.put('/inactivate/:id', protect, checkAdmin, resetStatus);

export default router;
