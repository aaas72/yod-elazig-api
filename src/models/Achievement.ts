import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface IAchievement extends Document {
  title: {
    ar: string;
    en: string;
    tr: string;
  };
  description: {
    ar: string;
    en: string;
    tr: string;
  };
  image?: string;
  date?: Date;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IAchievementModel extends Model<IAchievement> {}

/* ----------------------------- Schema ----------------------------- */
const achievementSchema = new Schema<IAchievement, IAchievementModel>(
  {
    title: {
      ar: { type: String, required: [true, 'Arabic title is required'], trim: true, maxlength: 200 },
      en: { type: String, required: [true, 'English title is required'], trim: true, maxlength: 200 },
      tr: { type: String, required: [true, 'Turkish title is required'], trim: true, maxlength: 200 },
    },
    description: {
      ar: { type: String, required: [true, 'Arabic description is required'] },
      en: { type: String, required: [true, 'English description is required'] },
      tr: { type: String, required: [true, 'Turkish description is required'] },
    },
    image: { type: String },
    date: { type: Date },
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
achievementSchema.index({ order: 1 });
achievementSchema.index({ isPublished: 1 });

const Achievement = mongoose.model<IAchievement, IAchievementModel>('Achievement', achievementSchema);

export default Achievement;
