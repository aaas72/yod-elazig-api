import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface ISetting extends Document {
  key: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    telegram?: string;
    whatsapp?: string;
    linkedin?: string;
    tiktok?: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    address?: {
      ar?: string;
      en?: string;
      tr?: string;
    };
  };
  footer: {
    text?: {
      ar?: string;
      en?: string;
      tr?: string;
    };
    copyright?: {
      ar?: string;
      en?: string;
      tr?: string;
    };
  };
  logo?: string;
  favicon?: string;
  lastUpdatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface ISettingModel extends Model<ISetting> {}

/* ----------------------------- Schema ----------------------------- */
const settingSchema = new Schema<ISetting, ISettingModel>(
  {
    key: {
      type: String,
      default: 'general',
      unique: true,
    },
    socialLinks: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      twitter: { type: String, trim: true },
      youtube: { type: String, trim: true },
      telegram: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      tiktok: { type: String, trim: true },
    },
    contactInfo: {
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      address: {
        ar: { type: String, trim: true },
        en: { type: String, trim: true },
        tr: { type: String, trim: true },
      },
    },
    footer: {
      text: {
        ar: { type: String },
        en: { type: String },
        tr: { type: String },
      },
      copyright: {
        ar: { type: String },
        en: { type: String },
        tr: { type: String },
      },
    },
    logo: { type: String },
    favicon: { type: String },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Setting = mongoose.model<ISetting, ISettingModel>('Setting', settingSchema);

export default Setting;
