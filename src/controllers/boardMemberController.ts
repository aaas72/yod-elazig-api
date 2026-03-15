import { Request, Response } from 'express';
import { boardMemberService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

export const createBoardMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await boardMemberService.create(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Board member created successfully', { member }).send(res);
});

export const getAllBoardMembers = asyncHandler(async (req: Request, res: Response) => {
  const result = await boardMemberService.getAll(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Board members retrieved', result).send(res);
});

export const getPublishedBoardMembers = asyncHandler(async (req: Request, res: Response) => {
  const type = req.query.type as 'executive' | 'organizational' | undefined;
  const members = await boardMemberService.getPublished(type);
  new ApiResponse(HTTP_STATUS.OK, 'Board members retrieved', { members }).send(res);
});

export const getBoardMemberById = asyncHandler(async (req: Request, res: Response) => {
  const member = await boardMemberService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Board member retrieved', { member }).send(res);
});

export const updateBoardMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await boardMemberService.update(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'Board member updated successfully', { member }).send(res);
});

export const deleteBoardMember = asyncHandler(async (req: Request, res: Response) => {
  await boardMemberService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Board member deleted successfully').send(res);
});
