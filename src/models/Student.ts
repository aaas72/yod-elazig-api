import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface IStudent extends Document {
  studentId: string;
  fullName: string;
  fullNameEn: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: Date;
  phoneNumber: string;
  email: string;
  tcNumber: string;
  profileImage?: string;
  studentDocument?: string;
  files?: string[];
  university?: string;
  department?: string;
  yearOfStudy?: number;
  address?: string;
  enrollmentDate: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IStudentModel extends Model<IStudent> { }

/* ----------------------------- Schema ----------------------------- */
const studentSchema = new Schema<IStudent, IStudentModel>(
  {
    studentId: {
      type: String,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    fullNameEn: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    tcNumber: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    studentDocument: {
      type: String,
      trim: true,
    },
    files: {
      type: [String],
      default: [],
    },
    university: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    yearOfStudy: {
      type: Number,
      min: 1,
      max: 8,
    },
    address: {
      type: String,
      trim: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ----------------------------- Indexes ----------------------------- */
studentSchema.index({ isActive: 1 });

/* ----------------------------- Pre-save ----------------------------- */
studentSchema.pre<IStudent>('save', async function (next) {
  if (!this.studentId) {
    const count = await mongoose.model('Student').countDocuments();
    this.studentId = `STU-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

const Student = mongoose.model<IStudent, IStudentModel>('Student', studentSchema);

export default Student;
