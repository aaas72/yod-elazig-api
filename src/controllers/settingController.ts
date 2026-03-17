import { Request, Response } from 'express';
import { settingService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingService.get();
  new ApiResponse(HTTP_STATUS.OK, 'Settings retrieved', { settings }).send(res);
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingService.update(req.body, req.user!._id.toString());
  new ApiResponse(HTTP_STATUS.OK, 'Settings updated successfully', { settings }).send(res);
});
