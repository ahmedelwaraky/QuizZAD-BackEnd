import tryCatch from '../utils/tryCatch.js';
import { getAllEntities, getEntityById, deleteEntityById } from './factory.js';

// get all teachers
const allTeachers = tryCatch(async (req, res) => {
  const entities = await getAllEntities(req, res, 'teacher');
  res.status(200).json(entities);
});

// get teacher by id
const getTeacherById = tryCatch(async (req, res) => {
  const entity = await getEntityById(req, res, 'teacher');
  res.status(200).json(entity);
});

// delete teacher by id
const deleteTeacherById = tryCatch(async (req, res) => {
  const entity = await deleteEntityById(req, res, 'teacher');

  // delete the profile associated with the teacher
  req.params.id = entity.profileId;
  await deleteEntityById(req, res, 'user');
  res.status(200).json(entity);
});

export { allTeachers, getTeacherById, deleteTeacherById };
