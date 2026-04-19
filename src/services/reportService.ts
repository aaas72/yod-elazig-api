import { FilterQuery } from 'mongoose';
import { Report } from '../models';
import { IReport } from '../models/Report';
import Media from '../models/Media';
import { ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';
import mediaService from './mediaService';
import fs from 'fs';
import path from 'path';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  isPublished?: boolean;
  year?: number;
  quarter?: string;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

class ReportService {
  async create(data: Partial<IReport>): Promise<IReport> {
    return Report.create(data);
  }

  async getAll(options: PaginationOptions): Promise<PaginatedResult<IReport>> {
    const { page = 1, limit = 10, sort = '-year -quarter', isPublished, year, quarter } = options;
    const filter: FilterQuery<IReport> = {};

    if (isPublished !== undefined) filter.isPublished = isPublished;
    if (year) filter.year = year;
    if (quarter) filter.quarter = quarter;

    const skip = (page - 1) * limit;
    const total = await Report.countDocuments(filter);
    const data = await Report.find(filter)
      .populate('uploadedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getPublished(): Promise<IReport[]> {
    return Report.find({ isPublished: true })
      .populate('uploadedBy', 'name')
      .sort('-year quarter');
  }

  async getById(id: string): Promise<IReport> {
    const item = await Report.findById(id).populate('uploadedBy', 'name email');
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Report not found');
    return item;
  }

  async update(id: string, data: Partial<IReport>): Promise<IReport> {
    const item = await Report.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Report not found');
    Object.assign(item, data);
    await item.save();
    return item;
  }

  async delete(id: string): Promise<void> {
    const item = await Report.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Report not found');

    // Delete report file using unified media engine if possible.
    if (item.file) {
      const media = await Media.findOne({ url: item.file });
      if (media) {
        await mediaService.delete(String(media._id));
      } else {
        const filePath = path.join(process.cwd(), item.file.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await Report.findByIdAndDelete(id);
  }
}

export default new ReportService();
