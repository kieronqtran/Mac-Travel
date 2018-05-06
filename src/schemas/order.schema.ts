import { Schema, Document, SchemaTypeOpts } from 'mongoose';
import { UserSchema, ProductSchema } from './index';
import { User, Product } from '../interfaces';

export const OrderDetailSchema = new Schema({
  quantity: Number,
  total_price: Number,
  product: { type: Schema.Types.ObjectId, ref: 'products' },
});

export const ShippingAddressSchema = new Schema({
  customer_name: String,
  city: String,
  postal_code: String,
  state: String,
  street: String,
  country: String,
});

export const OrderSchema = new Schema(
  {
    payment_type: String,
    currency: String,
    subtotal: Number,
    shipping_cost: Number,
    total_cost: Number,
    total_tax: Number,
    checkouted: { type: Boolean, default: false },
    checkout_time: { type: Schema.Types.Date, max: Date.now },
    order_user: { type: Schema.Types.ObjectId, ref: 'users' },
    order_details: [OrderDetailSchema],
    shipping_address: ShippingAddressSchema,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);
