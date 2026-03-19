import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface IFaqCategory extends Document {
  name: {
    ar: string;
    en: string;
    tr: string;
  };
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IFaqCategoryModel extends Model<IFaqCategory> {}

/* ----------------------------- Schema ----------------------------- */
const faqCategorySchema = new Schema<IFaqCategory, IFaqCategoryModel>(
  {
    name: {
      ar: { type: String, required: [true, 'Arabic name is required'], trim: true },
      en: { type: String, trim: true },
      tr: { type: String, trim: true },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ----------------------------- Indexes ----------------------------- */
faqCategorySchema.index({ order: 1 });
faqCategorySchema.index({ slug: 1 });
faqCategorySchema.index({ isActive: 1 });

const FaqCategory = mongoose.model<IFaqCategory, IFaqCategoryModel>('FaqCategory', faqCategorySchema);

export default FaqCategory;
