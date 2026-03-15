import { Router } from 'express';
import { studentController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createStudentRules, updateStudentRules, reviewStudentRules } from '../validators';
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
        cb(null, dir);
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

// Regex constraint: only match valid MongoDB ObjectId (24 hex chars)
const OBJECT_ID = ':id([0-9a-fA-F]{24})';

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
 * /api/v1/students/stats:
 *   get:
 *     summary: Get students statistics
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/stats',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  studentController.getStudentStats,
);

/**
 * @swagger
 * /api/v1/students/export:
 *   get:
 *     summary: Export students data
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/export',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.exportStudents,
);

/**
 * @swagger
 * /api/v1/students/by-id/{studentId}:
 *   get:
 *     summary: Get student by studentId
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/by-id/:studentId',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  studentController.getStudentByStudentId,
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
  `/${OBJECT_ID}`,
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
  `/${OBJECT_ID}`,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  updateStudentRules,
  validate,
  studentController.updateStudent,
);

/**
 * @swagger
 * /api/v1/students/{id}/review:
 *   patch:
 *     summary: Review student membership application
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  `/${OBJECT_ID}/review`,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  reviewStudentRules,
  validate,
  studentController.reviewStudent,
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
  `/${OBJECT_ID}`,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  studentController.deleteStudent,
);

export default router;
