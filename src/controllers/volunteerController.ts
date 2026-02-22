import { Request, Response } from 'express';
import { volunteerService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

export const submitVolunteer = asyncHandler(async (req: Request, res: Response) => {
  const volunteer = await volunteerService.create(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Application submitted successfully', { volunteer }).send(res);
});

export const getAllVolunteers = asyncHandler(async (req: Request, res: Response) => {
  const result = await volunteerService.getAll(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Volunteers retrieved', result).send(res);
});

export const getVolunteerById = asyncHandler(async (req: Request, res: Response) => {
  const volunteer = await volunteerService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Volunteer retrieved', { volunteer }).send(res);
});

export const reviewVolunteer = asyncHandler(async (req: Request, res: Response) => {
  const { status, reviewNote } = req.body;
  const volunteer = await volunteerService.review(
    req.params.id as string,
    status,
    req.user!._id.toString(),
    reviewNote,
  );
  new ApiResponse(HTTP_STATUS.OK, 'Volunteer reviewed', { volunteer }).send(res);
});

export const deleteVolunteer = asyncHandler(async (req: Request, res: Response) => {
  await volunteerService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Volunteer deleted successfully').send(res);
});

export const getVolunteerStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await volunteerService.getStats();
  new ApiResponse(HTTP_STATUS.OK, 'Volunteer stats retrieved', { stats }).send(res);
});

export const exportVolunteers = asyncHandler(async (req: Request, res: Response) => {
  const volunteers = await volunteerService.export(req.query.status as string);
  new ApiResponse(HTTP_STATUS.OK, 'Volunteers exported', { volunteers }).send(res);
});
