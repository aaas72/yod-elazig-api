import { Request, Response } from 'express';
import userService from '../services/userService';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  // query params may be string or string[]; normalize
  const rawPage = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
  const rawLimit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
  const rawSearch = Array.isArray(req.query.search) ? req.query.search[0] : req.query.search;

  const page = rawPage ? Number(rawPage) : undefined;
  const limit = rawLimit ? Number(rawLimit) : undefined;
  const search = rawSearch ? String(rawSearch) : undefined;

  const result = await userService.getAll({ page, limit, search });
  new ApiResponse(HTTP_STATUS.OK, 'Users retrieved', result).send(res);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'User retrieved', { user }).send(res);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.create(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'User created', { user }).send(res);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.update(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'User updated', { user }).send(res);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.NO_CONTENT, 'User deleted').send(res);
});

export const toggleUserActive = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.toggleActive(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'User active toggled', { user }).send(res);
});