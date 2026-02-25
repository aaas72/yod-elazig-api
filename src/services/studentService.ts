import { Types, FilterQuery } from 'mongoose';
import { Student } from '../models';
import { IStudent } from '../models/Student';
import { ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  university?: string;
  department?: string;
  yearOfStudy?: number;
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
   * Create a new student
   */
  async create(data: {
    fullName: string;
    fullNameEn: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: Date;
    phoneNumber: string;
    email: string;
    tcNumber: string;
    files?: string[];
    profileImage?: string;
    studentDocument?: string;
    university?: string;
    department?: string;
    yearOfStudy?: number;
    address?: string;
  }): Promise<IStudent> {
    const existingStudent = await Student.findOne({
      $or: [{ email: data.email }, { tcNumber: data.tcNumber }]
    });

    if (existingStudent) {
      if (existingStudent.email === data.email) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'تم التسجيل مسبقاً بهذا البريد الإلكتروني');
      }
      if (existingStudent.tcNumber === data.tcNumber) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'تم التسجيل مسبقاً برقم الهوية هذا');
      }
      throw new ApiError(HTTP_STATUS.CONFLICT, 'تم التسجيل مسبقاً');
    }

    // Create student profile
    const student = await Student.create({
      fullName: data.fullName,
      fullNameEn: data.fullNameEn,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      phoneNumber: data.phoneNumber,
      email: data.email,
      tcNumber: data.tcNumber,
      files: data.files,
      profileImage: data.profileImage,
      studentDocument: data.studentDocument,
      university: data.university,
      department: data.department,
      yearOfStudy: data.yearOfStudy,
      address: data.address,
    });

    return student;
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
    } = options;

    const filter: FilterQuery<IStudent> = {};

    if (university) filter.university = new RegExp(university, 'i');
    if (department) filter.department = new RegExp(department, 'i');
    if (yearOfStudy) filter.yearOfStudy = yearOfStudy;

    // Search in student fields
    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, 'i') },
        { fullNameEn: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { tcNumber: new RegExp(search, 'i') },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
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
    const student = await Student.findById(id);
    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');
    }
    return student;
  }

  /**
   * Update student
   */
  async update(
    id: string,
    data: Partial<IStudent>,
  ): Promise<IStudent> {
    const student = await Student.findById(id);
    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');
    }

    // Check email uniqueness if being updated
    if (data.email && data.email !== student.email) {
      const existing = await Student.findOne({
        email: data.email,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already in use');
      }
    }

    // Update student fields
    Object.assign(student, data);
    await student.save();
    return student;
  }

  /**
   * Delete student
   */
  async delete(id: string): Promise<void> {
    const student = await Student.findById(id);
    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');
    }
    await student.deleteOne();
  }
}

export const studentService = new StudentService();
