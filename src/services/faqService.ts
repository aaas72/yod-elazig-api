import { FilterQuery } from 'mongoose';
import { FAQ } from '../models';
import { IFAQ } from '../models/FAQ';
import { ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  isPublished?: boolean;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

class FAQService {
  async create(data: Partial<IFAQ>): Promise<IFAQ> {
    return FAQ.create(data);
  }

  async getAll(options: PaginationOptions): Promise<PaginatedResult<IFAQ>> {
    const { page = 1, limit = 50, sort = 'order', category, isPublished } = options;
    const filter: FilterQuery<IFAQ> = {};
    if (category) filter.category = category;
    if (isPublished !== undefined) filter.isPublished = isPublished;

    const skip = (page - 1) * limit;
    const total = await FAQ.countDocuments(filter);
    const data = await FAQ.find(filter).sort(sort).skip(skip).limit(limit);
    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getPublished(category?: string): Promise<IFAQ[]> {
    const filter: FilterQuery<IFAQ> = { isPublished: true };
    if (category) filter.category = category;
    return FAQ.find(filter).sort('order');
  }

  async getById(id: string): Promise<IFAQ> {
    const item = await FAQ.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ not found');
    return item;
  }

  async update(id: string, data: Partial<IFAQ>): Promise<IFAQ> {
    const item = await FAQ.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ not found');
    Object.assign(item, data);
    await item.save();
    return item;
  }

  async delete(id: string): Promise<void> {
    const item = await FAQ.findByIdAndDelete(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ not found');
  }

  async reorder(items: { id: string; order: number }[]): Promise<void> {
    const ops = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));
    await FAQ.bulkWrite(ops);
  }
}

export default new FAQService();
