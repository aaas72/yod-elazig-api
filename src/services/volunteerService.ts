import { FilterQuery } from 'mongoose';
import { Volunteer } from '../models';
import { IVolunteer } from '../models/Volunteer';
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

class VolunteerService {
  async create(data: Partial<IVolunteer>): Promise<IVolunteer> {
    const existing = await Volunteer.findOne({ email: data.email, status: 'pending' });
    if (existing) throw new ApiError(HTTP_STATUS.CONFLICT, 'You already have a pending application');
    return Volunteer.create(data);
  }

  async getAll(options: PaginationOptions): Promise<PaginatedResult<IVolunteer>> {
    const { page = 1, limit = 10, sort = '-createdAt', status, search } = options;
    const filter: FilterQuery<IVolunteer> = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { university: new RegExp(search, 'i') },
        { volunteerId: new RegExp(search, 'i') },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Volunteer.countDocuments(filter);
    const data = await Volunteer.find(filter)
      .populate('reviewedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getById(id: string): Promise<IVolunteer> {
    const item = await Volunteer.findById(id).populate('reviewedBy', 'name email');
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer application not found');
    return item;
  }

  async getByVolunteerId(volunteerId: string): Promise<IVolunteer> {
    const item = await Volunteer.findOne({ volunteerId }).populate('reviewedBy', 'name email');
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer application not found');
    return item;
  }

  async review(
    id: string,
    status: 'accepted' | 'rejected' | 'active' | 'completed' | 'suspended',
    userId: string,
    reviewNote?: string,
  ): Promise<IVolunteer> {
    const item = await Volunteer.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer application not found');
    item.status = status;
    item.reviewedBy = userId as any;
    item.reviewedAt = new Date();
    if (reviewNote) item.reviewNote = reviewNote;
    await item.save();
    return item.populate('reviewedBy', 'name email');
  }

  async update(id: string, data: Partial<IVolunteer>): Promise<IVolunteer> {
    const item = await Volunteer.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('reviewedBy', 'name email');
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer application not found');
    return item;
  }

  async delete(id: string): Promise<void> {
    const item = await Volunteer.findByIdAndDelete(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer application not found');
  }

  async getStats() {
    const [total, pending, accepted, rejected, active, completed, suspended] = await Promise.all([
      Volunteer.countDocuments(),
      Volunteer.countDocuments({ status: 'pending' }),
      Volunteer.countDocuments({ status: 'accepted' }),
      Volunteer.countDocuments({ status: 'rejected' }),
      Volunteer.countDocuments({ status: 'active' }),
      Volunteer.countDocuments({ status: 'completed' }),
      Volunteer.countDocuments({ status: 'suspended' }),
    ]);
    return { total, pending, accepted, rejected, active, completed, suspended };
  }

  async export(status?: string): Promise<IVolunteer[]> {
    const filter: FilterQuery<IVolunteer> = {};
    if (status) filter.status = status;
    return Volunteer.find(filter).sort('-createdAt');
  }
}

export default new VolunteerService();
