import { FilterQuery } from 'mongoose';
import { BoardMember } from '../models';
import { IBoardMember } from '../models/BoardMember';
import { ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  isPublished?: boolean;
  type?: 'executive' | 'organizational';
}

interface PaginatedResult<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

class BoardMemberService {
  async create(data: Partial<IBoardMember>): Promise<IBoardMember> {
    return BoardMember.create(data);
  }

  async getAll(options: PaginationOptions): Promise<PaginatedResult<IBoardMember>> {
    const { page = 1, limit = 10, sort = 'order', search, isPublished, type } = options;
    const filter: FilterQuery<IBoardMember> = {};

    if (isPublished !== undefined) filter.isPublished = isPublished;
    if (type) filter.type = type;

    if (search) {
      filter.$or = [
        { 'name.ar': new RegExp(search, 'i') },
        { 'name.en': new RegExp(search, 'i') },
        { 'name.tr': new RegExp(search, 'i') },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await BoardMember.countDocuments(filter);
    const data = await BoardMember.find(filter).sort(sort).skip(skip).limit(limit);
    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getPublished(type?: 'executive' | 'organizational'): Promise<IBoardMember[]> {
    const filter: FilterQuery<IBoardMember> = { isPublished: true };
    if (type) filter.type = type;
    return BoardMember.find(filter).sort('order');
  }

  async getById(id: string): Promise<IBoardMember> {
    const item = await BoardMember.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Board member not found');
    return item;
  }

  async update(id: string, data: Partial<IBoardMember>): Promise<IBoardMember> {
    const item = await BoardMember.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Board member not found');
    Object.assign(item, data);
    await item.save();
    return item;
  }

  async delete(id: string): Promise<void> {
    const item = await BoardMember.findByIdAndDelete(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Board member not found');
  }
}

export default new BoardMemberService();
