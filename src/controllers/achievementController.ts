import { Request, Response } from 'express';
import { achievementService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

export const createAchievement = asyncHandler(async (req: Request, res: Response) => {
  const achievement = await achievementService.create(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Achievement created successfully', { achievement }).send(res);
});

export const getAllAchievements = asyncHandler(async (req: Request, res: Response) => {
  const result = await achievementService.getAll(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Achievements retrieved', result).send(res);
});

export const getPublishedAchievements = asyncHandler(async (_req: Request, res: Response) => {
  const achievements = await achievementService.getPublished();
  new ApiResponse(HTTP_STATUS.OK, 'Achievements retrieved', { achievements }).send(res);
});

export const getAchievementById = asyncHandler(async (req: Request, res: Response) => {
  const achievement = await achievementService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Achievement retrieved', { achievement }).send(res);
});

export const updateAchievement = asyncHandler(async (req: Request, res: Response) => {
  const achievement = await achievementService.update(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'Achievement updated successfully', { achievement }).send(res);
});

export const deleteAchievement = asyncHandler(async (req: Request, res: Response) => {
  await achievementService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Achievement deleted successfully').send(res);
});
