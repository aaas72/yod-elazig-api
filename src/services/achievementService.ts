import { FilterQuery } from 'mongoose';
import { Achievement } from '../models';
import { IAchievement } from '../models/Achievement';
import { ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  isPublished?: boolean;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

class AchievementService {
  async create(data: Partial<IAchievement>): Promise<IAchievement> {
    return Achievement.create(data);
  }

  async getAll(options: PaginationOptions): Promise<PaginatedResult<IAchievement>> {
    const { page = 1, limit = 10, sort = 'order', isPublished } = options;
    const filter: FilterQuery<IAchievement> = {};
    if (isPublished !== undefined) filter.isPublished = isPublished;

    const skip = (page - 1) * limit;
    const total = await Achievement.countDocuments(filter);
    const data = await Achievement.find(filter).sort(sort).skip(skip).limit(limit);
    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getPublished(): Promise<IAchievement[]> {
    return Achievement.find({ isPublished: true }).sort('order');
  }

  async getById(id: string): Promise<IAchievement> {
    const item = await Achievement.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Achievement not found');
    return item;
  }

  async update(id: string, data: Partial<IAchievement>): Promise<IAchievement> {
    const item = await Achievement.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Achievement not found');
    Object.assign(item, data);
    await item.save();
    return item;
  }

  async delete(id: string): Promise<void> {
    const item = await Achievement.findByIdAndDelete(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Achievement not found');
  }
}

export default new AchievementService();
