import { Request, Response } from 'express';
import { dashboardService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/dashboard
 * @access  Private (admin)
 */
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getStats();
  new ApiResponse(HTTP_STATUS.OK, 'Dashboard statistics retrieved', {
    stats,
  }).send(res);
});
