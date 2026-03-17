import { FilterQuery } from 'mongoose';
import { StudentAchievement } from '../models';
import { IStudentAchievement } from '../models/StudentAchievement';
import { ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  isPublished?: boolean;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

class StudentAchievementService {
  async create(data: Partial<IStudentAchievement>): Promise<IStudentAchievement> {
    return StudentAchievement.create(data);
  }

  async getAll(options: PaginationOptions): Promise<PaginatedResult<IStudentAchievement>> {
    const { page = 1, limit = 10, sort = 'order', search, isPublished } = options;
    const filter: FilterQuery<IStudentAchievement> = {};

    if (isPublished !== undefined) filter.isPublished = isPublished;

    if (search) {
      filter.$or = [
        { 'studentName.ar': new RegExp(search, 'i') },
        { 'studentName.en': new RegExp(search, 'i') },
        { 'studentName.tr': new RegExp(search, 'i') },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await StudentAchievement.countDocuments(filter);
    const data = await StudentAchievement.find(filter).sort(sort).skip(skip).limit(limit);
    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getPublished(): Promise<IStudentAchievement[]> {
    return StudentAchievement.find({ isPublished: true }).sort('order');
  }

  async getById(id: string): Promise<IStudentAchievement> {
    const item = await StudentAchievement.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student achievement not found');
    return item;
  }

  async update(id: string, data: Partial<IStudentAchievement>): Promise<IStudentAchievement> {
    const item = await StudentAchievement.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student achievement not found');
    Object.assign(item, data);
    await item.save();
    return item;
  }

  async delete(id: string): Promise<void> {
    const item = await StudentAchievement.findByIdAndDelete(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student achievement not found');
  }
}

export default new StudentAchievementService();
