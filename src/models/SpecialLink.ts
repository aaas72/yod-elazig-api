import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface ISpecialLink extends Document {
  title: string;
  url: string;
  description?: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ISpecialLinkModel extends Model<ISpecialLink> {}

/* ----------------------------- Schema ----------------------------- */
const specialLinkSchema = new Schema<ISpecialLink, ISpecialLinkModel>(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
    url: { type: String, required: [true, 'URL is required'], trim: true },
    description: { type: String, trim: true, maxlength: 500 },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ----------------------------- Indexes ----------------------------- */
specialLinkSchema.index({ order: 1 });
specialLinkSchema.index({ isPublished: 1 });

const SpecialLink = mongoose.model<ISpecialLink, ISpecialLinkModel>('SpecialLink', specialLinkSchema);

export default SpecialLink;
