import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface IFAQ extends Document {
  question: {
    ar: string;
    en: string;
    tr: string;
  };
  answer: {
    ar: string;
    en: string;
    tr: string;
  };
  category?: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IFAQModel extends Model<IFAQ> {}

/* ----------------------------- Schema ----------------------------- */
const faqSchema = new Schema<IFAQ, IFAQModel>(
  {
    question: {
      ar: { type: String, required: [true, 'Arabic question is required'], trim: true },
      en: { type: String, required: [true, 'English question is required'], trim: true },
      tr: { type: String, required: [true, 'Turkish question is required'], trim: true },
    },
    answer: {
      ar: { type: String, required: [true, 'Arabic answer is required'] },
      en: { type: String, required: [true, 'English answer is required'] },
      tr: { type: String, required: [true, 'Turkish answer is required'] },
    },
    category: { type: String, trim: true },
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
faqSchema.index({ order: 1 });
faqSchema.index({ category: 1 });
faqSchema.index({ isPublished: 1 });

const FAQ = mongoose.model<IFAQ, IFAQModel>('FAQ', faqSchema);

export default FAQ;
