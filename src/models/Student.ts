import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface IStudent extends Document {
  user: mongoose.Types.ObjectId;
  studentId: string;
  university?: string;
  department?: string;
  yearOfStudy?: number;
  phone?: string;
  nationality?: string;
  address?: string;
  enrollmentDate: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IStudentModel extends Model<IStudent> {}

/* ----------------------------- Schema ----------------------------- */
const studentSchema = new Schema<IStudent, IStudentModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: String,
      unique: true,
      trim: true,
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
    phone: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
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
studentSchema.index({ user: 1 });
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
