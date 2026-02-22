import { Request, Response } from 'express';
import { contactService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactService.create(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Message sent successfully', { contact }).send(res);
});

export const getAllContacts = asyncHandler(async (req: Request, res: Response) => {
  const result = await contactService.getAll(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Contacts retrieved', result).send(res);
});

export const getContactById = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Contact retrieved', { contact }).send(res);
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactService.markAsRead(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Marked as read', { contact }).send(res);
});

export const replyToContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactService.reply(
    req.params.id as string,
    req.body.replyMessage,
    req.user!._id.toString(),
  );
  new ApiResponse(HTTP_STATUS.OK, 'Reply sent', { contact }).send(res);
});

export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
  await contactService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Contact deleted successfully').send(res);
});

export const getContactStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await contactService.getStats();
  new ApiResponse(HTTP_STATUS.OK, 'Contact stats retrieved', { stats }).send(res);
});
