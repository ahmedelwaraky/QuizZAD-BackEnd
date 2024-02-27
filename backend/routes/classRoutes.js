import express from "express";
import { protect, checkAdmin } from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";
import imageProcessing from "../middlewares/imageProcessing.js";
import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  addTeacher,
  addStudent,
  removeTeacher,
  removeStudent,
  getStudentOrTeacherClasses,
} from "../controllers/classController.js";

const router = express.Router();

// Routes for handling classes
router
  .route("/")
  .get(protect, checkAdmin, getClasses)
  .post(
    protect,
    checkAdmin,
    upload("coverImage"),
    imageProcessing,
    createClass
  );

// Route for getting student or teacher classes
router.route("/my-classes").get(protect, getStudentOrTeacherClasses);

router
  .route("/:id")
  .get(protect, getClassById)
  .put(protect, checkAdmin, upload("coverImage"), imageProcessing, updateClass)
  .delete(protect, checkAdmin, deleteClass);

// Routes for handling teachers and students in a class
router.route("/:id/add-teachers/:roleId").put(protect, checkAdmin, addTeacher);
router.route("/:id/add-students/:roleId").put(protect, checkAdmin, addStudent);
router.route("/:id/remove-teachers/:roleId").put(protect, checkAdmin, removeTeacher);
router.route("/:id/remove-students/:roleId").put(protect, checkAdmin, removeStudent);

export default router;
