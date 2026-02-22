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

interface IAlbumModel extends Model<IAlbum> {}

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
      ar: { type: String, maxlength: 500 },
      en: { type: String, maxlength: 500 },
      tr: { type: String, maxlength: 500 },
    },
    coverImage: { type: String },
    photos: [photoSchema],
    category: { type: String, trim: true },
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
albumSchema.index({ category: 1 });
albumSchema.index({ order: 1 });
albumSchema.index({ isPublished: 1 });

/* ----------------------------- Pre-validate ----------------------------- */
albumSchema.pre<IAlbum>('validate', function (next) {
  if (this.title?.en && (!this.slug || this.isModified('title.en'))) {
    this.slug = createSlug(this.title.en) + '-' + Date.now().toString(36);
  }
  next();
});

const Album = mongoose.model<IAlbum, IAlbumModel>('Album', albumSchema);

export default Album;
