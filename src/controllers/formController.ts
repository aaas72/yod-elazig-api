import { Request, Response } from 'express';
import { Form, FormSubmission } from '../models';
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
  const { formId, data } = req.body;
  const form = await Form.findById(formId);
  if (!form || !form.isActive) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Form not found or inactive');

  // Basic validation based on form fields
  for (const field of form.fields) {
    if (field.required && !data[field.name]) {
       throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Field ${field.label.en || field.name} is required`);
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
