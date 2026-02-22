import mongoose, { Document, Model, Schema } from 'mongoose';
import { createSlug } from '../utils/slugify';

/* ----------------------------- Sub-interface ----------------------------- */
export interface ITranslation {
  title: string;
  content: string;
  summary: string;
}

/* ----------------------------- Interface ----------------------------- */
export interface INews extends Document {
  title: string;
  slug: string;
  content: string;
  summary?: string;
  coverImage?: string;
  author: mongoose.Types.ObjectId;
  category?: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  publishedAt?: Date;
  translations: {
    ar: ITranslation;
    en: ITranslation;
    tr: ITranslation;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface INewsModel extends Model<INews> {}

/* ----------------------------- Schema ----------------------------- */
const newsSchema = new Schema<INews, INewsModel>(
  {
    title: {
      type: String,
      required: [true, 'News title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'News content is required'],
    },
    summary: {
      type: String,
      maxlength: [500, 'Summary cannot exceed 500 characters'],
    },
    coverImage: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
    },
    translations: {
      ar: {
        title: { type: String, default: '' },
        content: { type: String, default: '' },
        summary: { type: String, default: '' },
      },
      en: {
        title: { type: String, default: '' },
        content: { type: String, default: '' },
        summary: { type: String, default: '' },
      },
      tr: {
        title: { type: String, default: '' },
        content: { type: String, default: '' },
        summary: { type: String, default: '' },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ----------------------------- Indexes ----------------------------- */
newsSchema.index({ isPublished: 1, publishedAt: -1 });
newsSchema.index({ tags: 1 });

/* ----------------------------- Pre-validate ----------------------------- */
newsSchema.pre<INews>('validate', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = createSlug(this.title) + '-' + Date.now().toString(36);
  }
  next();
});

const News = mongoose.model<INews, INewsModel>('News', newsSchema);

export default News;
