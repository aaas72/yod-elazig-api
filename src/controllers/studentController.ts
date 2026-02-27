import { Request, Response } from 'express';
import { studentService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';
import fs from 'fs';
import path from 'path';

/**
 * @desc    Create a new student
 * @route   POST /api/v1/students/join
 * @access  Public
 */
export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  try {
    // 1. Prepare temp file paths
    let profileImage: string | undefined;
    let studentDocument: string | undefined;
    let fileNames: string[] = [];

    // Assuming files are uploaded to 'uploads/temp' by multer
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const tempDir = path.join(uploadDir, 'temp');

    // Helper to get relative path
    const getTempPath = (filename: string) => `/${uploadDir}/temp/${filename}`;

    if (req.files) {
      if (Array.isArray(req.files)) {
        fileNames = (req.files as Express.Multer.File[]).map(f => getTempPath(f.filename));
      } else {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (files.profileImage && files.profileImage.length > 0) {
          profileImage = getTempPath(files.profileImage[0].filename);
          fileNames.push(profileImage);
        }

        if (files.studentDocument && files.studentDocument.length > 0) {
          studentDocument = getTempPath(files.studentDocument[0].filename);
          fileNames.push(studentDocument);
        }

        Object.keys(files).forEach(key => {
          if (key !== 'profileImage' && key !== 'studentDocument') {
            files[key].forEach(f => {
              fileNames.push(getTempPath(f.filename));
            });
          }
        });
      }
    }

    console.log('Creating student with body:', req.body);
    console.log('Temp Profile Image:', profileImage);
    console.log('Temp Student Document:', studentDocument);

    // 2. Create student with temp paths (so we get the ID)
    let student = await studentService.create({
      ...req.body,
      profileImage,
      studentDocument,
      files: fileNames,
    });

    // 3. Create specific folder for student
    // Name format: FirstName_StudentID (e.g. Ahmed_STU-00001)
    const firstName = student.fullName.split(' ')[0].trim();
    // Sanitize first name to be safe for folder name
    const safeFirstName = firstName.replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '');
    const studentFolder = `${safeFirstName}_${student.studentId}`;
    const targetDir = path.join(uploadDir, 'students', studentFolder);

    // Create directory
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 4. Move files from temp to student folder and update paths
    const moveFile = (oldPath: string) => {
      // oldPath is like /uploads/temp/filename.ext
      // We need absolute path or relative from root
      const filename = path.basename(oldPath);
      const sourcePath = path.join(tempDir, filename);
      const destPath = path.join(targetDir, filename);

      try {
        if (fs.existsSync(sourcePath)) {
          fs.renameSync(sourcePath, destPath);
          // Return new relative path for DB
          return `/${uploadDir}/students/${studentFolder}/${filename}`;
        }
      } catch (err) {
        console.error(`Failed to move file ${sourcePath} to ${destPath}:`, err);
      }
      return oldPath; // Fallback
    };

    let newProfileImage = profileImage;
    let newStudentDocument = studentDocument;
    let newFileNames: string[] = [];

    if (profileImage) {
      newProfileImage = moveFile(profileImage);
    }
    if (studentDocument) {
      newStudentDocument = moveFile(studentDocument);
    }
    // Update files array
    newFileNames = fileNames.map(f => moveFile(f));

    // Remove duplicates in newFileNames if moveFile returned same path for same file
    // (Since we moved profileImage and studentDocument individually, they might be in fileNames too)
    // Actually moveFile checks existence. If we moved it once, second time source won't exist.
    // So we should be careful.

    // Better approach:
    // Iterate over all uploaded files from req.files and move them.
    // Then reconstruct the paths.

    // Re-implementation of move logic to be safe:
    const fileMap = new Map<string, string>(); // oldPath -> newPath

    // Helper to process a file object
    const processFile = (file: Express.Multer.File) => {
      const filename = file.filename;
      const sourcePath = path.join(tempDir, filename);
      const destPath = path.join(targetDir, filename);

      if (fs.existsSync(sourcePath)) {
        try {
          fs.renameSync(sourcePath, destPath);
          const newPath = `/${uploadDir}/students/${studentFolder}/${filename}`;
          fileMap.set(getTempPath(filename), newPath);
        } catch (err) {
          console.error(`Error moving file ${filename}:`, err);
        }
      } else {
        // Already moved? (e.g. if same file referenced twice?)
        // Check if destination exists
        if (fs.existsSync(destPath)) {
          const newPath = `/${uploadDir}/students/${studentFolder}/${filename}`;
          fileMap.set(getTempPath(filename), newPath);
        }
      }
    };

    if (req.files) {
      if (Array.isArray(req.files)) {
        (req.files as Express.Multer.File[]).forEach(processFile);
      } else {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        Object.values(files).forEach(arr => arr.forEach(processFile));
      }
    }

    // 5. Update student record with new paths
    const updateData: any = {};
    if (profileImage && fileMap.has(profileImage)) {
      updateData.profileImage = fileMap.get(profileImage);
    }
    if (studentDocument && fileMap.has(studentDocument)) {
      updateData.studentDocument = fileMap.get(studentDocument);
    }
    if (fileNames.length > 0) {
      updateData.files = fileNames.map(f => fileMap.get(f) || f);
    }

    // Update in DB
    student = await studentService.update(student._id as string, updateData);

    new ApiResponse(HTTP_STATUS.CREATED, 'Student created successfully', {
      student,
    }).send(res);
  } catch (error) {
    console.error('Error in createStudent controller:', error);
    // Cleanup temp files if any
    // TODO: Implement cleanup
    throw error;
  }
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
