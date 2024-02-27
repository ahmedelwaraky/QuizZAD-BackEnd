import tryCatch from "../utils/tryCatch.js";
import {
  CustomError,
  ForbiddenError,
  InvalidRoleError,
  NotFoundError,
} from "../errors/index.js";
import validateRequiredFields from "../helper/validation.js";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Creates a new class with the given class name, description, grade level, and cover image.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {CustomError} If the class is not created.
 * @returns {Promise<void>} A Promise that resolves with the newly created class.
 */
const createClass = tryCatch(async (req, res) => {
  validateRequiredFields(req, res, ["className", "description", "gradeLevel"]);

  const adminId = req.user.admin.id;
  const { className, description, gradeLevel, image } = req.body;

  const newClass = await prisma.class.create({
    data: {
      className,
      description,
      gradeLevel,
      coverImage: image,
      admin: {
        connect: {
          id: adminId,
        },
      },
    },
    include: {
      admin: true,
      teachers: true,
      students: true,
      classQuizzes: true,
    },
  });
  if (!newClass) {
    throw new CustomError("Class not created.", 400);
  }
  res.status(201).json(newClass);
});

/**
 * Retrieves all classes with their associated admin, teachers, students, and quizzes.
 *
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {NotFoundError} If no classes are found.
 * @returns {Promise<void>} - A Promise that resolves with the retrieved classes.
 */
const getClasses = tryCatch(async (req, res) => {
  let filter = {};
  if (req.query.className) { 
    filter = {
      className: {
        contains: req.query.className,
      },
    };
  }
  const classes = await prisma.class.findMany({
    where:filter,
    include: {
      admin: true,
      teachers: {
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              specialization: true,
            },
          },
        },
      },
      students: {
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              gradeLevel: true,
            },
          },
        },
      },
      classQuizzes: true,
    },
  });
  if (!classes) {
    throw new NotFoundError("Classes not found.", 400);
  }
  res.status(200).json(classes);
});

/**
 * Retrieves a class by its ID along with its admin, teachers, students, and quizzes.
 * Throws an error if the class is not found or if the user is not enrolled in the class.
 *
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {NotFoundError} If the class is not found.
 * @throws {ForbiddenError} If the user is not enrolled in the class.
 * @returns {Promise<void>} - The response object with the class and its members.
 */
const getClassById = tryCatch(async (req, res) => {
  const { id } = req.params;
  const classByIdWithMembers = await prisma.class.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      admin: true,
      teachers: {
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              specialization: true,
            },
          },
        },
      },
      students: {
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              gradeLevel: true,
            },
          },
        },
      },
      classQuizzes: true,
    },
  });
  if (!classByIdWithMembers) {
    throw new NotFoundError("Class not found.", 400);
  }
  // Check if the user is a student or teacher and not enrolled in the class
  const isStudent = req.user.role === "STUDENT";
  const isTeacher = req.user.role === "TEACHER";

  if (
    (isStudent &&
      !classByIdWithMembers.students.some(
        (student) => student.id === req.user.student.id
      )) ||
    (isTeacher &&
      !classByIdWithMembers.teachers.some(
        (teacher) => teacher.id === req.user.teacher.id
      ))
  ) {
    throw new ForbiddenError("You are not enrolled in this class.", 403);
  }

  res.status(200).json(classByIdWithMembers);
});

/**
 * Updates a class by ID.
 *
 * @function
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with the updated class object.
 * @throws {NotFoundError} - If the class is not found.
 *
 * @example
 * // PUT /api/classes/1
 * // Request body:
 * // {
 * //   "className": "Math",
 * //   "description": "Mathematics class",
 * //   "gradeLevel": 10
 * // }
 * updateClass(req, res);
 */
const updateClass = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { className, description, gradeLevel, image } = req.body;
  const updatedClass = await prisma.class.update({
    where: {
      id: Number(id),
    },
    data: {
      className,
      description,
      gradeLevel,
      coverImage: image,
    },
  });
  if (!updatedClass) {
    throw new NotFoundError("Class not updated.", 400);
  }
  res.status(200).json(updatedClass);
});

