import express from "express";
import { protect, checkAdmin } from "../middlewares/authMiddleware.js";
import {
  allTeachers,
  getTeacherById,
  deleteTeacherById,
} from "../controllers/teacherController.js";

const router = express.Router();

// Routes for getting all teachers
router.get("/", protect, checkAdmin, allTeachers);

// Routes for getting a teacher by id
router.get("/:id", protect, checkAdmin, getTeacherById);

// Routes for deleting a teacher by id
router.delete("/:id", protect, checkAdmin, deleteTeacherById);

export default router;
