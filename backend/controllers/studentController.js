import tryCatch from '../utils/tryCatch.js';
import { getAllEntities, getEntityById, deleteEntityById } from './factory.js';

// get all students
const allStudents = tryCatch(async (req, res) => {
  const entities = await getAllEntities(req, res, 'student');
  res.status(200).json(entities);
});

// get student by id
const getStudentById = tryCatch(async (req, res) => {
  const entity = await getEntityById(req, res, 'student');
  res.status(200).json(entity);
});

// delete student by id
const deleteStudentById = tryCatch(async (req, res) => {
  const entity = await deleteEntityById(req, res, 'student');

  // delete the profile associated with the student
  req.params.id = entity.profileId;
  await deleteEntityById(req, res, 'user');
  res.status(200).json(entity);
});

export { allStudents, getStudentById, deleteStudentById };
