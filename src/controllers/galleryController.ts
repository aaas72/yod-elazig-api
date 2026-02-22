import { Request, Response } from 'express';
import { galleryService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

/* ── Albums ───────────────────────────────────────── */
export const createAlbum = asyncHandler(async (req: Request, res: Response) => {
  const album = await galleryService.createAlbum(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Album created successfully', { album }).send(res);
});

export const getAllAlbums = asyncHandler(async (req: Request, res: Response) => {
  const result = await galleryService.getAllAlbums(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Albums retrieved', result).send(res);
});

export const getPublishedAlbums = asyncHandler(async (req: Request, res: Response) => {
  const albums = await galleryService.getPublishedAlbums(req.query.category as string);
  new ApiResponse(HTTP_STATUS.OK, 'Albums retrieved', { albums }).send(res);
});

export const getAlbumById = asyncHandler(async (req: Request, res: Response) => {
  const album = await galleryService.getAlbumById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Album retrieved', { album }).send(res);
});

export const getAlbumBySlug = asyncHandler(async (req: Request, res: Response) => {
  const album = await galleryService.getAlbumBySlug(req.params.slug as string);
  new ApiResponse(HTTP_STATUS.OK, 'Album retrieved', { album }).send(res);
});

export const updateAlbum = asyncHandler(async (req: Request, res: Response) => {
  const album = await galleryService.updateAlbum(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'Album updated successfully', { album }).send(res);
});

export const deleteAlbum = asyncHandler(async (req: Request, res: Response) => {
  await galleryService.deleteAlbum(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Album deleted successfully').send(res);
});

/* ── Photos ───────────────────────────────────────── */
export const addPhotos = asyncHandler(async (req: Request, res: Response) => {
  const album = await galleryService.addPhotos(req.params.id as string, req.body.photos);
  new ApiResponse(HTTP_STATUS.OK, 'Photos added successfully', { album }).send(res);
});

export const removePhoto = asyncHandler(async (req: Request, res: Response) => {
  const album = await galleryService.removePhoto(req.params.id as string, req.params.photoId as string);
  new ApiResponse(HTTP_STATUS.OK, 'Photo removed successfully', { album }).send(res);
});

export const reorderPhotos = asyncHandler(async (req: Request, res: Response) => {
  const album = await galleryService.reorderPhotos(req.params.id as string, req.body.photoOrders);
  new ApiResponse(HTTP_STATUS.OK, 'Photos reordered successfully', { album }).send(res);
});
