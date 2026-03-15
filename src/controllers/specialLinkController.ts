import { Request, Response } from 'express';
import specialLinkService from '../services/specialLinkService';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

export const createSpecialLink = asyncHandler(async (req: Request, res: Response) => {
  const link = await specialLinkService.create(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Special link created successfully', { link }).send(res);
});

export const getAllSpecialLinks = asyncHandler(async (req: Request, res: Response) => {
  const result = await specialLinkService.getAll(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Special links retrieved', result).send(res);
});

export const getPublishedSpecialLinks = asyncHandler(async (req: Request, res: Response) => {
  const links = await specialLinkService.getPublished();
  new ApiResponse(HTTP_STATUS.OK, 'Special links retrieved', { links }).send(res);
});

export const getSpecialLinkById = asyncHandler(async (req: Request, res: Response) => {
  const link = await specialLinkService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Special link retrieved', { link }).send(res);
});

export const updateSpecialLink = asyncHandler(async (req: Request, res: Response) => {
  const link = await specialLinkService.update(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'Special link updated successfully', { link }).send(res);
});

export const deleteSpecialLink = asyncHandler(async (req: Request, res: Response) => {
  await specialLinkService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Special link deleted successfully').send(res);
});
