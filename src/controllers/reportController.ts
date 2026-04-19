import { Request, Response } from 'express';
import { reportService, mediaService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';
import fs from 'fs';
import path from 'path';
import Media from '../models/Media';

const removeLegacyFileFromDisk = (fileUrlOrPath: string | undefined) => {
  if (!fileUrlOrPath) return;

  const relativePath = fileUrlOrPath.replace(/^\//, '');
  const localPath = path.join(process.cwd(), relativePath);
  if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
};

const deleteStoredReportFile = async (fileUrlOrPath: string | undefined) => {
  if (!fileUrlOrPath) return;

  const media = await Media.findOne({ url: fileUrlOrPath });
  if (media) {
    await mediaService.delete(String(media._id));
    return;
  }

  removeLegacyFileFromDisk(fileUrlOrPath);
};

export const createReport = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    new ApiResponse(HTTP_STATUS.BAD_REQUEST, 'PDF file is required').send(res);
    return;
  }

  const media = await mediaService.upload(
    req.file,
    req.user!._id.toString(),
    'reports',
    `${req.body.title || 'Report'} ${req.body.quarter || ''} ${req.body.year || ''}`.trim(),
  );

  const reportData = {
    ...req.body,
    year: Number(req.body.year),
    file: media.url,
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

  // If a new file is uploaded, replace old one using the same media engine
  if (req.file) {
    const existingReport = await reportService.getById(req.params.id as string);

    const media = await mediaService.upload(
      req.file,
      req.user!._id.toString(),
      'reports',
      `${req.body.title || existingReport.title || 'Report'} ${req.body.quarter || existingReport.quarter || ''} ${req.body.year || existingReport.year || ''}`.trim(),
    );

    await deleteStoredReportFile(existingReport.file);
    updateData.file = media.url;
  }

  const report = await reportService.update(req.params.id as string, updateData);
  new ApiResponse(HTTP_STATUS.OK, 'Report updated successfully', { report }).send(res);
});

export const deleteReport = asyncHandler(async (req: Request, res: Response) => {
  await reportService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Report deleted successfully').send(res);
});
