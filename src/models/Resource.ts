import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface IResource extends Document {
  title: {
    ar: string;
    en: string;
    tr: string;
  };
  description?: {
    ar?: string;
    en?: string;
    tr?: string;
  };
  url: string;
  type: 'document' | 'video' | 'link' | 'image' | 'other';
  category: string;
  isPublic: boolean;
  allowedRoles: string[];
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IResourceModel extends Model<IResource> {}

/* ----------------------------- Schema ----------------------------- */
const resourceSchema = new Schema<IResource, IResourceModel>(
  {
    title: {
      ar: { type: String, required: [true, 'Arabic title is required'], trim: true, maxlength: 200 },
      en: { type: String, required: [true, 'English title is required'], trim: true, maxlength: 200 },
      tr: { type: String, required: [true, 'Turkish title is required'], trim: true, maxlength: 200 },
    },
    description: {
      ar: { type: String, maxlength: 500 },
      en: { type: String, maxlength: 500 },
      tr: { type: String, maxlength: 500 },
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'image', 'other'],
      default: 'link',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    isPublic: { type: Boolean, default: true },
    allowedRoles: [{ type: String }],
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ----------------------------- Indexes ----------------------------- */
resourceSchema.index({ category: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ isPublic: 1, isPublished: 1 });

const Resource = mongoose.model<IResource, IResourceModel>('Resource', resourceSchema);

export default Resource;
