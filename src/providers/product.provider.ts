import { Connection } from 'mongoose';
import { ProductSchema } from '../schemas/product.schema';

export const productProvider = {
  provide: 'ProductModelToken',
  useFactory: (connection: Connection) => connection.model('products', ProductSchema),
  inject: ['DbConnection'],
};
