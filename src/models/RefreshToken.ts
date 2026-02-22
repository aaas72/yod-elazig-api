import mongoose, { Document, Model, Schema } from 'mongoose';

/* ----------------------------- Interface ----------------------------- */
export interface IRefreshToken extends Document {
  token: string;
  user: mongoose.Types.ObjectId;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IRefreshTokenModel extends Model<IRefreshToken> {}

/* ----------------------------- Schema ----------------------------- */
const refreshTokenSchema = new Schema<IRefreshToken, IRefreshTokenModel>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

/* ----------------------------- Indexes ----------------------------- */
refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const RefreshToken = mongoose.model<IRefreshToken, IRefreshTokenModel>(
  'RefreshToken',
  refreshTokenSchema,
);

export default RefreshToken;
