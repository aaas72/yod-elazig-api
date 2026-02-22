import { Request, Response } from 'express';
import { studentService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

/**
 * @desc    Create a new student
 * @route   POST /api/v1/students
 * @access  Private (admin)
 */
export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.create(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Student created successfully', {
    student,
  }).send(res);
});

/**
 * @desc    Get all students
 * @route   GET /api/v1/students
 * @access  Private (admin, editor)
 */
export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentService.getAll(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Students retrieved', result).send(res);
});

/**
 * @desc    Get student by ID
 * @route   GET /api/v1/students/:id
 * @access  Private (admin, editor, own)
 */
export const getStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Student retrieved', { student }).send(res);
});

/**
 * @desc    Get current student profile
 * @route   GET /api/v1/students/me
 * @access  Private (student)
 */
export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.getByUserId(req.user!._id.toString());
  new ApiResponse(HTTP_STATUS.OK, 'Profile retrieved', { student }).send(res);
});

/**
 * @desc    Update student
 * @route   PUT /api/v1/students/:id
 * @access  Private (admin)
 */
export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.update(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'Student updated successfully', {
    student,
  }).send(res);
});

/**
 * @desc    Delete student
 * @route   DELETE /api/v1/students/:id
 * @access  Private (admin)
 */
export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  await studentService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Student deleted successfully').send(res);
});
