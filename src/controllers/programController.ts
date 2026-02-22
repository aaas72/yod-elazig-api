import { Request, Response } from 'express';
import { programService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

export const createProgram = asyncHandler(async (req: Request, res: Response) => {
  const program = await programService.create(req.body, req.user!._id.toString());
  new ApiResponse(HTTP_STATUS.CREATED, 'Program created successfully', { program }).send(res);
});

export const getAllPrograms = asyncHandler(async (req: Request, res: Response) => {
  const result = await programService.getAll(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Programs retrieved', result).send(res);
});

export const getPublishedPrograms = asyncHandler(async (req: Request, res: Response) => {
  const result = await programService.getPublished(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Programs retrieved', result).send(res);
});

export const getProgramById = asyncHandler(async (req: Request, res: Response) => {
  const program = await programService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Program retrieved', { program }).send(res);
});

export const getProgramBySlug = asyncHandler(async (req: Request, res: Response) => {
  const program = await programService.getBySlug(req.params.slug as string);
  new ApiResponse(HTTP_STATUS.OK, 'Program retrieved', { program }).send(res);
});

export const updateProgram = asyncHandler(async (req: Request, res: Response) => {
  const program = await programService.update(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'Program updated successfully', { program }).send(res);
});

export const deleteProgram = asyncHandler(async (req: Request, res: Response) => {
  await programService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Program deleted successfully').send(res);
});

export const togglePublish = asyncHandler(async (req: Request, res: Response) => {
  const program = await programService.togglePublish(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Publish status toggled', { program }).send(res);
});
