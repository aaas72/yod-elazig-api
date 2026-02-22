import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface IMedia extends Document {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  folder?: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IMediaModel extends Model<IMedia> {}

/* ----------------------------- Schema ----------------------------- */
const mediaSchema = new Schema<IMedia, IMediaModel>(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: { type: String },
    alt: { type: String, trim: true },
    folder: { type: String, trim: true, default: 'general' },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ----------------------------- Indexes ----------------------------- */
mediaSchema.index({ folder: 1 });
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ mimetype: 1 });
mediaSchema.index({ createdAt: -1 });

const Media = mongoose.model<IMedia, IMediaModel>('Media', mediaSchema);

export default Media;
