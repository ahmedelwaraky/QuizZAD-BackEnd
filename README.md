# API Documentation

## Base URL

- All endpoints are relative to the base URL: `https://your-api-base-url.com/api/v1`

## Authentication

- API uses [httpOnly cookie]. Include the authentication details in the header of your requests.

## Error Handling

- API returns standard HTTP status codes and follows RESTful principles for error handling. Here are some common status codes:

  - `200 OK`: The request was successful.
  - `201 Created`: The resource was successfully created.
  - `400 Bad Request`: The request was malformed or missing parameters.
  - `401 Unauthorized`: Authentication failed or user doesn't have permission.
  - `404 Not Found`: The requested resource was not found.
  - `500 Internal Server Error`: An unexpected error occurred on the server.

## dataBase

Certainly! Let's create a basic documentation for your schema and `server.js` file.

#### Schema

Prisma schema defines the data model for your application. It includes models for Users, Admins, Teachers, Students, Classes, Quizzes, Questions, Answers, Quiz Attempts, and more.

##### Enums:

- `Status`: PENDING, ACTIVE, BLOCKED
- `QuestionType`: MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_THE_BLANK
- `Gender`: MALE, FEMALE
- `Role`: ADMIN, TEACHER, STUDENT
- `Term`: FIRST, SECOND
- `Difficulty`: EASY, MEDIUM, HARD
- `QuizType`: EXAM, PRACTICE
- `GradeLevel`: PRIMARY_ONE, PRIMARY_TWO, ..., SECONDARY_THREE

##### Models:

- **User**

  - Attributes: id, email, phoneNumber, password, firstName, lastName, birthdate, gender, bio, profileImage, role, gradeLevel, specialization, status, createdAt, updatedAt
  - Relations: admin, teacher, student

- **Admin**

  - Attributes: id, createdAt
  - Relations: profile, approvedTeachers, approvedStudents, createdClasses, createdQuizzes

- **Teacher**

  - Attributes: id, createdAt
  - Relations: profile, admin, assignedClasses, createdQuizzes

- **Student**

  - Attributes: id, createdAt
  - Relations: profile, admin, assignedClasses, quizAttempts

- **Class**

  - Attributes: id, className, description, gradeLevel, coverImage, createdAt, updatedAt
  - Relations: admin, teachers, students, classQuizzes

- **Quiz**

  - Attributes: id, title, subject, description, gradeLevel, term, unit, chapter, lesson, passingScore, difficultyLevel, quizImage, duration, deadlineDate, immediateFeedback, numOfAllowedAttempts, isPublic, createdAt, updatedAt
  - Relations: creatorAdmin, adminId, creatorTeacher, teacherId, classes, questions, quizAttempts

- **Question**

  - Attributes: id, questionType, questionText, gradePoints, timeLimit, difficultyLevel, questionImage, createdAt, updatedAt
  - Relations: answers, quiz, quizId

- **QuestionAnswer**

  - Attributes: id, isCorrect, answerText, correctAnswerExplanation, answerAsImage, createdAt, updatedAt
  - Relations: question, questionId, selectedByStudent

- **StudentQuizAttempt**

  - Attributes: id, startTime, endTime, score, isCompleted, passed, createdAt, updatedAt
  - Relations: student, studentId, quiz, quizId, answers

- **StudentAnswer**
  - Attributes: id, createdAt, updatedAt
  - Relations: studentQuizAttempt, attemptId, selectedAnswer, selectedAnswerId

## express web server

#### `server.js`

`server.js` file sets up the Express server with various middlewares and routes.

- **Middlewares:**

  - `morgan`: HTTP request logger middleware
  - `cors`: Enable Cross-Origin Resource Sharing
  - `helmet`: Set security headers
  - `hpp`: Protect against HTTP Parameter Pollution attacks
  - `compression`: Compress all responses
  - `rateLimit`: Limit requests per IP
  - `cookieParser`: Parse cookies
  - `express.json()`: Parse JSON data
  - `express.urlencoded()`: Parse application/x-www-form-urlencoded data

- **Static File Serving:**

  - Serve static files from `/static` directory for uploads

- **Rate Limiting:**

  - Limit requests on `/api/v1` to prevent abuse

