import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface IStudentAchievement extends Document {
  studentName: {
    ar: string;
    en: string;
    tr: string;
  };
  description: {
    ar: string;
    en: string;
    tr: string;
  };
  category: {
    ar: string;
    en: string;
    tr: string;
  };
  image?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IStudentAchievementModel extends Model<IStudentAchievement> {}

/* ----------------------------- Schema ----------------------------- */
const studentAchievementSchema = new Schema<IStudentAchievement, IStudentAchievementModel>(
  {
    studentName: {
      ar: { type: String, required: [true, 'Arabic student name is required'], trim: true, maxlength: 200 },
      en: { type: String, required: [true, 'English student name is required'], trim: true, maxlength: 200 },
      tr: { type: String, required: [true, 'Turkish student name is required'], trim: true, maxlength: 200 },
    },
    description: {
      ar: { type: String, required: [true, 'Arabic description is required'] },
      en: { type: String, required: [true, 'English description is required'] },
      tr: { type: String, required: [true, 'Turkish description is required'] },
    },
    category: {
      ar: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
      tr: { type: String, trim: true, default: '' },
    },
    image: { type: String },
    socialLinks: {
      facebook: { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
    },
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
studentAchievementSchema.index({ order: 1 });
studentAchievementSchema.index({ isPublished: 1 });

const StudentAchievement = mongoose.model<IStudentAchievement, IStudentAchievementModel>(
  'StudentAchievement',
  studentAchievementSchema,
);

export default StudentAchievement;
