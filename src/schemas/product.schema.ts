import { Schema } from 'mongoose';

export const ProductSchema = new Schema(
  {
    name: String,
    type: String,
    item_url: String,
    image_url: String,
    unit_price: Number,
    currency: String,
    description: String,
    payload_name: String,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);
