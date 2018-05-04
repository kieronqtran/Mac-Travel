import { Connection } from 'mongoose';
import { OrderSchema } from '../schemas/order.schema';

export const orderProvider = {
  provide: 'OrderModelToken',
  useFactory: (connection: Connection) => connection.model('orders', OrderSchema),
  inject: ['DbConnection'],
};
