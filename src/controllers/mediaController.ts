import { Request, Response } from 'express';
import { mediaService } from '../services';
import { ApiResponse, asyncHandler, ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No file provided');
  const { folder, alt } = req.body;
  const media = await mediaService.upload(req.file, req.user!._id.toString(), folder, alt);
  new ApiResponse(HTTP_STATUS.CREATED, 'File uploaded successfully', { media }).send(res);
});

export const uploadMultipleMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || !(req.files as Express.Multer.File[]).length) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No files provided');
  }
  const { folder, alt } = req.body;
  const files = req.files as Express.Multer.File[];
  const results = await Promise.all(
    files.map((file) => mediaService.upload(file, req.user!._id.toString(), folder, alt)),
  );
  new ApiResponse(HTTP_STATUS.CREATED, 'Files uploaded successfully', { media: results }).send(res);
});

export const getAllMedia = asyncHandler(async (req: Request, res: Response) => {
  const result = await mediaService.getAll(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Media retrieved', result).send(res);
});

export const getMediaById = asyncHandler(async (req: Request, res: Response) => {
  const media = await mediaService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Media retrieved', { media }).send(res);
});

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  await mediaService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Media deleted successfully').send(res);
});

export const updateMediaAlt = asyncHandler(async (req: Request, res: Response) => {
  const media = await mediaService.updateAlt(req.params.id as string, req.body.alt);
  new ApiResponse(HTTP_STATUS.OK, 'Media updated', { media }).send(res);
});
