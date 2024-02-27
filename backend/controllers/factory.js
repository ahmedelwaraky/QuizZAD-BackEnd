import { NotFoundError } from "../errors/index.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Retrieves all entities of a given model from the database.
 *
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} model - The name of the model to retrieve entities from.
 * @returns {Promise<Object[]>} - An array of entities.
 * @throws {NotFoundError} - If no entities are found.
 */
const getAllEntities = async (req, res, model) => {
  // filter by user email or name
  let filter = {};
  if (req.query.name) {
    filter = {
      profile: {
        OR: [
          {
            firstName: {
              contains: req.query.name,
            },
          },
          {
            email: {
              startsWith: req.query.name,
            },
          },
        ],
      },
    };
  }

  // paginate
  let options = {};
  if (req.query.pgnum) {
    const page = Number(req.query.pgnum) || 1;
    const limit = Number(req.query.pgsize) || 10;
    const skip = (page - 1) * limit;
    options = {
      skip,
      take: limit,
    };
  }

  const entities = await prisma[model].findMany({
    where: filter,
    include: {
      profile: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          specialization: true,
          gradeLevel: true,
        },
      },
    },
    ...options,
  });
  if (!entities) throw new NotFoundError(`${model}s not found`, 404);
  return entities;
};

/**
 * Retrieves an entity by its ID from the database.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} model - The name of the model to retrieve the entity from.
 * @returns {Promise<Object>} The retrieved entity.
 * @throws {NotFoundError} If the entity is not found in the database.
 */
const getEntityById = async (req, res, model) => {
  const entity = await prisma[model].findUnique({
    where: {
      id: Number(req.params.id),
    },
    include: {
      profile: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          specialization: true,
          gradeLevel: true,
        },
      },
    },
  });
  if (!entity) throw new NotFoundError(`${model} not found`, 404);
  return entity;
};

/**
 * Updates an entity by ID.
 *
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} model - The name of the model to update.
 * @returns {Promise<void>} - A Promise that resolves with the updated entity.
 * @throws {NotFoundError} - If the entity is not found.
 */
const updateEntityById = async (req, res, model) => {
  const entity = await prisma[model].update({
    where: {
      id: Number(req.params.id),
    },
    data: req.body,
  });
  if (!entity) throw new NotFoundError(`${model} not found`, 404);
  return entity;
};

/**
 * Deletes an entity by its ID.
 *
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} model - The name of the model to delete from.
 * @returns {Promise<Object>} The deleted entity.
 * @throws {NotFoundError} If the entity is not found.
 */
const deleteEntityById = async (req, res, model) => {
  const entity = await prisma[model].delete({
    where: {
      id: Number(req.params.id),
    },
  });
  if (!entity) throw new NotFoundError(`${model} not found`, 404);
  return entity;
};

export { getAllEntities, getEntityById, updateEntityById, deleteEntityById };
