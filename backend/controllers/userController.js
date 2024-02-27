import tryCatch from '../utils/tryCatch.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import pkg, { PrismaClient } from '@prisma/client';
import {
  CustomError,
  InvalidEmailError,
  NotFoundError,
  WeakPasswordError,
} from '../errors/index.js';
import validateRequiredFields from '../helper/validation.js';

const { PrismaClientKnownRequestError, PrismaClientValidationError } = pkg;

const prisma = new PrismaClient();

// @desc Get user profile
// @route GET /api/v1/users/profile
// @access Private
const getUserProfile = tryCatch(async (req, res) => {
  const userId = req.user.id;

  // Fetch the detailed user's profile based on the user ID, excluding the password field
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      phoneNumber: true,
      firstName: true,
      lastName: true,
      gender: true,
      birthdate: true,
      role: true,
      status: true,
      gradeLevel: true,
      specialization: true,
      bio: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
      teacher: {
        select: {
          assignedClasses: true,
          createdQuizzes: true,
        },
      },
      admin: {
        select: {
          createdClasses: true,
          createdQuizzes: true,
        },
      },
      student: {
        select: {
          assignedClasses: true,
          quizAttempts: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found', 404);
  }

  res
    .status(200)
    .json({ message: 'Detailed user profile retrieved successfully', user });
});

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
const updateUserProfile = tryCatch(async (req, res) => {
  const {
    email,
    phoneNumber,
    firstName,
    lastName,
    password,
    birthdate,
    gradeLevel,
    specialization,
    bio,
    image,
  } = req.body;

  const userId = req.user.id;
  const userRole = req.user.role;

  // Define the data you want to update based on the request body
  const updatedData = {
    firstName,
    lastName,
    birthdate,
    bio,
    profileImage: image,
  };

  // Function for email validation and update
  const handleEmail = async (userEmail) => {
    if (!validator.isEmail(email)) {
      throw new InvalidEmailError('Invalid email address.', 400);
    }
    const existingUserWithEmail = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          email: userEmail,
        },
      },
    });
    if (existingUserWithEmail) {
      throw new CustomError('Email is already in use', 400);
    }
    updatedData.email = email;
  };

  // Function for phone number validation and update
  const handlePhoneNumber = async (userPhoneNumber) => {
    if (!validator.isMobilePhone(phoneNumber, 'ar-EG')) {
      throw new CustomError('Invalid phone number', 400);
    }
    const existingUserWithPhoneNumber = await prisma.user.findFirst({
      where: {
        phoneNumber,
        NOT: {
          phoneNumber: userPhoneNumber,
        },
      },
    });
    if (existingUserWithPhoneNumber) {
      throw new CustomError('Phone number is already in use', 400);
    }
    updatedData.phoneNumber = phoneNumber;
  };

  //allow students to update their gradeLevel and teachers to update specialization
  if (userRole === 'STUDENT') {
    updatedData.gradeLevel = gradeLevel;
  }

  if (userRole === 'TEACHER' || userRole === 'ADMIN') {
    updatedData.specialization = specialization;
  }

  // Validation and update for email and phone number
  if (email) {
    await handleEmail(req.user.email);
  }
  if (phoneNumber) {
    await handlePhoneNumber(req.user.phoneNumber);
  }

  if (password) {
    // Validate password strength, and update it if valid
    const isStrongPassword = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });

    if (isStrongPassword) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    } else {
      throw new WeakPasswordError('Password is too weak', 400);
    }
  }
  // Attempt to update the user's profile
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updatedData,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      gender: true,
      birthdate: true,
      bio: true,
      profileImage: true,
      gradeLevel: true,
      specialization: true,
      role: true,
    },
  });

  // Return a success response with the updated user profile
  res.status(200).json({
    message: 'Profile updated successfully',
    user: updatedUser,
  });
});

/**
 * Creates a user profile for the given user ID and admin ID using the specified model.
 * @param {number} user_id - The ID of the user to create a profile for.
 * @param {number} admin_id - The ID of the admin creating the profile.
 * @param {string} model - The name of the model to use for creating the profile.
 * @throws {CustomError} If the profile is not created successfully.
 */
