import { FilterQuery } from 'mongoose';
import { Resource } from '../models';
import { IResource } from '../models/Resource';
import { ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  type?: string;
  isPublished?: boolean;
  isPublic?: boolean;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

class ResourceService {
  async create(data: Partial<IResource>): Promise<IResource> {
    return Resource.create(data);
  }

  async getAll(options: PaginationOptions): Promise<PaginatedResult<IResource>> {
    const { page = 1, limit = 10, sort = 'order', category, type, isPublished, isPublic } = options;
    const filter: FilterQuery<IResource> = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (isPublished !== undefined) filter.isPublished = isPublished;
    if (isPublic !== undefined) filter.isPublic = isPublic;

    const skip = (page - 1) * limit;
    const total = await Resource.countDocuments(filter);
    const data = await Resource.find(filter).sort(sort).skip(skip).limit(limit);
    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getPublic(category?: string): Promise<IResource[]> {
    const filter: FilterQuery<IResource> = { isPublished: true, isPublic: true };
    if (category) filter.category = category;
    return Resource.find(filter).sort('order');
  }

  async getById(id: string): Promise<IResource> {
    const item = await Resource.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Resource not found');
    return item;
  }

  async update(id: string, data: Partial<IResource>): Promise<IResource> {
    const item = await Resource.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Resource not found');
    Object.assign(item, data);
    await item.save();
    return item;
  }

  async delete(id: string): Promise<void> {
    const item = await Resource.findByIdAndDelete(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Resource not found');
  }
}

export default new ResourceService();
