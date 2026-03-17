import mongoose, { Document, Model, Schema } from 'mongoose';
import { createSlug } from '../utils/slugify';

/* ----------------------------- Interface ----------------------------- */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  coverImage?: string;
  capacity: number;
  organizer: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
  tags: string[];
  isActive: boolean;
  isPublished: boolean;
  registrationDeadline?: Date;
  isUpcoming: boolean; // virtual
  translations: {
    ar: { title?: string; description?: string; location?: string; tags?: string[] };
    en: { title?: string; description?: string; location?: string; tags?: string[] };
    tr: { title?: string; description?: string; location?: string; tags?: string[] };
  };
  createdAt: Date;
  updatedAt: Date;
}

interface IEventModel extends Model<IEvent> {}

/* ----------------------------- Schema ----------------------------- */
const eventSchema = new Schema<IEvent, IEventModel>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
    },
    capacity: {
      type: Number,
      default: 0,
      min: 0,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    registrationDeadline: {
      type: Date,
    },
    translations: {
      ar: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        location: { type: String, default: '' },
        tags: [{ type: String, trim: true }],
      },
      en: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        location: { type: String, default: '' },
        tags: [{ type: String, trim: true }],
      },
      tr: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        location: { type: String, default: '' },
        tags: [{ type: String, trim: true }],
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
eventSchema.index({ startDate: 1, isActive: 1 });
eventSchema.index({ tags: 1 });

/* ----------------------------- Virtuals ----------------------------- */
eventSchema.virtual('isUpcoming').get(function (this: IEvent) {
  return this.startDate > new Date();
});

/* ----------------------------- Pre-validate ----------------------------- */
eventSchema.pre<IEvent>('validate', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = createSlug(this.title) + '-' + Date.now().toString(36);
  }
  next();
});

const Event = mongoose.model<IEvent, IEventModel>('Event', eventSchema);

export default Event;
