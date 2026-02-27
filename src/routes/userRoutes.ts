import express from 'express';
import * as userController from '../controllers/userController';
import authorizePermission from '../middlewares/authorizePermission';
import { verifyToken } from '../middlewares';
import { ROLES } from '../constants/roles';

// declare router to know about :id param pattern
const router = express.Router();



router.get('/', verifyToken, authorizePermission('users', 'list'), userController.listUsers);
router.get('/:id', verifyToken, authorizePermission('users', 'get'), userController.getUser);
router.post('/', verifyToken, authorizePermission('users', 'create'), userController.createUser);
router.patch('/:id', verifyToken, authorizePermission('users', 'update'), userController.updateUser);
router.delete('/:id', verifyToken, authorizePermission('users', 'delete'), userController.deleteUser);
router.patch('/:id/toggle-active', verifyToken, authorizePermission('users', 'toggle'), userController.toggleUserActive);

export default router;