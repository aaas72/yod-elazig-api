import User, { IUser } from '../models/User';
import { Types } from 'mongoose';

class UserService {
  async getAll(filters: { page?: number; limit?: number; search?: string } = {}) {
    const { page = 1, limit = 10, search = '' } = filters;
    const query: any = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new Error('Invalid user id');
    const user = await User.findById(id).lean();
    if (!user) throw new Error('User not found');
    return user;
  }

  async create(data: Partial<IUser>) {
    // only allow safe fields
    const user = new User(data as any);
    await user.save();
    return user;
  }

  async update(id: string, data: Partial<IUser>) {
    if (!Types.ObjectId.isValid(id)) throw new Error('Invalid user id');
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    // فقط عدل الحقول التي تم إرسالها وغير undefined
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        (user as any)[key] = value;
      }
    });
    return user.save();
  }

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new Error('Invalid user id');
    return User.findByIdAndDelete(id);
  }

  async toggleActive(id: string) {
    const user = await this.getById(id) as any;
    return this.update(id, { isActive: !user.isActive } as any);
  }
}

export default new UserService();