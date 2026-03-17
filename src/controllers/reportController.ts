import { Request, Response } from 'express';
import { reportService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';
import fs from 'fs';
import path from 'path';

export const createReport = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    new ApiResponse(HTTP_STATUS.BAD_REQUEST, 'PDF file is required').send(res);
    return;
  }

  const reportData = {
    ...req.body,
    year: Number(req.body.year),
    file: req.file.path.replace(/\\/g, '/'),
    uploadedBy: req.user!._id,
  };

  const report = await reportService.create(reportData);
  new ApiResponse(HTTP_STATUS.CREATED, 'Report created successfully', { report }).send(res);
});

export const getAllReports = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.getAll(req.query as Record<string, unknown>);
  new ApiResponse(HTTP_STATUS.OK, 'Reports retrieved', result).send(res);
});

export const getPublishedReports = asyncHandler(async (_req: Request, res: Response) => {
  const reports = await reportService.getPublished();
  new ApiResponse(HTTP_STATUS.OK, 'Reports retrieved', { reports }).send(res);
});

export const getReportById = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Report retrieved', { report }).send(res);
});

export const updateReport = asyncHandler(async (req: Request, res: Response) => {
  const updateData: Record<string, unknown> = { ...req.body };
  if (updateData.year) updateData.year = Number(updateData.year);

  // If a new file is uploaded, delete the old one
  if (req.file) {
    const existingReport = await reportService.getById(req.params.id as string);
    if (existingReport.file) {
      const oldFilePath = path.join(process.cwd(), existingReport.file);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    updateData.file = req.file.path.replace(/\\/g, '/');
  }

  const report = await reportService.update(req.params.id as string, updateData);
  new ApiResponse(HTTP_STATUS.OK, 'Report updated successfully', { report }).send(res);
});

export const deleteReport = asyncHandler(async (req: Request, res: Response) => {
  await reportService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Report deleted successfully').send(res);
});
