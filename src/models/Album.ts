import mongoose, { Document, Model, Schema } from 'mongoose';
import { createSlug } from '../utils/slugify';

/* ----------------------------- Album Interface ----------------------------- */
export interface IAlbum extends Document {
  title: {
    ar: string;
    en: string;
    tr: string;
  };
  slug: string;
  description?: {
    ar?: string;
    en?: string;
    tr?: string;
  };
  coverImage?: string;
  photos: IPhoto[];
  category?: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/* ----------------------------- Photo Sub-document ----------------------------- */
export interface IPhoto {
  url: string;
  thumbnail?: string;
  caption?: {
    ar?: string;
    en?: string;
    tr?: string;
  };
  order: number;
}

interface IAlbumModel extends Model<IAlbum> { }

/* ----------------------------- Photo Schema ----------------------------- */
const photoSchema = new Schema<IPhoto>(
  {
    url: { type: String, required: true },
    thumbnail: { type: String },
    caption: {
      ar: { type: String },
      en: { type: String },
      tr: { type: String },
    },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

/* ----------------------------- Album Schema ----------------------------- */
const albumSchema = new Schema<IAlbum, IAlbumModel>(
  {
    title: {
      ar: { type: String, trim: true, maxlength: 200 },
      en: { type: String, trim: true, maxlength: 200 },
      tr: { type: String, trim: true, maxlength: 200 },
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      ar: { type: String, maxlength: 500 },
      en: { type: String, maxlength: 500 },
      tr: { type: String, maxlength: 500 },
    },
    coverImage: { type: String },
    photos: [photoSchema],
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
albumSchema.index({ category: 1 });
albumSchema.index({ order: 1 });
albumSchema.index({ isPublished: 1 });

/* ----------------------------- Pre-validate ----------------------------- */
albumSchema.pre<IAlbum>('validate', function (next) {
  // If title is not provided, use default with date
  if (!this.title?.ar && !this.title?.en && !this.title?.tr) {
    const dateStr = new Date().toLocaleDateString('ar-EG');
    this.title = {
      ar: `ألبوم صور - ${dateStr}`,
      en: `Photo Album - ${new Date().toLocaleDateString('en-US')}`,
      tr: `Fotoğraf Albümü - ${new Date().toLocaleDateString('tr-TR')}`
    };
  }

  if (!this.slug) {
    // Generate slug from title or timestamp
    const baseTitle = this.title?.en || this.title?.tr || this.title?.ar || 'album';
    this.slug = createSlug(baseTitle) + '-' + Date.now().toString(36);
  }
  next();
});

const Album = mongoose.model<IAlbum, IAlbumModel>('Album', albumSchema);

export default Album;
