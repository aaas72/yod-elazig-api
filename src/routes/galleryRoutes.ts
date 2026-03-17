import { Router } from 'express';
import { galleryController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createAlbumRules, updateAlbumRules, addPhotosRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();
const OBJECT_ID = ':id([0-9a-fA-F]{24})';

// ── Public routes ────────────────────────────────────
router.get('/', galleryController.getPublishedAlbums);
router.get('/slug/:slug', galleryController.getAlbumBySlug);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/admin', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), galleryController.getAllAlbums);
router.get(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), galleryController.getAlbumById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), createAlbumRules, validate, galleryController.createAlbum);
router.put(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), updateAlbumRules, validate, galleryController.updateAlbum);
router.delete(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), galleryController.deleteAlbum);

// ── Photo management ─────────────────────────────────
router.post(`/${OBJECT_ID}/photos`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), addPhotosRules, validate, galleryController.addPhotos);
router.delete(`/${OBJECT_ID}/photos/:photoId`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), galleryController.removePhoto);
router.patch(`/${OBJECT_ID}/photos/reorder`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), galleryController.reorderPhotos);

export default router;
