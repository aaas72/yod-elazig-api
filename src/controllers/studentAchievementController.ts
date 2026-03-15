import { Request, Response } from 'express';
import { studentAchievementService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

export const createStudentAchievement = asyncHandler(async (req: Request, res: Response) => {
  const achievement = await studentAchievementService.create(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Student achievement created successfully', { achievement }).send(res);
});

export const getAllStudentAchievements = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentAchievementService.getAll(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Student achievements retrieved', result).send(res);
});

export const getPublishedStudentAchievements = asyncHandler(async (_req: Request, res: Response) => {
  const achievements = await studentAchievementService.getPublished();
  new ApiResponse(HTTP_STATUS.OK, 'Student achievements retrieved', { achievements }).send(res);
});

export const getStudentAchievementById = asyncHandler(async (req: Request, res: Response) => {
  const achievement = await studentAchievementService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Student achievement retrieved', { achievement }).send(res);
});

export const updateStudentAchievement = asyncHandler(async (req: Request, res: Response) => {
  const achievement = await studentAchievementService.update(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'Student achievement updated successfully', { achievement }).send(res);
});

export const deleteStudentAchievement = asyncHandler(async (req: Request, res: Response) => {
  await studentAchievementService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Student achievement deleted successfully').send(res);
});
