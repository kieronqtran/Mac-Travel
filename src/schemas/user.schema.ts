import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    facebook_id: String,
    first_name: String,
    last_name: String,
    timezone: Number,
    gender: String,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);
