import { Router } from 'express';
import { studentController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createStudentRules, updateStudentRules } from '../validators';
import { ROLES } from '../constants';
import multer from 'multer';
import fs from 'fs';
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = 'uploads/temp';
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      } catch (err) {
        console.error('Error creating directory:', err);
        cb(err as Error, dir);
      }
    },
    filename: function (req, file, cb) {
      const ext = file.originalname.split('.').pop();
      cb(null, `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'));
    }
  },
});

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management
 */


// Public route for student membership registration (no token required)
router.post(
  '/join',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'studentDocument', maxCount: 1 }
  ]),
  createStudentRules,
  validate,
  studentController.createStudent
);

// All routes below require authentication
router.use(verifyToken);

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
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'studentDocument', maxCount: 1 }
  ]),
  createStudentRules,
  validate,
  studentController.createStudent
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
