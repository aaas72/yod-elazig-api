import { Types, FilterQuery } from 'mongoose';
import { Student } from '../models';
import { IStudent } from '../models/Student';
import { User } from '../models';
import { IUser } from '../models/User';
import { ApiError } from '../utils';
import { HTTP_STATUS, ROLES } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  university?: string;
  department?: string;
  yearOfStudy?: number;
  nationality?: string;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class StudentService {
  /**
   * Create a new student + user account
   */
  async create(data: {
    name: string;
    email: string;
    password: string;
    university?: string;
    department?: string;
    yearOfStudy?: number;
    phone?: string;
    nationality?: string;
    address?: string;
  }): Promise<IStudent> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already registered');
    }

    // Create user account with student role
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: ROLES.STUDENT,
    });

    // Create student profile
    const student = await Student.create({
      user: user._id,
      university: data.university,
      department: data.department,
      yearOfStudy: data.yearOfStudy,
      phone: data.phone,
      nationality: data.nationality,
      address: data.address,
    });

    return student.populate('user', 'name email role isActive');
  }

  /**
   * Get all students with filtering & pagination
   */
  async getAll(options: PaginationOptions): Promise<PaginatedResult<IStudent>> {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      university,
      department,
      yearOfStudy,
      nationality,
    } = options;

    const filter: FilterQuery<IStudent> = {};

    if (university) filter.university = new RegExp(university, 'i');
    if (department) filter.department = new RegExp(department, 'i');
    if (yearOfStudy) filter.yearOfStudy = yearOfStudy;
    if (nationality) filter.nationality = new RegExp(nationality, 'i');

    // If search term, find matching users first
    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
        ],
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);
      filter.user = { $in: userIds } as any;
    }

    const skip = (page - 1) * limit;
    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .populate('user', 'name email role isActive')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return {
      data: students,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get student by ID
   */
  async getById(id: string): Promise<IStudent> {
    const student = await Student.findById(id).populate(
      'user',
      'name email role isActive',
    );
    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');
    }
    return student;
  }

  /**
   * Get student by userId
   */
  async getByUserId(userId: string): Promise<IStudent> {
    const student = await Student.findOne({
      user: new Types.ObjectId(userId),
    }).populate('user', 'name email role isActive');
    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student profile not found');
    }
    return student;
  }

  /**
   * Update student
   */
  async update(
    id: string,
    data: Partial<IStudent> & { name?: string; email?: string },
  ): Promise<IStudent> {
    const student = await Student.findById(id);
    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');
    }

    // Update user fields if provided
    if (data.name || data.email) {
      const userUpdate: Record<string, string> = {};
      if (data.name) userUpdate.name = data.name;
      if (data.email) {
        const existing = await User.findOne({
          email: data.email,
          _id: { $ne: student.user },
        });
        if (existing) {
          throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already in use');
        }
        userUpdate.email = data.email;
      }
      await User.findByIdAndUpdate(student.user, userUpdate);
    }

    // Update student fields
    const studentFields: (keyof IStudent)[] = [
      'university',
      'department',
      'yearOfStudy',
      'phone',
      'nationality',
      'address',
      'notes',
    ];

    for (const field of studentFields) {
      if (data[field] !== undefined) {
        (student as any)[field] = data[field];
      }
    }

    await student.save();
    return student.populate('user', 'name email role isActive');
  }

  /**
   * Delete student + user account
   */
  async delete(id: string): Promise<void> {
    const student = await Student.findById(id);
    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');
    }

    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(id);
  }
}

export default new StudentService();
