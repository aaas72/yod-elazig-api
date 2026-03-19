import { FilterQuery } from 'mongoose';
import { FaqCategory } from '../models';
import { IFaqCategory } from '../models/FaqCategory';
import { ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  isActive?: boolean;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

class FaqCategoryService {
  async create(data: Partial<IFaqCategory>): Promise<IFaqCategory> {
    // Generate slug from Arabic name if not provided
    if (!data.slug && data.name?.ar) {
      data.slug = this.generateSlug(data.name.en || data.name.ar);
    }
    return FaqCategory.create(data);
  }

  async getAll(options: PaginationOptions): Promise<PaginatedResult<IFaqCategory>> {
    const { page = 1, limit = 50, sort = 'order', isActive } = options;
    const filter: FilterQuery<IFaqCategory> = {};
    if (isActive !== undefined) filter.isActive = isActive;

    const skip = (page - 1) * limit;
    const total = await FaqCategory.countDocuments(filter);
    const data = await FaqCategory.find(filter).sort(sort).skip(skip).limit(limit);
    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getActive(): Promise<IFaqCategory[]> {
    return FaqCategory.find({ isActive: true }).sort('order');
  }

  async getById(id: string): Promise<IFaqCategory> {
    const item = await FaqCategory.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ Category not found');
    return item;
  }

  async getBySlug(slug: string): Promise<IFaqCategory | null> {
    return FaqCategory.findOne({ slug });
  }

  async update(id: string, data: Partial<IFaqCategory>): Promise<IFaqCategory> {
    const item = await FaqCategory.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ Category not found');

    // Update slug if name changes and no custom slug provided
    if (data.name && !data.slug) {
      data.slug = this.generateSlug(data.name.en || data.name.ar);
    }

    Object.assign(item, data);
    await item.save();
    return item;
  }

  async delete(id: string): Promise<void> {
    const item = await FaqCategory.findByIdAndDelete(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ Category not found');
  }

  async reorder(items: { id: string; order: number }[]): Promise<void> {
    const ops = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));
    await FaqCategory.bulkWrite(ops);
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export default new FaqCategoryService();
