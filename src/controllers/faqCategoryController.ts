import { Request, Response } from 'express';
import { faqCategoryService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

export const createFaqCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await faqCategoryService.create(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'FAQ Category created successfully', { category }).send(res);
});

export const getAllFaqCategories = asyncHandler(async (req: Request, res: Response) => {
  const result = await faqCategoryService.getAll(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'FAQ Categories retrieved', result).send(res);
});

export const getActiveFaqCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await faqCategoryService.getActive();
  new ApiResponse(HTTP_STATUS.OK, 'FAQ Categories retrieved', { categories }).send(res);
});

export const getFaqCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await faqCategoryService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'FAQ Category retrieved', { category }).send(res);
});

export const updateFaqCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await faqCategoryService.update(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'FAQ Category updated successfully', { category }).send(res);
});

export const deleteFaqCategory = asyncHandler(async (req: Request, res: Response) => {
  await faqCategoryService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'FAQ Category deleted successfully').send(res);
});

export const reorderFaqCategories = asyncHandler(async (req: Request, res: Response) => {
  await faqCategoryService.reorder(req.body.items);
  new ApiResponse(HTTP_STATUS.OK, 'FAQ Categories reordered successfully').send(res);
});
