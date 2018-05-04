import { Document } from 'mongoose';

export interface Product extends Document {
  name: string;
  type: string;
  item_url: string;
  image_url: string;
  unit_price: number;
  currency: string;
  description: string;
  payload_name: string;
}
