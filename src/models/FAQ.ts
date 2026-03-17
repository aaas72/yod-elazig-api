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
  // Steps are now an array of objects, each containing multilingual text and an optional file
  steps?: {
    text: {
      ar: string;
      en: string;
      tr: string;
    };
    fileUrl?: string;
  }[];
  documents?: {
    name: {
      ar: string;
      en: string;
      tr: string;
    };
    url: string;
  }[];
  category: string;
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
      en: { type: String, trim: true },
      tr: { type: String, trim: true },
    },
    answer: {
      ar: { type: String, required: [true, 'Arabic answer is required'] },
      en: { type: String },
      tr: { type: String },
    },
    steps: [
      {
        text: {
          ar: { type: String },
          en: { type: String },
          tr: { type: String },
        },
        fileUrl: { type: String },
      }
    ],
    documents: [
      {
        name: {
          ar: { type: String },
          en: { type: String },
          tr: { type: String },
        },
        url: { type: String },
      },
    ],
    category: { type: String, trim: true, required: true },
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
