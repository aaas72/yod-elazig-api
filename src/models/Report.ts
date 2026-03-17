import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface IReport extends Document {
  title: string;
  description?: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  file: string; // PDF file path
  uploadedBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IReportModel extends Model<IReport> {}

/* ----------------------------- Schema ----------------------------- */
const reportSchema = new Schema<IReport, IReportModel>(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 300 },
    description: { type: String, trim: true },
    quarter: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4'],
      required: [true, 'Quarter is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2020,
      max: 2100,
    },
    file: {
      type: String,
      required: [true, 'PDF file is required'],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ----------------------------- Indexes ----------------------------- */
reportSchema.index({ year: -1, quarter: 1 });
reportSchema.index({ isPublished: 1 });
reportSchema.index({ year: 1, quarter: 1 }, { unique: true });

const Report = mongoose.model<IReport, IReportModel>('Report', reportSchema);

export default Report;
