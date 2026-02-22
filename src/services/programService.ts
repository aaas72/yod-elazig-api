import { FilterQuery } from 'mongoose';
import { Program } from '../models';
import { IProgram } from '../models/Program';
import { ApiError, createSlug } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  status?: string;
  category?: string;
  tag?: string;
  startDate?: string;
  endDate?: string;
  isPublished?: boolean;
  lang?: string;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

class ProgramService {
  async create(data: Partial<IProgram>, organizerId: string): Promise<IProgram> {
    const program = await Program.create({ ...data, organizer: organizerId });
    return program.populate('organizer', 'name email');
  }

  async getAll(options: PaginationOptions): Promise<PaginatedResult<IProgram>> {
    const {
      page = 1, limit = 10, sort = '-createdAt',
      search, status, category, tag, startDate, endDate, isPublished,
    } = options;

    const filter: FilterQuery<IProgram> = {};
    if (search) {
      filter.$or = [
        { 'title.ar': new RegExp(search, 'i') },
        { 'title.en': new RegExp(search, 'i') },
        { 'title.tr': new RegExp(search, 'i') },
      ];
    }
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };
    if (isPublished !== undefined) filter.isPublished = isPublished;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const total = await Program.countDocuments(filter);
    const programs = await Program.find(filter)
      .populate('organizer', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return {
      data: programs,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getPublished(options: PaginationOptions): Promise<PaginatedResult<IProgram>> {
    return this.getAll({ ...options, isPublished: true });
  }

  async getById(id: string): Promise<IProgram> {
    const program = await Program.findById(id).populate('organizer', 'name email');
    if (!program) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Program not found');
    return program;
  }

  async getBySlug(slug: string): Promise<IProgram> {
    const program = await Program.findOne({ slug, isPublished: true }).populate('organizer', 'name email');
    if (!program) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Program not found');
    return program;
  }

  async update(id: string, data: Partial<IProgram>): Promise<IProgram> {
    const program = await Program.findById(id);
    if (!program) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Program not found');
    if (data.title?.en && data.title.en !== program.title.en) {
      (data as any).slug = createSlug(data.title.en);
    }
    Object.assign(program, data);
    await program.save();
    return program.populate('organizer', 'name email');
  }

  async delete(id: string): Promise<void> {
    const program = await Program.findByIdAndDelete(id);
    if (!program) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Program not found');
  }

  async togglePublish(id: string): Promise<IProgram> {
    const program = await Program.findById(id);
    if (!program) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Program not found');
    program.isPublished = !program.isPublished;
    await program.save();
    return program.populate('organizer', 'name email');
  }
}

export default new ProgramService();
