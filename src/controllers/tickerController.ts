import { Request, Response } from 'express';
import { tickerService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

export const createTicker = asyncHandler(async (req: Request, res: Response) => {
  const ticker = await tickerService.create(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Ticker item created', { ticker }).send(res);
});

export const getAllTickers = asyncHandler(async (_req: Request, res: Response) => {
  const tickers = await tickerService.getAll();
  new ApiResponse(HTTP_STATUS.OK, 'Tickers retrieved', { tickers }).send(res);
});

export const getActiveTickers = asyncHandler(async (_req: Request, res: Response) => {
  const tickers = await tickerService.getActive();
  new ApiResponse(HTTP_STATUS.OK, 'Active tickers retrieved', { tickers }).send(res);
});

export const getTickerById = asyncHandler(async (req: Request, res: Response) => {
  const ticker = await tickerService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Ticker retrieved', { ticker }).send(res);
});

export const updateTicker = asyncHandler(async (req: Request, res: Response) => {
  const ticker = await tickerService.update(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'Ticker updated', { ticker }).send(res);
});

export const deleteTicker = asyncHandler(async (req: Request, res: Response) => {
  await tickerService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Ticker deleted').send(res);
});

export const bulkUpdateTickers = asyncHandler(async (req: Request, res: Response) => {
  const tickers = await tickerService.bulkUpdate(req.body.items);
  new ApiResponse(HTTP_STATUS.OK, 'Tickers updated', { tickers }).send(res);
});
