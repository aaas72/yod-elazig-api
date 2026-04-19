import { Request, Response } from 'express';
import { studentService, mediaService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

type UploadedFields = {
  profileImage?: Express.Multer.File;
  studentDocument?: Express.Multer.File;
  allFiles: Express.Multer.File[];
};

/**
 * Collects all uploaded files from req.files and returns
 * named fields (profileImage, studentDocument) + all temp paths.
 */
function collectUploadedFiles(req: Request): UploadedFields {
  let profileImage: Express.Multer.File | undefined;
  let studentDocument: Express.Multer.File | undefined;
  const allFiles: Express.Multer.File[] = [];

  if (!req.files) return { profileImage, studentDocument, allFiles };

  if (Array.isArray(req.files)) {
    allFiles.push(...req.files);
  } else {
    const fields = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (fields.profileImage?.[0]) profileImage = fields.profileImage[0];
    if (fields.studentDocument?.[0]) studentDocument = fields.studentDocument[0];

    Object.values(fields).forEach(arr => allFiles.push(...arr));
  }

  return { profileImage, studentDocument, allFiles };
}

/**
 * @desc    Create a new student
 * @route   POST /api/v1/students/join
 * @access  Public
 */
export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const { profileImage, studentDocument, allFiles } = collectUploadedFiles(req);
  const uploadedMediaIds: string[] = [];
  let student = await studentService.create({ ...req.body });

  try {
    if (allFiles.length > 0) {
      const safeFirstName = student.fullName
        .split(' ')[0]
        .trim()
        .replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '');

      const studentFolder = `${safeFirstName || 'student'}_${student.studentId}`;
      const targetFolder = `students/${studentFolder}`;
      const uploadedUrls: string[] = [];
      let profileImageUrl: string | undefined;
      let studentDocumentUrl: string | undefined;

      if (profileImage) {
        const profileMedia = await mediaService.upload(
          profileImage,
          req.user?._id?.toString(),
          targetFolder,
          `Profile image - ${student.fullName}`,
        );
        uploadedMediaIds.push(String(profileMedia._id));
        profileImageUrl = profileMedia.url;
        uploadedUrls.push(profileMedia.url);
      }

      if (studentDocument) {
        const documentMedia = await mediaService.upload(
          studentDocument,
          req.user?._id?.toString(),
          targetFolder,
          `Student document - ${student.fullName}`,
        );
        uploadedMediaIds.push(String(documentMedia._id));
        studentDocumentUrl = documentMedia.url;
        uploadedUrls.push(documentMedia.url);
      }

      const mappedFiles = new Set<string>();
      if (profileImage) mappedFiles.add(profileImage.originalname + profileImage.size + profileImage.mimetype);
      if (studentDocument) mappedFiles.add(studentDocument.originalname + studentDocument.size + studentDocument.mimetype);

      for (const file of allFiles) {
        const fingerprint = file.originalname + file.size + file.mimetype;
        if (mappedFiles.has(fingerprint)) continue;

        const media = await mediaService.upload(
          file,
          req.user?._id?.toString(),
          targetFolder,
          `Student file - ${student.fullName}`,
        );
        uploadedMediaIds.push(String(media._id));
        uploadedUrls.push(media.url);
      }

      student = await studentService.update(student._id as string, {
        profileImage: profileImageUrl,
        studentDocument: studentDocumentUrl,
        files: uploadedUrls,
      });
    }
  } catch (error) {
    for (const mediaId of uploadedMediaIds) {
      try {
        await mediaService.delete(mediaId);
      } catch (_cleanupError) {
        // Ignore cleanup errors to preserve the original failure reason.
      }
    }

    try {
      await studentService.delete(student._id as string);
    } catch (_cleanupError) {
      // Ignore cleanup errors to preserve the original failure reason.
    }

    throw error;
  }

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

/**
 * @desc    Get students statistics
 * @route   GET /api/v1/students/stats
 * @access  Private (admin, editor)
 */
export const getStudentStats = asyncHandler(async (_req: Request, res: Response) => {
  try {
    const stats = await studentService.getStats();
    new ApiResponse(HTTP_STATUS.OK, 'Student stats retrieved', { stats }).send(res);
  } catch (error) {
    console.error('Error in getStudentStats:', error);
    throw error;
  }
});

/**
 * @desc    Review student membership application
 * @route   PATCH /api/v1/students/:id/review
 * @access  Private (admin)
 */
export const reviewStudent = asyncHandler(async (req: Request, res: Response) => {
  const { status, reviewNote } = req.body;
  const student = await studentService.review(
    req.params.id as string,
    status,
    req.user!._id.toString(),
    reviewNote,
  );
  new ApiResponse(HTTP_STATUS.OK, 'Student reviewed', { student }).send(res);
});

/**
 * @desc    Get student by studentId
 * @route   GET /api/v1/students/by-id/:studentId
 * @access  Private (admin, editor)
 */
export const getStudentByStudentId = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.getByStudentId(req.params.studentId as string);
  new ApiResponse(HTTP_STATUS.OK, 'Student retrieved', { student }).send(res);
});

/**
 * @desc    Export students data
 * @route   GET /api/v1/students/export
 * @access  Private (admin)
 */
export const exportStudents = asyncHandler(async (req: Request, res: Response) => {
  const students = await studentService.export(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Students exported', { students }).send(res);
});