- **Routes:**

  - `/api/v1/auth`: Authentication routes
  - `/api/v1/users`: User-related routes
  - `/api/v1/students`: Student-related routes
  - `/api/v1/teachers`: Teacher-related routes
  - `/api/v1/classes`: Class-related routes
  - `/api/v1/quizzes`: Quiz-related routes
  - `/api/v1/questions`: Question-related routes
  - `/api/v1/answers`: Answer-related routes
  - `/api/v1/quiz-attempts`: Quiz Attempt-related routes

- **Error Handling:**

  - Handle 404 errors with a custom NotFoundError
  - Use the `errorHandler` middleware to manage other errors

- **Server Setup:**

  - Start the Express server on the specified port (default is 8080)

- **Error Handling on Process Events:**
  - Handle unhandled promise rejections and uncaught exceptions

## Endpoints

### Authentication API Documentation

Below is a basic documentation for your authentication routes.

#### 1. Sign Up

**Endpoint:** `POST /api/v1/auth/signup`

**Description:** Register a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "phoneNumber": "+1234567890",
  "password": "your_password",
  "firstName": "John",
  "lastName": "Doe",
  "birthdate": "1990-01-01",
  "gender": "MALE",
  "role": "STUDENT"
  // ... other fields based on schema
}
```

**Responses:**

- `201 Created`
  ```json
  {
    "message": "Registration done successfully",
    "user": {
      // User data
    }
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "ExistingUserError",
    "message": "User already exists"
  }
  ```
- `500 Internal Server Error`
  ```json
  {
    "error": "CustomError",
    "message": "Registration failed. Please try again later"
  }
  ```

#### 2. Login

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Authenticate user and get a token as an httpOnly cookie.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Responses:**

- `200 OK`
  ```json
  {
    "message": "Login done successfully",
    "user": {
      // User data
    }
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "CustomError",
    "message": "Invalid email or password"
  }
  ```

#### 3. Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Description:** Logout user and clear the authentication cookie.

**Responses:**

- `200 OK`
  ```json
  {
    "message": "User logged out successfully"
  }
  ```

#### 4. Forgot Password

**Endpoint:** `POST /api/v1/auth/forgotPassword`

**Description:** Request a password reset.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Responses:**

- `200 OK`
  ```json
  {
    "message": "Password reset instructions sent to your email"
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "InvalidEmailError",
    "message": "Invalid email"
  }
  ```
- `404 Not Found`
  ```json
  {
    "error": "CustomError",
    "message": "User not found"
  }
  ```

#### 5. Reset Password

**Endpoint:** `PUT /api/v1/auth/resetPassword/:token`

**Description:** Reset user password.

**Request Params:**

- `token`: Reset token sent as an httpOnly cookie and reset link received via email.

**Request Body:**

```json
{
  "password": "new_password"
}
```

**Responses:**

- `200 OK`
  ```json
  {
    "message": "Password reset successfully"
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "CustomError",
    "message": "Invalid or missing reset token"
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "CustomError",
    "message": "Reset token has expired"
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "WeakPasswordError",
    "message": "Password is too weak"
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "CustomError",
    "message": "Invalid password"
  }
  ```

### User API Documentation

#### 1. Get All Users

**Endpoint:** `GET /api/v1/users`

**Description:** Retrieve a list of all users only by admin.

**Query Parameters:**

- `status` (optional): Filter users by status (e.g., `PENDING`).

**Responses:**

- `200 OK`
  ```json
  [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "STUDENT",
      "status": "PENDING"
    }
    // ... other users
  ]
  ```
- `404 Not Found`
  ```json
  {
    "error": "NotFoundError",
    "message": "Users not found"
  }
  ```

#### 2. Get User Profile

**Endpoint:** `GET /api/v1/users/profile`

**Description:** Retrieve detailed user profile information.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Responses:**

- `200 OK`
  ```json
  {
    "message": "Detailed user profile retrieved successfully",
    "user": {
      // User profile details
    }
  }
  ```
- `404 Not Found`
  ```json
  {
    "error": "NotFoundError",
    "message": "User not found"
  }
  ```

#### 3. Update User Profile

**Endpoint:** `PUT /api/v1/users/profile`

**Description:** Update the user profile.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Body:**

```json
{
  "email": "new_email@example.com",
  "phoneNumber": "+1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "password": "new_password",
  "birthdate": "1990-01-01",
  "gradeLevel": "PRIMARY_ONE",
  "specialization": "Math",
  "bio": "A brief bio",
  "image": "base64_encoded_image"
}
```

**Responses:**

- `200 OK`
  ```json
  {
    "message": "Profile updated successfully",
    "user": {
      // Updated user profile details
    }
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "InvalidEmailError",
    "message": "Invalid email address."
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "CustomError",
    "message": "Email is already in use"
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "CustomError",
    "message": "Invalid phone number"
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "CustomError",
    "message": "Phone number is already in use"
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "WeakPasswordError",
    "message": "Password is too weak"
  }
  ```

#### 4. Update User Status

**Endpoint:** `PUT /api/v1/users/:id`

**Description:** Update the user status (only for admins).

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Params:**

- `id`: User ID to update.

**Request Body:**

```json
{
  "status": "ACTIVE"
}
```

**Responses:**

- `200 OK`
  ```json
  {
    "message": "User status updated"
  }
  ```
- `404 Not Found`
  ```json
  {
    "error": "NotFoundError",
    "message": "User not found"
  }
  ```

#### 5. Delete User Profile

**Endpoint:** `DELETE /api/v1/users/:id`

**Description:** Delete a user's profile (only for admins).

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Params:**

- `id`: User ID to delete.

**Responses:**

- `200 OK`
  ```json
  {
    "message": "User deleted successfully"
  }
  ```
- `404 Not Found`
  ```json
  {
    "error": "NotFoundError",
    "message": "User not found"
  }
  ```

### Student API Documentation

#### 1. Get All Students

**Endpoint:** `GET /api/v1/students`

**Description:** Retrieve a list of all students.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Responses:**

- `200 OK`
  ```json
  [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "status": "ACTIVE"
      // ... other student details
    }
    // ... other students
  ]
  ```
- `404 Not Found`
  ```json
  {
    "error": "NotFoundError",
    "message": "Students not found"
  }
  ```

#### 2. Get Student by ID

**Endpoint:** `GET /api/v1/students/:id`

**Description:** Retrieve details of a specific student by ID.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login..

**Request Params:**

- `id`: Student ID.

**Responses:**

- `200 OK`
  ```json
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "status": "ACTIVE"
    // ... other student details
  }
  ```
- `404 Not Found`
  ```json
  {
    "error": "NotFoundError",
    "message": "Student not found"
  }
  ```

#### 3. Delete Student by ID

**Endpoint:** `DELETE /api/v1/students/:id`

**Description:** Delete a specific student by ID.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Params:**

- `id`: Student ID.

**Responses:**

- `200 OK`
  ```json
  {
    "message": "Student deleted successfully"
  }
  ```
- `404 Not Found`
  ```json
  {
    "error": "NotFoundError",
    "message": "Student not found"
  }
  ```

### Teacher API Documentation

#### 1. Get All Teachers

**Endpoint:** `GET /api/v1/teachers`

**Description:** Retrieve a list of all teachers.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Responses:**

- `200 OK`
  ```json
  [
    {
      "id": 1,
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane.doe@example.com",
      "status": "ACTIVE"
      // ... other teacher details
    }
    // ... other teachers
  ]
  ```
- `404 Not Found`
  ```json
  {
    "error": "NotFoundError",
    "message": "Teachers not found"
  }
  ```

#### 2. Get Teacher by ID

**Endpoint:** `GET /api/v1/teachers/:id`

**Description:** Retrieve details of a specific teacher by ID.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Params:**

- `id`: Teacher ID.

**Responses:**

- `200 OK`
  ```json
  {
    "id": 1,
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "status": "ACTIVE"
    // ... other teacher details
  }
  ```
- `404 Not Found`
  ```json
  {
    "error": "NotFoundError",
    "message": "Teacher not found"
  }
  ```

#### 3. Delete Teacher by ID

**Endpoint:** `DELETE /api/v1/teachers/:id`

**Description:** Delete a specific teacher by ID.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Params:**

- `id`: Teacher ID.

**Responses:**

- `200 OK`
  ```json
  {
    "message": "Teacher deleted successfully"
  }
  ```
- `404 Not Found`
  ```json
  {
    "error": "NotFoundError",
    "message": "Teacher not found"
  }
  ```

### Classes API Documentation

#### 1. Get All Classes

**Endpoint:** `GET /api/v1/classes`

**Description:** Retrieve a list of all classes.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Optional Query Parameter:**

- `className`: Filter classes by name.

**Responses:**

- `200 OK`
  ```json
  [
    {
      "id": 1,
      "className": "Math",
      "description": "Mathematics class",
      "gradeLevel": 10
      // ... other class details
    }
    // ... other classes
  ]
  ```
- `404 Not Found`
  ```json
  {
    "error": "NotFoundError",
    "message": "Classes not found"
  }
  ```

#### 2. Get Class by ID

**Endpoint:** `GET /api/v1/classes/:id`

**Description:** Retrieve details of a specific class by ID.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Params:**

- `id`: Class ID.

**Responses:**

- `200 OK`
  ```json
  {
    "id": 1,
    "className": "Math",
    "description": "Mathematics class",
    "gradeLevel": 10
    // ... other class details
  }
  ```
- `404 Not Found`
  ```json
  {
    "error": "NotFoundError",
    "message": "Class not found"
  }
  ```
- `403 Forbidden`
  ```json
  {
    "error": "ForbiddenError",
    "message": "You are not enrolled in this class."
  }
  ```

#### 3. Create a New Class

**Endpoint:** `POST /api/v1/classes`

**Description:** Create a new class.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Body:**

- `className`: Name of the class.
- `description`: Description of the class.
- `gradeLevel`: Grade level for the class.
- `coverImage` (Optional): Cover image for the class.

**Responses:**

- `201 Created`
  ```json
  {
    "id": 1,
    "className": "Math",
    "description": "Mathematics class",
    "gradeLevel": 10
    // ... other class details
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "CustomError",
    "message": "Class not created."
  }
  ```

#### 4. Update Class by ID

**Endpoint:** `PUT /api/v1/classes/:id`

**Description:** Update details of a specific class by ID.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Params:**

- `id`: Class ID.

**Request Body:**

- `className` (Optional): New name of the class.
- `description` (Optional): New description of the class.
- `gradeLevel` (Optional): New grade level for the class.
- `coverImage` (Optional): New cover image for the class.

**Responses:**

- `200 OK`
  ```json
  {
    "id": 1,
    "className": "Updated Math",
    "description": "Updated Mathematics class",
    "gradeLevel": 11
    // ... other updated class details
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "NotFoundError",
    "message": "Class not updated."
  }
  ```

#### 5. Delete Class by ID

**Endpoint:** `DELETE /api/v1/classes/:id`

**Description:** Delete a specific class by ID.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Params:**

- `id`: Class ID.

**Responses:**

- `200 OK`
  ```json
  {
    "id": 1,
    "className": "Math",
    "description": "Mathematics class",
    "gradeLevel": 10
    // ... other deleted class details
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "NotFoundError",
    "message": "Class not deleted."
  }
  ```

#### 6. Get Student or Teacher Classes

**Endpoint:** `GET /api/v1/classes/my-classes`

**Description:** Retrieve classes associated with the authenticated user.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Responses:**

- `200 OK`
  ```json
  [
    {
      "id": 1,
      "className": "Math",
      "description": "Mathematics class",
      "gradeLevel": 10
      // ... other class details
    }
    // ... other classes
  ]
  ```
- `400 Bad Request`
  ```json
  {
    "error": "InvalidRoleError",
    "message": "Invalid role."
  }
  ```
- `404 Not Found`
  ```json
  {
    "error": "NotFoundError",
    "message": "Classes not found."
  }
  ```

#### 7. Add Teacher to Class

**Endpoint:** `PUT /api/v1/classes/:id/add-teachers/:roleId`

**Description:** Add a teacher to a specific class.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Params:**

- `id`: Class ID.
- `roleId`: Teacher ID.

**Responses:**

- `200 OK`
  ```json
  {
    "id": 1,
    "className": "Math",
    "description": "Mathematics class",
    "gradeLevel": 10
    // ... other updated class details
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "CustomError",
    "message": "Teachers not added to class."
  }
  ```

#### 8. Add Student to Class

**Endpoint:** `PUT /api/v1/classes/:id/add-students/:roleId`

**Description:** Add a student to a specific class.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Params:**

- `id`: Class ID.
- `roleId`: Student ID.

**Responses:**

- `200 OK`
  ```json
  {
    "id": 1,
    "className": "Math",
    "description": "Mathematics class",
    "gradeLevel": 10
    // ... other updated class details
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "CustomError",
    "message": "Students not added to class."
  }
  ```

#### 9. Remove Teacher from Class

**Endpoint:** `PUT /api/v1/classes/:id/remove-teachers/:roleId`

**Description:** Remove a teacher from a specific class.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Params:**

- `id`: Class ID.
- `roleId`: Teacher ID.

**Responses:**

- `200 OK`

```json
{
  "id": 1,
  "className": "Math",
  "description": "Mathematics class",
  "gradeLevel": 10
  // ... other updated class details
}
```

- `400 Bad Request`

```json
{
  "error": "CustomError",
  "message": "Teachers not removed from class."
}
```

#### 10. Remove Student from Class

**Endpoint:** `PUT /api/v1/classes/:id/remove-students/:roleId`

**Description:** Remove a student from a specific class.

**cookies:**

- `Authorization`: httpOnly cookie token obtained during user login.

**Request Params:**

- `id`: Class ID.
- `roleId`: Student ID.

**Responses:**

- `200 OK`
  ```json
  {
    "id": 1,
    "className": "Math",
    "description": "Mathematics class",
    "gradeLevel": 10
    // ... other updated class details
  }
  ```
- `400 Bad Request`
  ```json
  {
    "error": "CustomError",
    "message": "Students not removed from class."
  }
  ```

# Quiz API Documentation

This API allows users to manage quizzes, including creating, retrieving, updating, and deleting quizzes. Additionally, it provides functionality to assign and unassign quizzes to/from classes and manage quiz questions.

## Table of Contents

1. [Create Quiz](#create-quiz)
2. [Get Quizzes](#get-quizzes)
3. [Get All Public Quizzes](#get-all-public-quizzes)
4. [Get Quiz by ID](#get-quiz-by-id)
5. [Update Quiz](#update-quiz)
6. [Delete Quiz](#delete-quiz)
7. [Assign Quiz to Class](#assign-quiz-to-class)
8. [Unassign Quiz from Class](#unassign-quiz-from-class)
9. [Create Quiz Question](#create-quiz-question)
10. [Retrieve Quiz Questions](#retrieve-quiz-questions)

## Create Quiz

### Endpoint

`POST /api/v1/quizzes/`

### Authentication

- Users must be authenticated.

### Request

- Body:

  ```json
  {
    "title": "Quiz Title",
    "subject": "Quiz Subject",
    "description": "Quiz Description",
    "gradeLevel": "PRIMARY_ONE",
    "term": "FIRST",
    "unit": "Unit 1",
    "chapter": "Chapter 1",
    "lesson": "Lesson 1",
    "passingScore": 70,
    "difficultyLevel": "MEDIUM",
    "duration": 60,
    "deadlineDate": "2023-12-31T23:59:59.999Z",
    "numOfAllowedAttempts": 3
    // Other quiz properties...
  }
  ```

### Response

- Status: 201 Created
- Body:

  ```json
  {
    "message": "Quiz created successfully",
    "quiz": {
      // Quiz details...
    }
  }
  ```

## Get Quizzes

### Endpoint

`GET /api/v1/quizzes/`

### Authentication

- Users must be authenticated.

### Query Parameters

- `filter`: Filter quizzes based on the role (`created`, `class`, `public`).

### Response

- Status: 200 OK
- Body:

  ```json
  {
    "message": "Quizzes retrieved successfully",
    "quizzes": [
      {
        // Quiz details...
      }
      // Additional quizzes...
    ]
  }
  ```

## Get All Public Quizzes

### Endpoint

`GET /api/v1/quizzes/public`

### Authentication

- Users must be authenticated.

### Response

- Status: 200 OK
- Body:

  ```json
  {
    "message": "Quizzes retrieved successfully",
    "quizzes": [
      {
        // Quiz details...
      }
      // Additional quizzes...
    ]
  }
  ```

## Get Quiz by ID

### Endpoint

`GET /api/v1/quizzes/:quizId`

### Authentication

- Users must be authenticated.

### Response

- Status: 200 OK
- Body:

  ```json
  {
    "message": "Quiz retrieved successfully",
    "quiz": {
      // Quiz details...
    }
  }
  ```

## Update Quiz

### Endpoint

`PUT /api/v1/quizzes/:quizId`

### Authentication

- Users must be authenticated.

### Request

- Body:

  ```json
  {
    // Updated quiz properties...
  }
  ```

### Response

- Status: 200 OK
- Body:

  ```json
  {
    "message": "Quiz updated successfully",
    "updatedQuiz": {
      // Updated quiz details...
    }
  }
  ```

## Delete Quiz

### Endpoint

`DELETE /api/v1/quizzes/:quizId`

### Authentication

- Users must be authenticated and have admin privileges.

### Response

- Status: 200 OK
- Body:

  ```json
  {
    "message": "Quiz Deleted successfully",
    "deletedQuiz": {
      // Deleted quiz details...
    }
  }
  ```

## Assign Quiz to Class

### Endpoint

`POST /api/v1/quizzes/:quizId/assign/:classId`

### Authentication

- Users must be authenticated.

### Response

- Status: 200 OK
- Body:

  ```json
  {
    "message": "Quiz assigned to class successfully"
  }
  ```

## Unassign Quiz from Class

### Endpoint

`POST /api/v1/quizzes/:quizId/unassign/:classId`

### Authentication

- Users must be authenticated.

### Response

- Status: 200 OK
- Body:

  ```json
  {
    "message": "Quiz unassigned from class successfully"
  }
  ```

## Create Quiz Question

### Endpoint

`POST /api/v1/quizzes/:quizId/questions`

### Authentication

- Users must be authenticated.

### Request

- Body:

  ```json
  {
    "questionType": "MULTIPLE_CHOICE",
    "questionText": "What is the capital of France?",
    "gradePoints": 5
    // Other question properties...
  }
  ```

### Response

- Status: 201 Created
- Body:

  ```json
  {
    "message": "Question created successfully",
    "question": {
      // Question details...
    }
  }
  ```

## Retrieve Quiz Questions

### Endpoint

`GET /api/v1/quizzes/:quizId/questions`

### Authentication

- Users must be authenticated.

### Response

- Status: 200 OK
- Body:

  ```json
  {
    "message": "Questions retrieved successfully",
    "questions": [
      {
        // Question details...
      }
      // Additional questions...
    ]
  }
  ```

## Questions API Documentation

This document outlines the API endpoints for managing questions.

### Table of Contents

1. [Delete Question](#delete-question)
2. [Update Question](#update-question)
3. [Create Answer for Question](#create-answer-for-question)

### 1. Delete Question <a name="delete-question"></a>

**Endpoint:** `DELETE /questions/:questionId`

Deletes a question.

#### Request

- **Authentication:** Required (Admin only)
- **Parameters:**
  - `questionId`: ID of the question to be deleted (integer)

#### Response

- **Success Response (200):**

  - **Content:**
    ```json
    {
      "message": "Question deleted successfully",
      "deletedQuestion": {
        // Deleted question details
      }
    }
    ```

- **Error Responses:**
  - **404 Not Found:**
    - **Content:**
      ```json
      {
        "error": "Question not found"
      }
      ```

### 2. Update Question <a name="update-question"></a>

**Endpoint:** `PUT ('/api/v1/questions/:questionId`

Updates a question.

#### Request

- **Authentication:** Required
- **Parameters:**
  - `questionId`: ID of the question to be updated (integer)
- **Body:**
  - Fields to be updated

#### Response

- **Success Response (200):**

  - **Content:**
    ```json
    {
      "message": "Question updated successfully",
      "updatedQuestion": {
        // Updated question details
      }
    }
    ```

- **Error Responses:**
  - **404 Not Found:**
    - **Content:**
      ```json
      {
        "error": "Question not found"
      }
      ```

### 3. Create Answer for Question <a name="create-answer-for-question"></a>

**Endpoint:** `POST /api/v1/questions/:questionId/answers`

Creates an answer for a specific question.

#### Request

- **Authentication:** Required
- **Parameters:**
  - `questionId`: ID of the question to which the answer will be added (integer)
- **Body:**
  - `isCorrect`: Whether the answer is correct (boolean)
  - `answerText`: Text of the answer (string)
  - `correctAnswerExplanation`: Explanation for why the answer is correct (string)
  - `image`: Image associated with the answer (string, URL)

#### Response

- **Success Response (201):**

  - **Content:**
    ```json
    {
      "message": "Answer created successfully",
      "answer": {
        // Created answer details
      }
    }
    ```

- **Error Responses:**
  - **403 Forbidden:**
    - **Content:**
      ```json
      {
        "error": "You are not authorized"
      }
      ```
  - **400 Bad Request:**
    - **Content:**
      ```json
      {
        "error": "Missing required fields"
      }
      ```

## Answers API Documentation

This document outlines the API endpoints for managing answers to questions.

### Table of Contents

1. [Update Answer](#update-answer)
2. [Delete Answer](#delete-answer)

### 1. Update Answer <a name="update-answer"></a>

**Endpoint:** `PUT /api/v1/answers/:answerId`

Updates an answer.

#### Request

- **Authentication:** Required
- **Parameters:**
  - `answerId`: ID of the answer to be updated (integer)
- **Body:**
  - Fields to be updated

#### Response

- **Success Response (200):**

  - **Content:**
    ```json
    {
      "message": "Answer updated successfully",
      "updatedAnswer": {
        // Updated answer details
      }
    }
    ```

- **Error Responses:**
  - **403 Forbidden:**
    - **Content:**
      ```json
      {
        "error": "You are not authorized to update this answer"
      }
      ```
  - **404 Not Found:**
    - **Content:**
      ```json
      {
        "error": "Answer not found"
      }
      ```

### 2. Delete Answer <a name="delete-answer"></a>

**Endpoint:** `DELETE /api/v1/answers/:answerId`

Deletes an answer.

#### Request

- **Authentication:** Required
- **Parameters:**
  - `answerId`: ID of the answer to be deleted (integer)

#### Response

- **Success Response (200):**

  - **Content:**
    ```json
    {
      "message": "Answer deleted successfully"
    }
    ```

- **Error Responses:**
  - **403 Forbidden:**
    - **Content:**
      ```json
      {
        "error": "You are not authorized to delete this answer"
      }
      ```
  - **404 Not Found:**
    - **Content:**
      ```json
      {
        "error": "Answer not found"
      }
      ```

## Quiz Attempts API Documentation

This document outlines the API endpoints for managing quiz attempts by students.

### Table of Contents

1. [Start Quiz Attempt](#start-quiz-attempt)
2. [Update Student Quiz Attempt](#update-student-quiz-attempt)
3. [Get Quiz Attempts for Quiz](#get-quiz-attempts-for-quiz)
4. [Get Student Attempts](#get-student-attempts)
5. [Delete Quiz Attempt](#delete-quiz-attempt)
6. [Submit Student Answer](#submit-student-answer)
7. [Update Student Answer](#update-student-answer)
8. [Get Student Answers for Attempt](#get-student-answers-for-attempt)

### 1. Start Quiz Attempt <a name="start-quiz-attempt"></a>

**Endpoint:** `POST  /api/v1/quiz-attempts/start-quiz-attempt`

Starts a new quiz attempt for a student.

#### Request

- **Authentication:** Required (Student)
- **Body:**
  - `quizId`: ID of the quiz to attempt (integer)

#### Response

- **Success Response (201):**

  - **Content:**
    ```json
    {
      // Quiz attempt details
    }
    ```

- **Error Responses:**
  - **403 Forbidden:**
    - **Content:**
      ```json
      {
        "error": "Not authorized to view this quiz attempt."
      }
      ```
  - **404 Not Found:**
    - **Content:**
      ```json
      {
        "error": "Quiz not found."
      }
      ```

### 2. Update Student Quiz Attempt <a name="update-student-quiz-attempt"></a>

**Endpoint:** `PUT  /api/v1/quiz-attempts/update-quiz-attempt`

Updates an existing quiz attempt when a student submits their answers.

#### Request

- **Authentication:** Required (Student)
- **Body:**
  - `attemptId`: ID of the quiz attempt (integer)
  - `answers`: Array of student answers
  - `passingScore`: Passing score for the quiz

#### Response

- **Success Response (200):**

  - **Content:**
    ```json
    {
      "message": "Quiz attempt updated successfully",
      "updatedAttempt": {
        // Updated quiz attempt details
      }
    }
    ```

- **Error Responses:**
  - **403 Forbidden:**
    - **Content:**
      ```json
      {
        "error": "Not authorized to update this quiz attempt."
      }
      ```
  - **404 Not Found:**
    - **Content:**
      ```json
      {
        "error": "Quiz attempt not found."
      }
      ```

### 3. Get Quiz Attempts for Quiz <a name="get-quiz-attempts-for-quiz"></a>

**Endpoint:** `GET  /api/v1/quiz-attempts/quiz-attempts/:quizId`

Retrieves a list of all quiz attempts for a particular quiz.

#### Request

- **Authentication:** Required (Student)
- **Parameters:**
  - `quizId`: ID of the quiz (integer)

#### Response

- **Success Response (200):**

  - **Content:**
    ```json
    [
      {
        // Quiz attempt details
      }
      // Additional attempts
    ]
    ```

- **Error Responses:**
  - **404 Not Found:**
    - **Content:**
      ```json
      {
        "error": "Quiz attempts not found."
      }
      ```

### 4. Get Student Attempts <a name="get-student-attempts"></a>

**Endpoint:** `GET  /api/v1/quiz-attempts/student-attempts/:studentId`

Retrieves a list of all quiz attempts for a particular student.

#### Request

- **Authentication:** Required (Student)
- **Parameters:**
  - `studentId`: ID of the student (integer)

#### Response

- **Success Response (200):**

  - **Content:**
    ```json
    [
      {
        // Quiz attempt details
      }
      // Additional attempts
    ]
    ```

- **Error Responses:**
  - **404 Not Found:**
    - **Content:**
      ```json
      {
        "error": "Student attempts not found."
      }
      ```

### 5. Delete Quiz Attempt <a name="delete-quiz-attempt"></a>

**Endpoint:** `DELETE  /api/v1/quiz-attempts/delete-attempt/:attemptId`

Deletes a single quiz attempt by its ID.

#### Request

- **Authentication:** Required (Student)
- **Parameters:**
  - `attemptId`: ID of the quiz attempt (integer)

#### Response

- **Success Response (200):**

  - **Content:**
    ```json
    {
      "message": "Quiz attempt deleted successfully"
    }
    ```

- **Error Responses:**
  - **404 Not Found:**
    - **Content:**
      ```json
      {
        "error": "Quiz attempt not found."
      }
      ```

### 6. Submit Student Answer <a name="submit-student-answer"></a>

**Endpoint:** `POST  /api/v1/quiz-attempts/submit-student-answer`

Creates a new student answer when a student submits an answer.

#### Request

- **Authentication:** Required (Student)
- **Body:**
  - `attemptId`: ID of the quiz attempt (integer)
  - `questionId`: ID of the question (integer)
  - `selectedAnswerId`: ID of the selected answer (integer)

#### Response

- \*\*

Success Response (201):\*\*

- **Content:**

  ```json
  {
    // Submitted answer details
  }
  ```

- **Error Responses:**
  - **400 Bad Request:**
    - **Content:**
      ```json
      {
        "error": "Invalid attempt ID or the attempt is already completed."
      }
      ```
    - **Content:**
      ```json
      {
        "error": "The question does not belong to the quiz for this attempt."
      }
      ```
    - **Content:**
      ```json
      {
        "error": "Answer for this question is already submitted."
      }
      ```

### 7. Update Student Answer <a name="update-student-answer"></a>

**Endpoint:** `PUT  /api/v1/quiz-attempts/update-student-answer`

Updates an existing student answer if needed.

#### Request

- **Authentication:** Required (Student)
- **Body:**
  - `answerId`: ID of the student answer (integer)
  - `selectedAnswerId`: ID of the updated selected answer (integer)

#### Response

- **Success Response (200):**

  - **Content:**
    ```json
    {
      "message": "Answer updated successfully",
      "updatedAnswer": {
        // Updated answer details
      }
    }
    ```

- **Error Responses:**
  - **400 Bad Request:**
    - **Content:**
      ```json
      {
        "error": "Invalid answer ID or the associated attempt is completed."
      }
      ```
  - **404 Not Found:**
    - **Content:**
      ```json
      {
        "error": "Answer not found."
      }
      ```

### 8. Get Student Answers for Attempt <a name="get-student-answers-for-attempt"></a>

**Endpoint:** `GET  /api/v1/quiz-attempts/student-answers/:attemptId`

Retrieves a list of all student answers for a particular quiz attempt.

#### Request

- **Authentication:** Required (Student)
- **Parameters:**
  - `attemptId`: ID of the quiz attempt (integer)

#### Response

- **Success Response (200):**

  - **Content:**
    ```json
    [
      {
        // Student answer details
      }
      // Additional answers
    ]
    ```

- **Error Responses:**
  - **404 Not Found:**
    - **Content:**
      ```json
      {
        "error": "Attempt not found."
      }
      ```
