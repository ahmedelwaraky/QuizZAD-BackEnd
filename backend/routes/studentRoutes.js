import express from "express";
import { protect, checkAdmin } from "../middlewares/authMiddleware.js";
import {
  allStudents,
  getStudentById,
  deleteStudentById,
} from "../controllers/studentController.js";

const router = express.Router();

// Routes for getting all  students
router.get("/", protect, checkAdmin, allStudents);

// Routes for getting a student by id
router.get("/:id", protect, checkAdmin, getStudentById);

// Routes for deleting a student by id
router.delete("/:id", protect, checkAdmin, deleteStudentById);

export default router;
