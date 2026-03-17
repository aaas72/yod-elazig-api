import express from 'express';
import * as userController from '../controllers/userController';
import authorizePermission from '../middlewares/authorizePermission';
import { verifyToken } from '../middlewares';
import { ROLES } from '../constants/roles';

// declare router to know about :id param pattern
const router = express.Router();
const OBJECT_ID = ':id([0-9a-fA-F]{24})';



router.get('/', verifyToken, authorizePermission('users', 'list'), userController.listUsers);
router.get(`/${OBJECT_ID}`, verifyToken, authorizePermission('users', 'get'), userController.getUser);
router.post('/', verifyToken, authorizePermission('users', 'create'), userController.createUser);
router.patch(`/${OBJECT_ID}`, verifyToken, authorizePermission('users', 'update'), userController.updateUser);
router.delete(`/${OBJECT_ID}`, verifyToken, authorizePermission('users', 'delete'), userController.deleteUser);
router.patch(`/${OBJECT_ID}/toggle-active`, verifyToken, authorizePermission('users', 'toggle'), userController.toggleUserActive);

export default router;