import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface IBoardMember extends Document {
  name: {
    ar: string;
    en: string;
    tr: string;
  };
  position: {
    ar: string;
    en: string;
    tr: string;
  };
  department: {
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
  type: 'executive' | 'organizational';
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IBoardMemberModel extends Model<IBoardMember> {}

/* ----------------------------- Schema ----------------------------- */
const boardMemberSchema = new Schema<IBoardMember, IBoardMemberModel>(
  {
    name: {
      ar: { type: String, required: [true, 'Arabic name is required'], trim: true, maxlength: 200 },
      en: { type: String, required: [true, 'English name is required'], trim: true, maxlength: 200 },
      tr: { type: String, required: [true, 'Turkish name is required'], trim: true, maxlength: 200 },
    },
    position: {
      ar: { type: String, required: [true, 'Arabic position is required'], trim: true, maxlength: 200 },
      en: { type: String, required: [true, 'English position is required'], trim: true, maxlength: 200 },
      tr: { type: String, required: [true, 'Turkish position is required'], trim: true, maxlength: 200 },
    },
    department: {
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
    type: { type: String, enum: ['executive', 'organizational'], required: [true, 'Type is required'] },
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
boardMemberSchema.index({ order: 1 });
boardMemberSchema.index({ isPublished: 1 });
boardMemberSchema.index({ type: 1 });

const BoardMember = mongoose.model<IBoardMember, IBoardMemberModel>(
  'BoardMember',
  boardMemberSchema,
);

export default BoardMember;
