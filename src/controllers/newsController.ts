import { Request, Response } from 'express';
import { newsService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

/**
 * @desc    Create a news article
 * @route   POST /api/v1/news
 * @access  Private (admin, editor)
 */
export const createNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await newsService.create(req.body, req.user!._id.toString());
  new ApiResponse(HTTP_STATUS.CREATED, 'News created successfully', { news }).send(res);
});

/**
 * @desc    Get all news (admin)
 * @route   GET /api/v1/news/admin
 * @access  Private (admin, editor)
 */
export const getAllNews = asyncHandler(async (req: Request, res: Response) => {
  const result = await newsService.getAll(req.query as any, req);
  new ApiResponse(HTTP_STATUS.OK, 'News retrieved', result).send(res);
});

/**
 * @desc    Get published news (public)
 * @route   GET /api/v1/news
 * @access  Public
 */
export const getPublishedNews = asyncHandler(async (req: Request, res: Response) => {
  const result = await newsService.getAll({ ...req.query, isPublished: true }, req);
  new ApiResponse(HTTP_STATUS.OK, 'News retrieved', result).send(res);
});

/**
 * @desc    Get news by ID
 * @route   GET /api/v1/news/:id
 * @access  Private (admin, editor)
 */
export const getNewsById = asyncHandler(async (req: Request, res: Response) => {
  const news = await newsService.getById(req.params.id as string, req);
  new ApiResponse(HTTP_STATUS.OK, 'News retrieved', { news }).send(res);
});

/**
 * @desc    Get news by slug (public)
 * @route   GET /api/v1/news/slug/:slug
 * @access  Public
 */
export const getNewsBySlug = asyncHandler(async (req: Request, res: Response) => {
  const news = await newsService.getBySlug(req.params.slug as string, req);
  new ApiResponse(HTTP_STATUS.OK, 'News retrieved', { news }).send(res);
});

/**
 * @desc    Update news article
 * @route   PUT /api/v1/news/:id
 * @access  Private (admin, editor)
 */
export const updateNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await newsService.update(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'News updated successfully', { news }).send(res);
});

/**
 * @desc    Delete news article
 * @route   DELETE /api/v1/news/:id
 * @access  Private (admin)
 */
export const deleteNews = asyncHandler(async (req: Request, res: Response) => {
  await newsService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'News deleted successfully').send(res);
});

/**
 * @desc    Toggle news publish status
 * @route   PATCH /api/v1/news/:id/toggle-publish
 * @access  Private (admin, editor)
 */
export const togglePublish = asyncHandler(async (req: Request, res: Response) => {
  const news = await newsService.togglePublish(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Publish status toggled', { news }).send(res);
});
