import mongoose, { Document, Model, Schema } from 'mongoose';
import { createSlug } from '../utils/slugify';

/* ----------------------------- Interface ----------------------------- */
export interface IProgram extends Document {
  title: {
    ar: string;
    en: string;
    tr: string;
  };
  slug: string;
  description: {
    ar: string;
    en: string;
    tr: string;
  };
  summary?: {
    ar?: string;
    en?: string;
    tr?: string;
  };
  coverImage?: string;
  images: string[];
  organizer: mongoose.Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  status: 'upcoming' | 'ongoing' | 'completed';
  category?: string;
  tags: string[];
  location?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IProgramModel extends Model<IProgram> {}

/* ----------------------------- Schema ----------------------------- */
const programSchema = new Schema<IProgram, IProgramModel>(
  {
    title: {
      ar: { type: String, required: [true, 'Arabic title is required'], trim: true, maxlength: 200 },
      en: { type: String, required: [true, 'English title is required'], trim: true, maxlength: 200 },
      tr: { type: String, required: [true, 'Turkish title is required'], trim: true, maxlength: 200 },
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      ar: { type: String, required: [true, 'Arabic description is required'] },
      en: { type: String, required: [true, 'English description is required'] },
      tr: { type: String, required: [true, 'Turkish description is required'] },
    },
    summary: {
      ar: { type: String, maxlength: 500 },
      en: { type: String, maxlength: 500 },
      tr: { type: String, maxlength: 500 },
    },
    coverImage: { type: String },
    images: [{ type: String }],
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    location: { type: String, trim: true },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ----------------------------- Indexes ----------------------------- */
programSchema.index({ status: 1, isPublished: 1 });
programSchema.index({ startDate: 1 });
programSchema.index({ tags: 1 });

/* ----------------------------- Pre-validate ----------------------------- */
programSchema.pre<IProgram>('validate', function (next) {
  if (this.title?.en && (!this.slug || this.isModified('title.en'))) {
    this.slug = createSlug(this.title.en) + '-' + Date.now().toString(36);
  }
  next();
});

/* ----------------------------- Auto-update status ----------------------------- */
programSchema.pre<IProgram>('save', function (next) {
  const now = new Date();
  if (this.startDate > now) {
    this.status = 'upcoming';
  } else if (this.endDate && this.endDate < now) {
    this.status = 'completed';
  } else {
    this.status = 'ongoing';
  }
  next();
});

const Program = mongoose.model<IProgram, IProgramModel>('Program', programSchema);

export default Program;
