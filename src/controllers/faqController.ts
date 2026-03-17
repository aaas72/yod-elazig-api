import { Request, Response } from 'express';
import { faqService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

export const createFAQ = asyncHandler(async (req: Request, res: Response) => {
  const faq = await faqService.create(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'FAQ created successfully', { faq }).send(res);
});

export const getAllFAQs = asyncHandler(async (req: Request, res: Response) => {
  const result = await faqService.getAll(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'FAQs retrieved', result).send(res);
});

export const getPublishedFAQs = asyncHandler(async (req: Request, res: Response) => {
  const faqs = await faqService.getPublished(req.query.category as string);
  new ApiResponse(HTTP_STATUS.OK, 'FAQs retrieved', { faqs }).send(res);
});

export const getFAQById = asyncHandler(async (req: Request, res: Response) => {
  const faq = await faqService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'FAQ retrieved', { faq }).send(res);
});

export const updateFAQ = asyncHandler(async (req: Request, res: Response) => {
  const faq = await faqService.update(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'FAQ updated successfully', { faq }).send(res);
});

export const deleteFAQ = asyncHandler(async (req: Request, res: Response) => {
  await faqService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'FAQ deleted successfully').send(res);
});

export const reorderFAQs = asyncHandler(async (req: Request, res: Response) => {
  await faqService.reorder(req.body.items);
  new ApiResponse(HTTP_STATUS.OK, 'FAQs reordered successfully').send(res);
});
