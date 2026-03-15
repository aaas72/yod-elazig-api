import { FilterQuery } from 'mongoose';
import SpecialLink from '../models/SpecialLink';
import { ISpecialLink } from '../models/SpecialLink';
import { ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

class SpecialLinkService {
  async create(data: Partial<ISpecialLink>): Promise<ISpecialLink> {
    return SpecialLink.create(data);
  }

  async getAll(options: PaginationOptions): Promise<PaginatedResult<ISpecialLink>> {
    const { page = 1, limit = 50, sort = 'order', search } = options;
    const filter: FilterQuery<ISpecialLink> = {};

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { url: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await SpecialLink.countDocuments(filter);
    const data = await SpecialLink.find(filter).sort(sort).skip(skip).limit(limit);
    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getPublished(): Promise<ISpecialLink[]> {
    return SpecialLink.find({ isPublished: true }).sort('order');
  }

  async getById(id: string): Promise<ISpecialLink> {
    const item = await SpecialLink.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Special link not found');
    return item;
  }

  async update(id: string, data: Partial<ISpecialLink>): Promise<ISpecialLink> {
    const item = await SpecialLink.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Special link not found');
    Object.assign(item, data);
    await item.save();
    return item;
  }

  async delete(id: string): Promise<void> {
    const item = await SpecialLink.findByIdAndDelete(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Special link not found');
  }
}

export default new SpecialLinkService();
