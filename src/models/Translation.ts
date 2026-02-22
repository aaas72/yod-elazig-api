import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface ITranslation extends Document {
  lang: 'ar' | 'en' | 'tr';
  namespace: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ITranslationModel extends Model<ITranslation> {}

/* ----------------------------- Schema ----------------------------- */
const translationSchema = new Schema<ITranslation, ITranslationModel>(
  {
    lang: {
      type: String,
      required: true,
      enum: ['ar', 'en', 'tr'],
    },
    namespace: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

/* ----------------------------- Indexes ----------------------------- */
translationSchema.index({ lang: 1, namespace: 1, key: 1 }, { unique: true });
translationSchema.index({ lang: 1 });

const Translation = mongoose.model<ITranslation, ITranslationModel>('Translation', translationSchema);

export default Translation;
