import { Request, Response } from 'express';
import { resourceService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

export const createResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await resourceService.create(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Resource created successfully', { resource }).send(res);
});

export const getAllResources = asyncHandler(async (req: Request, res: Response) => {
  const result = await resourceService.getAll(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Resources retrieved', result).send(res);
});

export const getPublicResources = asyncHandler(async (req: Request, res: Response) => {
  const resources = await resourceService.getPublic(req.query.category as string);
  new ApiResponse(HTTP_STATUS.OK, 'Resources retrieved', { resources }).send(res);
});

export const getResourceById = asyncHandler(async (req: Request, res: Response) => {
  const resource = await resourceService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Resource retrieved', { resource }).send(res);
});

export const updateResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await resourceService.update(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'Resource updated successfully', { resource }).send(res);
});

export const deleteResource = asyncHandler(async (req: Request, res: Response) => {
  await resourceService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Resource deleted successfully').send(res);
});
