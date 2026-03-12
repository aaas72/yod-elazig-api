import { Request, Response } from 'express';
import { studentService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

const getTempPath = (filename: string) => `/${UPLOAD_DIR}/temp/${filename}`;
const getStudentPath = (folder: string, filename: string) => `/${UPLOAD_DIR}/students/${folder}/${filename}`;

/**
 * Collects all uploaded files from req.files and returns
 * named fields (profileImage, studentDocument) + all temp paths.
 */
function collectUploadedFiles(req: Request): {
  profileImage?: string;
  studentDocument?: string;
  allFiles: Express.Multer.File[];
} {
  let profileImage: string | undefined;
  let studentDocument: string | undefined;
  const allFiles: Express.Multer.File[] = [];

  if (!req.files) return { profileImage, studentDocument, allFiles };

  if (Array.isArray(req.files)) {
    allFiles.push(...req.files);
  } else {
    const fields = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (fields.profileImage?.[0]) {
      profileImage = getTempPath(fields.profileImage[0].filename);
    }
    if (fields.studentDocument?.[0]) {
      studentDocument = getTempPath(fields.studentDocument[0].filename);
    }

    Object.values(fields).forEach(arr => allFiles.push(...arr));
  }

  return { profileImage, studentDocument, allFiles };
}

/**
 * Moves a file from the temp directory to the student's folder.
 * Returns the new relative path, or undefined if the move failed.
 */
function moveFileToStudentDir(
  file: Express.Multer.File,
  tempDir: string,
  targetDir: string,
  studentFolder: string,
): string | undefined {
  const src = path.join(tempDir, file.filename);
  const dest = path.join(targetDir, file.filename);

  try {
    if (fs.existsSync(src)) fs.renameSync(src, dest);
    if (fs.existsSync(dest)) return getStudentPath(studentFolder, file.filename);
  } catch (_err) {}

  return undefined;
}

/**
 * @desc    Create a new student
 * @route   POST /api/v1/students/join
 * @access  Public
 */
export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  // 1. Collect uploaded files
  const { profileImage, studentDocument, allFiles } = collectUploadedFiles(req);
  const fileNames = allFiles.map(f => getTempPath(f.filename));

  // 2. Create student record with temp paths to obtain a generated ID
  let student = await studentService.create({
    ...req.body,
    profileImage,
    studentDocument,
    files: fileNames,
  });

  // 3. Build student-specific folder: FirstName_StudentID
  const safeFirstName = student.fullName.split(' ')[0].trim().replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '');
  const studentFolder = `${safeFirstName}_${student.studentId}`;
  const tempDir = path.join(UPLOAD_DIR, 'temp');
  const targetDir = path.join(UPLOAD_DIR, 'students', studentFolder);

  fs.mkdirSync(targetDir, { recursive: true });

  // 4. Move all files from temp → student folder; build tempPath → newPath map
  const fileMap = new Map<string, string>();
  for (const file of allFiles) {
    const newPath = moveFileToStudentDir(file, tempDir, targetDir, studentFolder);
    if (newPath) fileMap.set(getTempPath(file.filename), newPath);
  }

  // 5. Update student record with final paths
  const updateData: Record<string, any> = {};
  if (profileImage) updateData.profileImage = fileMap.get(profileImage) ?? profileImage;
  if (studentDocument) updateData.studentDocument = fileMap.get(studentDocument) ?? studentDocument;
  if (fileNames.length > 0) updateData.files = fileNames.map(f => fileMap.get(f) ?? f);

  student = await studentService.update(student._id as string, updateData);

  new ApiResponse(HTTP_STATUS.CREATED, 'Student created successfully', { student }).send(res);
});

/**
 * @desc    Get all students
 * @route   GET /api/v1/students
 * @access  Private (admin, editor)
 */
export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentService.getAll(req.query as any, req);
  new ApiResponse(HTTP_STATUS.OK, 'Students retrieved', result).send(res);
});

/**
 * @desc    Get student by ID
 * @route   GET /api/v1/students/:id
 * @access  Private (admin, editor, own)
 */
export const getStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.getById(req.params.id as string, req);
  new ApiResponse(HTTP_STATUS.OK, 'Student retrieved', { student }).send(res);
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
