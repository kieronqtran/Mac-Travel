import { Document } from 'mongoose';
import { User, Product } from './index';

export interface OrderDetail {
  quantity: number;
  total_price: number;
  product: Product;
}

export interface ShippingAddress {
  customer_name: string;
  city: string;
  postal_code: string;
  state: string;
  street: string;
  country: string;
}

export interface Order extends Document {
  payment_type: string;
  currency: string;
  subtotal: number;
  shipping_cost: number;
  total_cost: number;
  total_tax: number;
  checkouted: boolean;
  checkoutTime: string;
  updatedTime: number;
  createdTime: number;
  order_user: User;
  order_details: OrderDetail[];
  shipping_address: ShippingAddress;
}
