import { Schema, Document } from 'mongoose';
import { UserSchema } from './index';
import { User } from '../interfaces';

export const OrderDetailSchema = new Schema({
  quantity: Number,
  total_price: Number,
  product: UserSchema,
});

export const ShippingAddressSchema = new Schema({
  customer_name: String,
  city: String,
  postal_code: String,
  state: String,
  street: String,
  country: String,
});

export const OrderSchema = new Schema({
  payment_type: String,
  currency: String,
  subtotal: Number,
  shipping_cost: Number,
  total_cost: Number,
  total_tax: Number,
  checkouted: Boolean,
  checkoutTime: String,
  updatedTime: Number,
  createdTime: Number,
  order_user: UserSchema,
  order_details: [OrderDetailSchema],
  shipping_address: ShippingAddressSchema,
});