async function createUserProfile(user_id, admin_id, model) {
  const profile = await prisma[model].create({
    data: {
      profile: {
        connect: {
          id: Number(user_id),
        },
      },
      admin: {
        connect: {
          id: Number(admin_id),
        },
      },
    },
  });
  if (!profile) throw new CustomError(`${model} not created`, 400);
}

/**
 * Retrieves all users from the database based on the provided filters.
 *
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {NotFoundError} If no users are found.
 * @returns {Promise<void>} - The response object with the retrieved users.
 */
const allUsers = tryCatch(async (req, res) => {
  const filters = req.query;
  filters.status = 'PENDING';

  const users = await prisma.user.findMany({
    where: filters,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
    },
  });
  if (!users) throw new NotFoundError('Users not found', 404);
  res.status(200).json(users);
});
/**
 * Update user status by admin
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {NotFoundError} User not found
 * @returns {Object} JSON response with message
 */
const updateStatus = tryCatch(async (req, res) => {
  const adminId = req.user.admin.id;
  const { id } = req.params;
  validateRequiredFields(req, res, ['status']);
  const { status } = req.body;
  const user = await prisma.user.update({
    where: {
      id: Number(id),
    },
    data: {
      status,
    },
  });
  if (!user) throw new NotFoundError('User not found', 404);
  if (user.role === 'STUDENT' && status === 'ACTIVE') {
    createUserProfile(id, adminId, 'student');
  } else if (user.role === 'TEACHER' && status === 'ACTIVE') {
    createUserProfile(id, adminId, 'teacher');
  }

  res.status(200).json({
    message: 'User status updated',
  });
});

const deleteUserProfile = tryCatch(async (req, res) => {
  // Get the ID of the user to be deleted from request parameters
  const { id } = req.params;

  // Attempt to delete the user's profile based on their ID
  const deletedUser = await prisma.user.delete({
    where: {
      id: Number(id),
    },
  });

  // If the user is not found, throw an error
  if (!deletedUser) {
    throw new NotFoundError('User not found', 404);
  }

  // Return a success response
  res.status(200).json({
    message: 'User deleted successfully',
  });
});

// @desc Reset user status to PENDING
// @route PUT /api/v1/users/reset/:id
// @access Private (requires admin privileges)
const resetStatus = tryCatch(async (req, res) => {
  const { id } = req.params;

  // Fetch the user to get their role and current status
  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found', 404);
  }

  // If the user is already pending, no need to update anything
  if (user.status === 'PENDING') {
    res.status(200).json({
      message: 'User status is already PENDING',
    });
    return;
  }

  // If the user is a student or teacher and their status was previously active, delete the corresponding profile
  if (
    (user.role === 'STUDENT' || user.role === 'TEACHER') &&
    user.status === 'ACTIVE'
  ) {
    await deleteStudentOrTeacher(user);
  }

  // Update the user status to PENDING
  const updatedUser = await prisma.user.update({
    where: {
      id: Number(id),
    },
    data: {
      status: 'PENDING',
    },
  });

  res.status(200).json({
    message: 'User status reset to PENDING',
    user: updatedUser,
  });
});

/**
 * Deletes the corresponding student or teacher profile based on the user's role.
 * @param {number} userId - The ID of the user whose profile to delete.
 * @param {number} adminId - The ID of the admin initiating the deletion.
 * @param {string} role - The role of the user ('STUDENT' or 'TEACHER').
 * @throws {CustomError} If the profile deletion fails.
 */
async function deleteStudentOrTeacher(user) {
  try {
    const model = user.role.toLowerCase();

    const deletedProfile = await prisma[model].delete({
      where: {
        profileId: user.id,
      },
    });

    return deletedProfile;
  } catch (error) {
    // Handle the error appropriately
    throw new CustomError(`Failed to delete ${role} profile`, 500);
  }
}

export {
  getUserProfile,
  updateUserProfile,
  allUsers,
  updateStatus,
  deleteUserProfile,
  resetStatus,
};
