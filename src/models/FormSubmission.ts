import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFormSubmission extends Document {
  form: mongoose.Types.ObjectId;
  data: Record<string, any>; // Stores fieldName: value
  createdAt: Date;
  updatedAt: Date;
}

const FormSubmissionSchema = new Schema<IFormSubmission>(
  {
    form: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const FormSubmission = mongoose.model<IFormSubmission>('FormSubmission', FormSubmissionSchema);
export default FormSubmission;
