import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface IVolunteer extends Document {
  name: string;
  email: string;
  phone: string;
  university?: string;
  department?: string;
  yearOfStudy?: number;
  skills: string[];
  motivation: string;
  availableHours?: number;
  status: 'pending' | 'accepted' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IVolunteerModel extends Model<IVolunteer> {}

/* ----------------------------- Schema ----------------------------- */
const volunteerSchema = new Schema<IVolunteer, IVolunteerModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    university: { type: String, trim: true },
    department: { type: String, trim: true },
    yearOfStudy: { type: Number, min: 1, max: 8 },
    skills: [{ type: String, trim: true }],
    motivation: {
      type: String,
      required: [true, 'Motivation is required'],
      maxlength: [2000, 'Motivation cannot exceed 2000 characters'],
    },
    availableHours: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: { type: Date },
    reviewNote: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ----------------------------- Indexes ----------------------------- */
volunteerSchema.index({ status: 1 });
volunteerSchema.index({ email: 1 });
volunteerSchema.index({ createdAt: -1 });

const Volunteer = mongoose.model<IVolunteer, IVolunteerModel>('Volunteer', volunteerSchema);

export default Volunteer;
