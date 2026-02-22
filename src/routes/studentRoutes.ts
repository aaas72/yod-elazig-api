import { Router } from 'express';
import { studentController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createStudentRules, updateStudentRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management
 */

// All routes require authentication
router.use(verifyToken);

/**
 * @swagger
 * /api/v1/students/me:
 *   get:
 *     summary: Get my student profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', studentController.getMyProfile);

/**
 * @swagger
 * /api/v1/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  studentController.getStudents,
);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  studentController.getStudent,
);

/**
 * @swagger
 * /api/v1/students:
 *   post:
 *     summary: Create a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  createStudentRules,
  validate,
  studentController.createStudent,
);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  updateStudentRules,
  validate,
  studentController.updateStudent,
);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.deleteStudent,
);

export default router;
