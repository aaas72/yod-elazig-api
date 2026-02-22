import { Router } from 'express';
import { galleryController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createAlbumRules, updateAlbumRules, addPhotosRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();

// ── Public routes ────────────────────────────────────
router.get('/', galleryController.getPublishedAlbums);
router.get('/slug/:slug', galleryController.getAlbumBySlug);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/admin', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), galleryController.getAllAlbums);
router.get('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), galleryController.getAlbumById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), createAlbumRules, validate, galleryController.createAlbum);
router.put('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), updateAlbumRules, validate, galleryController.updateAlbum);
router.delete('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), galleryController.deleteAlbum);

// ── Photo management ─────────────────────────────────
router.post('/:id/photos', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), addPhotosRules, validate, galleryController.addPhotos);
router.delete('/:id/photos/:photoId', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), galleryController.removePhoto);
router.patch('/:id/photos/reorder', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), galleryController.reorderPhotos);

export default router;