/**
 * Deletes a class by ID.
 *
 * @function
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @throws {NotFoundError} If the class is not found.
 * @returns {Promise<void>} A Promise that resolves with no value.
 */
const deleteClass = tryCatch(async (req, res) => {
  const { id } = req.params;
  const deletedClass = await prisma.class.delete({
    where: {
      id: Number(id),
    },
  });
  if (!deletedClass) {
    throw new NotFoundError("Class not deleted.", 400);
  }
  res.status(200).json(deletedClass);
});

/**
 * Adds a role to a class.
 *
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} roleKey - The key of the role to add.
 * @throws {CustomError} If the role is not added to the class.
 * @returns {Promise<void>} A Promise that resolves with the updated class.
 */
const addRoleToClass = async (req, res, roleKey) => {
  const { id, roleId } = req.params;

  const updatedClass = await prisma.class.update({
    where: {
      id: Number(id),
    },
    data: {
      [roleKey]: {
        connect: {
          id: Number(roleId),
        },
      },
    },
    include: {
      teachers: true,
      students: true,
      classQuizzes: true,
    },
  });

  if (!updatedClass) {
    throw new CustomError(
      `${
        roleKey.charAt(0).toUpperCase() + roleKey.slice(1)
      } not added to class.`,
      400
    );
  }

  res.status(200).json(updatedClass);
};

/**
 * Add a teacher to a class.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Promise object represents the completion of the operation.
 */
const addTeacher = tryCatch(async (req, res) => {
  await addRoleToClass(req, res, "teachers");
});

/**
 * Add a student to a class.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Promise object represents the completion of the operation.
 */
const addStudent = tryCatch(async (req, res) => {
  await addRoleToClass(req, res, "students");
});

// remove a student or a teacher from a class
const removeRoleFromClass = async (req, res, roleKey) => {
  const { id, roleId } = req.params;

  const updatedClass = await prisma.class.update({
    where: {
      id: Number(id),
    },
    data: {
      [roleKey]: {
        disconnect: {
          id: Number(roleId),
        },
      },
    },
    include: {
      teachers: true,
      students: true,
      classQuizzes: true,
    },
  });

  if (!updatedClass) {
    throw new CustomError(
      `${
        roleKey.charAt(0).toUpperCase() + roleKey.slice(1)
      } not removed from class.`,
      400
    );
  }

  res.status(200).json(updatedClass);
};

// remove a teacher from a class
const removeTeacher = tryCatch(async (req, res) => {
  await removeRoleFromClass(req, res, "teachers");
});

// remove a student from a class
const removeStudent = tryCatch(async (req, res) => {
  await removeRoleFromClass(req, res, "students");
});

/**
 * Retrieves the classes associated with the authenticated user.
 * If the user is an admin, all classes created by the admin are returned.
 * If the user is a teacher or student, all classes associated with the user are returned.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {InvalidRoleError} If the user role is invalid.
 * @throws {NotFoundError} If no classes are found.
 * @returns {Promise<void>} - The classes associated with the authenticated user.
 */
const getStudentOrTeacherClasses = tryCatch(async (req, res) => {
  let queryFilters = {};

  if (req.user.role == "ADMIN") {
    const adminId = req.user.admin.id;
    queryFilters = {
      where: {
        createdBy: Number(adminId),
      },
      include: {
        admin: true,
        teachers: true,
        students: true,
        classQuizzes: true,
      },
    };
  } else if (req.user.role == "TEACHER" || req.user.role == "STUDENT") {
    let userRoleKey = req.user.role.toLowerCase();
    const userRoleId = req.user[userRoleKey].id;
    userRoleKey += "s";

    queryFilters = {
      where: {
        [userRoleKey]: {
          some: {
            id: Number(userRoleId),
          },
        },
      },
      include: {
        admin: true,
        teachers: true,
        students: true,
        classQuizzes: true,
      },
    };
  } else {
    throw new InvalidRoleError("Invalid role.", 400);
  }

  const classes = await prisma.class.findMany(queryFilters);

  if (!classes) {
    throw new NotFoundError("Classes not found.", 400);
  }

  res.status(200).json(classes);
});
export {
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
};
