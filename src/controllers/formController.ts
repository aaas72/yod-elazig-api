import { Request, Response } from 'express';
import { Form, FormSubmission } from '../models';
import { mediaService } from '../services';
import { asyncHandler, ApiResponse, ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

// --- Form Management (Admin) ---

export const createForm = asyncHandler(async (req: Request, res: Response) => {
  // Simple slug generation if not provided
  if (!req.body.slug && req.body.title?.en) {
    req.body.slug = req.body.title.en.toLowerCase().replace(/ /g, '-');
  } else if (!req.body.slug) {
    req.body.slug = `form-${Date.now()}`;
  }

  const form = await Form.create(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'Form created successfully', { form }).send(res);
});

export const updateForm = asyncHandler(async (req: Request, res: Response) => {
  const form = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!form) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Form not found');
  new ApiResponse(HTTP_STATUS.OK, 'Form updated successfully', { form }).send(res);
});

export const deleteForm = asyncHandler(async (req: Request, res: Response) => {
  const form = await Form.findByIdAndDelete(req.params.id);
  if (!form) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Form not found');
  // Optionally delete submissions? For now keep them or delete manually
  await FormSubmission.deleteMany({ form: req.params.id });
  new ApiResponse(HTTP_STATUS.OK, 'Form deleted successfully').send(res);
});

export const getAllForms = asyncHandler(async (req: Request, res: Response) => {
  const forms = await Form.find().sort({ createdAt: -1 });
  new ApiResponse(HTTP_STATUS.OK, 'Forms retrieved', { forms }).send(res);
});

export const getFormById = asyncHandler(async (req: Request, res: Response) => {
  const form = await Form.findById(req.params.id);
  if (!form) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Form not found');
  new ApiResponse(HTTP_STATUS.OK, 'Form retrieved', { form }).send(res);
});

// --- Public Access ---

export const getFormBySlug = asyncHandler(async (req: Request, res: Response) => {
  const form = await Form.findOne({ slug: req.params.slug, isActive: true });
  if (!form) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Form not found or inactive');
  new ApiResponse(HTTP_STATUS.OK, 'Form retrieved', { form }).send(res);
});

export const submitForm = asyncHandler(async (req: Request, res: Response) => {
  // Debug log to inspect incoming request
  console.log('Submit Form Body:', req.body);
  console.log('Submit Form Files:', req.files);

  let { formId, data } = req.body;

  // Fallback: if formId is not directly in body, try to find it in data if it's parsed
  if (!formId && data && typeof data === 'object' && data.formId) {
      formId = data.formId;
  }
  
  if (!formId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Form ID is missing. Please ensure you are submitting correctly.');
  }

  // Helper to fix Multer UTF-8 encoding issue
  const fixUtf8 = (str: string) => {
    try {
      return Buffer.from(str, 'latin1').toString('utf8');
    } catch {
      return str;
    }
  };

  // Handle multipart/form-data where fields are flattened in req.body
  if (!data && req.body) {
    data = {};
    // Copy and fix keys/values from req.body
    Object.keys(req.body).forEach(key => {
      if (key !== 'formId') {
        // Fix key encoding if needed (Multer sometimes messes up non-ASCII keys)
        const fixedKey = fixUtf8(key);
        data[fixedKey] = req.body[key];
        // Also keep original key just in case
        if (fixedKey !== key) {
          data[key] = req.body[key];
        }
      }
    });
  }

  // If data came as a JSON string (e.g. from some clients), parse it
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      // ignore, treat as is
    }
  }

  // Handle Files (from Multer)
  if (req.files && Array.isArray(req.files)) {
    const files = req.files as Express.Multer.File[];
    for (const file of files) {
      // Upload file without userId (public submission)
      const media = await mediaService.upload(file, undefined, 'forms');

      // Fix fieldname encoding (Common Multer issue with non-ASCII field names)
      // Try to match fieldname with form fields to see if it needs fixing?
      // For now, let's try to save both if they differ, or just fix it.
      // The safest way is to check if the fixed version differs.

      let fieldName = file.fieldname;
      // Attempt to fix encoding if it looks like latin1
      // Note: This is heuristic. If your system is already UTF-8, this might break it.
      // But given the issue, it's likely needed.
      // Let's rely on the fact that if we can't find the field, we can't save it correctly.

      // Assign the URL to the corresponding field name in data
      data[fieldName] = media.url;

      // Also try to fix encoding and save that too if different, just in case
      const fixedName = fixUtf8(fieldName);
      if (fixedName !== fieldName) {
        data[fixedName] = media.url;
      }
    }
  }

  const form = await Form.findById(formId);
  if (!form || !form.isActive) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Form not found or inactive');

  // Basic validation based on form fields
  for (const field of form.fields) {
    if (field.required && !data[field.name]) {
      // Debug info: list received keys
      const receivedKeys = Object.keys(data).join(', ');
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Field ${field.label.en || field.name} is required. (Received: ${receivedKeys})`);
    }
  }

  const submission = await FormSubmission.create({ form: formId, data });
  new ApiResponse(HTTP_STATUS.CREATED, 'Submission successful', { submission }).send(res);
});

// --- Submissions (Admin) ---

export const getFormSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const { formId } = req.params;
  const submissions = await FormSubmission.find({ form: formId }).sort({ createdAt: -1 });
  new ApiResponse(HTTP_STATUS.OK, 'Submissions retrieved', { submissions }).send(res);
});
