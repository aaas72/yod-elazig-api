import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface ITicker extends Document {
  text: {
    ar: string;
    en: string;
    tr: string;
  };
  url?: string;
  image?: string;
  order: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ITickerModel extends Model<ITicker> {}

/* ----------------------------- Schema ----------------------------- */
const tickerSchema = new Schema<ITicker, ITickerModel>(
  {
    text: {
      ar: { type: String, required: [true, 'Arabic text is required'], trim: true, maxlength: 300 },
      en: { type: String, required: [true, 'English text is required'], trim: true, maxlength: 300 },
      tr: { type: String, required: [true, 'Turkish text is required'], trim: true, maxlength: 300 },
    },
    url: { type: String, trim: true },
    image: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ----------------------------- Indexes ----------------------------- */
tickerSchema.index({ isActive: 1, order: 1 });

const Ticker = mongoose.model<ITicker, ITickerModel>('Ticker', tickerSchema);

export default Ticker;
