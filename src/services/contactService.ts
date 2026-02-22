import { FilterQuery } from 'mongoose';
import { Contact } from '../models';
import { IContact } from '../models/Contact';
import { ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  status?: string;
  search?: string;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

class ContactService {
  async create(data: Partial<IContact>): Promise<IContact> {
    return Contact.create(data);
  }

  async getAll(options: PaginationOptions): Promise<PaginatedResult<IContact>> {
    const { page = 1, limit = 10, sort = '-createdAt', status, search } = options;
    const filter: FilterQuery<IContact> = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Contact.countDocuments(filter);
    const data = await Contact.find(filter)
      .populate('repliedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getById(id: string): Promise<IContact> {
    const item = await Contact.findById(id).populate('repliedBy', 'name email');
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contact message not found');
    return item;
  }

  async markAsRead(id: string): Promise<IContact> {
    const item = await Contact.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contact message not found');
    if (item.status === 'new') {
      item.status = 'read';
      await item.save();
    }
    return item;
  }

  async reply(id: string, replyMessage: string, userId: string): Promise<IContact> {
    const item = await Contact.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contact message not found');
    item.status = 'replied';
    item.replyMessage = replyMessage;
    item.repliedBy = userId as any;
    item.repliedAt = new Date();
    await item.save();
    return item.populate('repliedBy', 'name email');
  }

  async delete(id: string): Promise<void> {
    const item = await Contact.findByIdAndDelete(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contact message not found');
  }

  async getStats(): Promise<{ total: number; new: number; read: number; replied: number }> {
    const [total, newCount, read, replied] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      Contact.countDocuments({ status: 'read' }),
      Contact.countDocuments({ status: 'replied' }),
    ]);
    return { total, new: newCount, read, replied };
  }
}

export default new ContactService();
